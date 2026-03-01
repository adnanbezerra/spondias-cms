import { connect as connectTcp, type Socket } from "node:net";
import { connect as connectTls, type TLSSocket } from "node:tls";

type RateLimitBucket = { count: number; resetAt: number };
type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

type ConsumeRateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
};

const buckets = new Map<string, RateLimitBucket>();
let didWarnRedisFailure = false;

const pruneExpiredBuckets = (now: number): void => {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

const consumeInMemoryRateLimit = ({
  key,
  limit,
  windowMs,
}: ConsumeRateLimitInput): RateLimitResult => {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const currentBucket = buckets.get(key);
  if (!currentBucket || currentBucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
      remaining: Math.max(limit - 1, 0),
    };
  }
  if (currentBucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        Math.ceil((currentBucket.resetAt - now) / 1000),
        1,
      ),
      remaining: 0,
    };
  }
  currentBucket.count += 1;
  buckets.set(key, currentBucket);
  return {
    allowed: true,
    retryAfterSeconds: Math.max(
      Math.ceil((currentBucket.resetAt - now) / 1000),
      1,
    ),
    remaining: Math.max(limit - currentBucket.count, 0),
  };
};

const encodeRedisCommand = (args: string[]): string =>
  `*${args.length}\r\n${args
    .map((arg) => `$${Buffer.byteLength(arg)}\r\n${arg}\r\n`)
    .join("")}`;

const createSocket = (redisUrl: URL): Socket | TLSSocket => {
  const port =
    redisUrl.port.length > 0
      ? Number(redisUrl.port)
      : redisUrl.protocol === "rediss:"
        ? 6380
        : 6379;
  if (redisUrl.protocol === "rediss:") {
    return connectTls({
      host: redisUrl.hostname,
      port,
      servername: redisUrl.hostname,
    });
  }

  return connectTcp({
    host: redisUrl.hostname,
    port,
  });
};

const parseRedisIntegerReply = (reply: string): number => {
  if (!reply.startsWith(":")) {
    throw new Error("Resposta inesperada do Redis.");
  }

  return Number(reply.slice(1).trim());
};

const runRedisCommand = async (
  redisUrl: URL,
  commandArgs: string[],
): Promise<string> => {
  const db = redisUrl.pathname.replace("/", "").trim();
  const username = decodeURIComponent(redisUrl.username || "");
  const password = decodeURIComponent(redisUrl.password || "");
  const setupCommands: string[][] = [];

  if (password) {
    if (username) {
      setupCommands.push(["AUTH", username, password]);
    } else {
      setupCommands.push(["AUTH", password]);
    }
  }

  if (db) {
    setupCommands.push(["SELECT", db]);
  }

  const commands = [...setupCommands, commandArgs];
  const payload = commands.map((command) => encodeRedisCommand(command)).join("");

  return new Promise<string>((resolve, reject) => {
    const socket = createSocket(redisUrl);
    let buffer = "";
    let replyCount = 0;
    let lastReply = "";
    let settled = false;

    const finish = (fn: () => void): void => {
      if (settled) return;
      settled = true;
      socket.removeAllListeners();
      socket.end();
      fn();
    };

    const onError = (error: unknown): void => {
      finish(() =>
        reject(error instanceof Error ? error : new Error("Erro no Redis.")),
      );
    };

    socket.setTimeout(2000, () => onError(new Error("Timeout no Redis.")));
    socket.on("error", onError);
    socket.on("connect", () => {
      socket.write(payload);
    });
    socket.on("data", (chunk: Buffer | string) => {
      buffer += chunk.toString();

      while (true) {
        const lineBreakIndex = buffer.indexOf("\r\n");
        if (lineBreakIndex < 0) return;

        const line = buffer.slice(0, lineBreakIndex + 2);
        const prefix = line[0];
        if (!prefix) return;

        if (prefix === "-" || prefix === "+" || prefix === ":") {
          buffer = buffer.slice(lineBreakIndex + 2);
          if (prefix === "-") {
            return onError(new Error(`Redis respondeu erro: ${line.slice(1).trim()}`));
          }

          lastReply = line.trim();
          replyCount += 1;
          if (replyCount === commands.length) {
            return finish(() => resolve(lastReply));
          }
          continue;
        }

        return onError(new Error("Tipo de resposta Redis não suportado."));
      }
    });
  });
};

const consumeRedisRateLimit = async ({
  key,
  limit,
  windowMs,
}: ConsumeRateLimitInput): Promise<RateLimitResult> => {
  const redisUrlRaw = process.env.REDIS_URL;
  if (!redisUrlRaw) {
    return consumeInMemoryRateLimit({ key, limit, windowMs });
  }

  const redisUrl = new URL(redisUrlRaw);
  const countReply = await runRedisCommand(redisUrl, ["INCR", key]);
  const count = parseRedisIntegerReply(countReply);

  let ttlInMs = windowMs;
  if (count === 1) {
    await runRedisCommand(redisUrl, ["PEXPIRE", key, String(windowMs)]);
  } else {
    const ttlReply = await runRedisCommand(redisUrl, ["PTTL", key]);
    ttlInMs = Math.max(parseRedisIntegerReply(ttlReply), 1);
  }

  return {
    allowed: count <= limit,
    retryAfterSeconds: Math.max(Math.ceil(ttlInMs / 1000), 1),
    remaining: Math.max(limit - count, 0),
  };
};

export const consumeRateLimit = async (
  input: ConsumeRateLimitInput,
): Promise<RateLimitResult> => {
  try {
    return await consumeRedisRateLimit(input);
  } catch (error) {
    if (!didWarnRedisFailure) {
      didWarnRedisFailure = true;
      console.warn(
        "Rate limit Redis indisponível. Fallback para memória local.",
        error,
      );
    }

    return consumeInMemoryRateLimit(input);
  }
};

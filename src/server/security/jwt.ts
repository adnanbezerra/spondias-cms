import { createHmac, timingSafeEqual } from "node:crypto";
import { UnauthorizedError } from "@/src/server/shared/errors";

type JwtPayload = {
  sub: string;
  email: string;
  role: "admin";
  exp: number;
};

const encodeBase64Url = (input: string): string =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const decodeBase64Url = (input: string): string => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
};

const sign = (data: string, secret: string): string =>
  createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não configurado.");
  }

  return secret;
};

export const signJwt = (
  payload: Omit<JwtPayload, "exp">,
  expiresInSeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 86400),
): string => {
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload: JwtPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(fullPayload));
  const content = `${encodedHeader}.${encodedPayload}`;
  const signature = sign(content, getSecret());

  return `${content}.${signature}`;
};

export const verifyJwt = (token: string): JwtPayload => {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    throw new UnauthorizedError("Token inválido.");
  }

  const content = `${header}.${payload}`;
  const expectedSignature = sign(content, getSecret());

  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new UnauthorizedError("Assinatura inválida.");
  }

  const parsedPayload = JSON.parse(decodeBase64Url(payload)) as JwtPayload;

  if (!parsedPayload.exp || parsedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new UnauthorizedError("Token expirado.");
  }

  return parsedPayload;
};

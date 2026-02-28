import { UnauthorizedError } from "@/src/server/shared/errors";

type JwtPayload = {
  sub: string;
  email: string;
  role: "admin";
  exp: number;
};

const decodeBase64Url = (input: string): string => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
};

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new UnauthorizedError("Configuração de autenticação inválida.");
  }
  return secret;
};

const createKey = async (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

const decodeBase64UrlToArrayBuffer = (input: string): ArrayBuffer => {
  const decoded = decodeBase64Url(input);
  const bytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
};

export const verifyJwtEdge = async (token: string): Promise<JwtPayload> => {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    throw new UnauthorizedError("Token inválido.");
  }

  const key = await createKey(getSecret());
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    decodeBase64UrlToArrayBuffer(signature),
    new TextEncoder().encode(`${header}.${payload}`),
  );

  if (!isValid) {
    throw new UnauthorizedError("Assinatura inválida.");
  }

  const parsedPayload = JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  if (!parsedPayload.exp || parsedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new UnauthorizedError("Token expirado.");
  }

  return parsedPayload;
};

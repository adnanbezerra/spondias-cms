import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export const hashPassword = (plainPassword: string): string => {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(plainPassword, salt, KEY_LENGTH).toString("hex");
    return `${salt}:${hash}`;
};

export const comparePassword = (
    plainPassword: string,
    hashedPassword: string,
): boolean => {
    const [salt, storedHash] = hashedPassword.split(":");

    if (!salt || !storedHash) {
        return false;
    }

    const derivedHash = scryptSync(plainPassword, salt, KEY_LENGTH);
    const storedHashBuffer = Buffer.from(storedHash, "hex");

    if (derivedHash.length !== storedHashBuffer.length) {
        return false;
    }

    return timingSafeEqual(derivedHash, storedHashBuffer);
};

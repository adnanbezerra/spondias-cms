export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly code: string,
    ) {
        super(message);
        this.name = "AppError";
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, "VALIDATION_ERROR");
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, "CONFLICT");
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Não autorizado") {
        super(message, 401, "UNAUTHORIZED");
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404, "NOT_FOUND");
    }
}

export class TooManyRequestsError extends AppError {
    constructor(message = "Muitas requisições. Tente novamente em instantes.") {
        super(message, 429, "TOO_MANY_REQUESTS");
    }
}

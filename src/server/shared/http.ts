import { ZodError } from "zod";
import { AppError } from "@/src/server/shared/errors";

export const toErrorResponse = (error: unknown): Response => {
    if (error instanceof ZodError) {
        return Response.json(
            {
                code: "VALIDATION_ERROR",
                message: "Payload inválido.",
                issues: error.issues,
            },
            { status: 400 },
        );
    }

    if (error instanceof AppError) {
        return Response.json(
            {
                code: error.code,
                message: error.message,
            },
            { status: error.statusCode },
        );
    }

    if (error instanceof Error) {
        console.error("[http] Erro não tratado:", error);
        return Response.json(
            {
                code: "INTERNAL_ERROR",
                message: error.message,
            },
            { status: 500 },
        );
    }

    return Response.json(
        {
            code: "INTERNAL_ERROR",
            message: "Erro interno ao processar requisição.",
        },
        { status: 500 },
    );
};

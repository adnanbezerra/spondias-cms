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

  return Response.json(
    {
      code: "INTERNAL_ERROR",
      message: "Erro interno ao processar requisição.",
    },
    { status: 500 },
  );
};

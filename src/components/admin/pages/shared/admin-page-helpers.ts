import type { Dispatch, SetStateAction } from "react";

type ShowToast = (
    message: string,
    options?: { variant?: "success" | "error" | "info"; durationMs?: number },
) => void;

type HandlePageErrorParams = {
    error: unknown;
    showToast: ShowToast;
    toastMessage: string;
    fallbackMessage: string;
    setErrorMessage?: Dispatch<SetStateAction<string | null>>;
};

export const getErrorMessage = (
    error: unknown,
    fallbackMessage: string,
): string => {
    return error instanceof Error ? error.message : fallbackMessage;
};

export const handlePageError = ({
    error,
    showToast,
    toastMessage,
    fallbackMessage,
    setErrorMessage,
}: HandlePageErrorParams): void => {
    showToast(toastMessage, { variant: "error" });
    if (setErrorMessage) {
        setErrorMessage(getErrorMessage(error, fallbackMessage));
    }
};

export const toggleStringInList = (
    current: string[],
    value: string,
): string[] => {
    return current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
};

export const confirmDestructiveAction = (message: string): boolean => {
    return window.confirm(message);
};

export const runWithSubmittingState = async (
    setSubmitting: Dispatch<SetStateAction<boolean>>,
    action: () => Promise<void>,
): Promise<void> => {
    setSubmitting(true);
    try {
        await action();
    } finally {
        setSubmitting(false);
    }
};

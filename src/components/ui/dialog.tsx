"use client";

import {
    cloneElement,
    createContext,
    isValidElement,
    useContext,
    useEffect,
    useState,
    type HTMLAttributes,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const cx = (...classNames: Array<string | undefined>) =>
    classNames.filter(Boolean).join(" ");

type DialogContextValue = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

const useDialogContext = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error("Dialog components must be used inside <Dialog />.");
    }
    return context;
};

type DialogProps = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
};

export function Dialog({
    open,
    defaultOpen = false,
    onOpenChange,
    children,
}: DialogProps) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = typeof open === "boolean";
    const currentOpen = isControlled ? open : internalOpen;

    const setOpen = (nextOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
    };

    return (
        <DialogContext.Provider
            value={{
                open: currentOpen,
                onOpenChange: setOpen,
            }}
        >
            {children}
        </DialogContext.Provider>
    );
}

type DialogTriggerProps = {
    asChild?: boolean;
    children: ReactNode;
};

export function DialogTrigger({ asChild = false, children }: DialogTriggerProps) {
    const { onOpenChange } = useDialogContext();

    if (asChild) {
        if (!isValidElement<{ onClick?: () => void }>(children)) {
            return null;
        }
        return cloneElement(children, {
            onClick: () => {
                children.props.onClick?.();
                onOpenChange(true);
            },
        });
    }

    return (
        <button
            type="button"
            onClick={() => onOpenChange(true)}
            className="inline-flex items-center justify-center rounded-md"
        >
            {children}
        </button>
    );
}

type DialogPortalProps = { children: ReactNode };

export function DialogPortal({ children }: DialogPortalProps) {
    if (typeof window === "undefined") return null;
    return createPortal(children, document.body);
}

export function DialogOverlay({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { open, onOpenChange } = useDialogContext();
    if (!open) return null;

    return (
        <DialogPortal>
            <div
                role="button"
                tabIndex={0}
                onClick={() => onOpenChange(false)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        onOpenChange(false);
                    }
                }}
                className={cx(
                    "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
                    className,
                )}
                {...props}
            />
        </DialogPortal>
    );
}

type DialogContentProps = HTMLAttributes<HTMLDivElement> & {
    onEscapeKeyDown?: () => void;
};

export function DialogContent({
    className,
    children,
    onEscapeKeyDown,
    ...props
}: DialogContentProps) {
    const { open, onOpenChange } = useDialogContext();

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onEscapeKeyDown?.();
                onOpenChange(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onEscapeKeyDown, onOpenChange, open]);

    if (!open) return null;

    return (
        <DialogPortal>
            <div className="fixed inset-0 z-50 grid place-items-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    className={cx(
                        "w-full max-w-lg rounded-2xl border border-[#DBD7CB]/70 bg-white shadow-2xl",
                        className,
                    )}
                    {...props}
                >
                    {children}
                </div>
            </div>
        </DialogPortal>
    );
}

type DialogCloseProps = {
    asChild?: boolean;
    children: ReactNode;
};

export function DialogClose({ asChild = false, children }: DialogCloseProps) {
    const { onOpenChange } = useDialogContext();

    if (asChild) {
        if (!isValidElement<{ onClick?: () => void }>(children)) {
            return null;
        }
        return cloneElement(children, {
            onClick: () => {
                children.props.onClick?.();
                onOpenChange(false);
            },
        });
    }

    return (
        <button type="button" onClick={() => onOpenChange(false)}>
            {children}
        </button>
    );
}

export function DialogHeader({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cx(
                "flex flex-col gap-1.5 border-b border-[#334D40]/10 px-6 py-4",
                className,
            )}
            {...props}
        />
    );
}

export function DialogFooter({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cx(
                "flex items-center justify-end gap-2 border-t border-[#334D40]/10 bg-[#F8F7F3] px-6 py-4",
                className,
            )}
            {...props}
        />
    );
}

export function DialogTitle({
    className,
    ...props
}: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2
            className={cx(
                "text-xl font-semibold text-[#334D40] [font-family:var(--font-title)]",
                className,
            )}
            {...props}
        />
    );
}

export function DialogDescription({
    className,
    ...props
}: HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={cx("text-sm text-[#334D40]/80", className)} {...props} />
    );
}

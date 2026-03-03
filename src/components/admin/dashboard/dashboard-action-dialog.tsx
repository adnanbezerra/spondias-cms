"use client";

import { type ReactNode } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/dialog";

type DashboardActionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger?: ReactNode;
    title: string;
    description: string;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isSubmitting: boolean;
    submitLabel: string;
    children: ReactNode;
};

export const DashboardActionDialog = ({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    onSubmit,
    isSubmitting,
    submitLabel,
    children,
}: DashboardActionDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
            <DialogOverlay />
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 px-6 py-5">{children}</div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <button
                                type="button"
                                className="rounded-xl border border-[#334D40]/20 px-4 py-2 text-sm"
                            >
                                Cancelar
                            </button>
                        </DialogClose>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl bg-[#334D40] px-4 py-2 text-sm font-semibold text-[#DBD7CB] disabled:opacity-60"
                        >
                            {isSubmitting ? "Salvando..." : submitLabel}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

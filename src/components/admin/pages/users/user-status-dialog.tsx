"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from "@/src/components/ui/dialog";

type UserStatusDialogProps = {
    open: boolean;
    userName: string;
    nextIsActive: boolean;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
};

export function UserStatusDialog({
    open,
    userName,
    nextIsActive,
    isSubmitting,
    onOpenChange,
    onConfirm,
}: UserStatusDialogProps) {
    const actionLabel = nextIsActive ? "ativar" : "desativar";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirmar ação</DialogTitle>
                    <DialogDescription>
                        Deseja realmente {actionLabel} o usuário {userName}?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl border border-[#334D40]/20 px-4 py-2 text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            void onConfirm();
                        }}
                        disabled={isSubmitting}
                        className="rounded-xl bg-[#334D40] px-4 py-2 text-sm font-semibold text-[#DBD7CB] disabled:opacity-60"
                    >
                        {isSubmitting
                            ? "Salvando..."
                            : nextIsActive
                              ? "Ativar usuário"
                              : "Desativar usuário"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

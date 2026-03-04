"use client";

import type { AdminSection } from "@/src/components/admin/admin-api";

type SectionsListProps = {
    sections: AdminSection[];
    selectedPreviewSectionId: string | null;
    onSelectPreview: (sectionId: string) => void;
    onMoveSection: (sectionId: string, direction: "up" | "down") => void;
    onEditSection: (sectionId: string) => void;
    onDeleteSection: (sectionId: string) => void;
};

export function SectionsList({
    sections,
    selectedPreviewSectionId,
    onSelectPreview,
    onMoveSection,
    onEditSection,
    onDeleteSection,
}: SectionsListProps) {
    if (sections.length === 0) {
        return (
            <div className="rounded-2xl border border-[#334D40]/15 bg-white/85 p-5">
                <p className="text-sm text-[#334D40]/80">
                    Nenhuma seção cadastrada.
                </p>
            </div>
        );
    }

    return (
        <>
            {sections.map((section, index) => (
                <article
                    key={section.id}
                    className={
                        selectedPreviewSectionId === section.id
                            ? "rounded-2xl border border-[#334D40] bg-white p-4 shadow-sm"
                            : "rounded-2xl border border-[#334D40]/15 bg-white/90 p-4"
                    }
                >
                    <div className="flex items-start justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => onSelectPreview(section.id)}
                            className="flex-1 text-left"
                        >
                            <p className="font-semibold">{section.name}</p>
                            <p className="text-xs text-[#334D40]/70">
                                Ordem {section.order} ·{" "}
                                {section.isBanner
                                    ? "Banner"
                                    : "Seção comum"} ·{" "}
                                {section.isActive ? "Ativa" : "Inativa"}
                            </p>
                        </button>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => onMoveSection(section.id, "up")}
                                disabled={index === 0}
                                className="rounded-lg border border-[#334D40]/20 px-2 py-1 text-xs disabled:opacity-40"
                            >
                                ↑
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    onMoveSection(section.id, "down")
                                }
                                disabled={index === sections.length - 1}
                                className="rounded-lg border border-[#334D40]/20 px-2 py-1 text-xs disabled:opacity-40"
                            >
                                ↓
                            </button>
                            <button
                                type="button"
                                onClick={() => onEditSection(section.id)}
                                className="rounded-lg border border-[#334D40]/20 px-2 py-1 text-xs"
                            >
                                Editar
                            </button>
                            <button
                                type="button"
                                onClick={() => onDeleteSection(section.id)}
                                className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </article>
            ))}
        </>
    );
}

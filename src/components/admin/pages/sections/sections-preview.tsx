import type { AdminSection } from "@/src/components/admin/admin-api";
import type { SectionCategoriesMap } from "./section-types";

type SectionsPreviewProps = {
    sections: AdminSection[];
    sectionCategories: SectionCategoriesMap;
    categoryMap: Map<string, string>;
};

export function SectionsPreview({
    sections,
    sectionCategories,
    categoryMap,
}: SectionsPreviewProps) {
    return (
        <div className="rounded-3xl border border-[#334D40]/15 bg-white p-4 shadow-sm">
            <header className="mb-4 border-b border-[#334D40]/10 pb-3">
                <h2 className="text-2xl font-semibold [font-family:var(--font-title)]">
                    Prévia da Vitrine
                </h2>
                <p className="text-xs text-[#334D40]/75">
                    Simulação da ordem e estrutura da home pública.
                </p>
            </header>

            <div className="space-y-4">
                {sections.length === 0 ? (
                    <p className="text-sm text-[#334D40]/80">
                        Ative seções para visualizar a prévia.
                    </p>
                ) : (
                    sections.map((section) => (
                        <article
                            key={section.id}
                            className="rounded-2xl border border-[#334D40]/10 bg-[#FAFAF8] p-3"
                        >
                            <h3 className="font-semibold">{section.name}</h3>
                            <p className="mt-1 text-xs text-[#334D40]/70">
                                {section.isBanner
                                    ? "Banner principal da página"
                                    : "Grade de produtos da seção"}
                            </p>

                            {section.isBanner ? (
                                <div className="mt-3 h-20 rounded-xl border border-[#334D40]/15 bg-gradient-to-r from-[#DBD7CB] to-[#ECE9E2] px-3 py-2 text-xs">
                                    {section.bannerImg
                                        ? "Banner com imagem configurada"
                                        : "Banner sem imagem definida"}
                                </div>
                            ) : (
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <div className="h-14 rounded-lg border border-[#334D40]/15 bg-white" />
                                    <div className="h-14 rounded-lg border border-[#334D40]/15 bg-white" />
                                </div>
                            )}

                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {(sectionCategories[section.id] ?? []).length ===
                                0 ? (
                                    <span className="rounded-full bg-[#334D40]/8 px-2 py-1 text-xs text-[#334D40]/75">
                                        Sem categorias vinculadas
                                    </span>
                                ) : (
                                    (sectionCategories[section.id] ?? []).map(
                                        (categoryId) => (
                                            <span
                                                key={categoryId}
                                                className="rounded-full bg-[#DBD7CB] px-2 py-1 text-xs"
                                            >
                                                {categoryMap.get(categoryId) ??
                                                    "Categoria"}
                                            </span>
                                        ),
                                    )
                                )}
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}

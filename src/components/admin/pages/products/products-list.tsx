"use client";

import type { AdminProduct } from "@/src/components/admin/admin-api";

type ProductsListProps = {
    products: AdminProduct[];
    categoryMap: Map<string, string>;
    onEditProduct: (productId: string) => void;
    onDeleteProduct: (productId: string) => void;
};

export function ProductsList({
    products,
    categoryMap,
    onEditProduct,
    onDeleteProduct,
}: ProductsListProps) {
    if (products.length === 0) {
        return (
            <p className="text-sm text-[#334D40]/80">
                Nenhum produto cadastrado.
            </p>
        );
    }

    return (
        <>
            {products.map((product) => (
                <article
                    key={product.id}
                    className="rounded-xl border border-[#334D40]/15 bg-white p-3"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#334D40]/15 bg-[#F8F7F3]">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={`Imagem do produto ${product.name}`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[10px] text-[#334D40]/55">
                                        Sem foto
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-xs text-[#334D40]/75">
                                    Preço: R${" "}
                                    {(product.price / 100)
                                        .toFixed(2)
                                        .replace(".", ",")}{" "}
                                    {" · "} Estoque: {product.stock}
                                </p>
                                <p className="text-xs text-[#334D40]/75">
                                    Desconto: {product.discountPercentage}%{" "}
                                    {" · "}{" "}
                                    {product.isActive ? "Ativo" : "Inativo"}
                                </p>
                                <p className="text-xs text-[#334D40]/75">
                                    Categorias:{" "}
                                    {product.categoryIds.length > 0
                                        ? product.categoryIds
                                              .map(
                                                  (id) =>
                                                      categoryMap.get(id) ??
                                                      "Categoria",
                                              )
                                              .join(", ")
                                        : "Sem categoria"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onEditProduct(product.id)}
                                className="rounded-lg border border-[#334D40]/20 px-2 py-1 text-xs"
                            >
                                Editar
                            </button>
                            <button
                                type="button"
                                onClick={() => onDeleteProduct(product.id)}
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

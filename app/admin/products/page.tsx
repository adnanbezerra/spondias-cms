"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/src/components/admin/admin-nav";
import { useAdminToast } from "@/src/components/admin/admin-toast";
import { fetchJson, uploadImage, type AdminProduct, type AdminSection } from "@/src/components/admin/admin-api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [sections, setSections] = useState<AdminSection[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { showToast } = useAdminToast();

  const loadData = async () => {
    const [productsPayload, sectionsPayload] = await Promise.all([
      fetchJson<AdminProduct[]>("/api/admin/products"),
      fetchJson<AdminSection[]>("/api/admin/sections"),
    ]);

    setProducts(productsPayload);
    setSections(sectionsPayload.filter((section) => section.isActive));
  };

  useEffect(() => {
    loadData().catch(() => {
      setErrorMessage("Falha ao carregar dados de produtos.");
      showToast("Falha ao carregar dados de produtos.", { variant: "error" });
    });
  }, [showToast]);

  const resetForm = () => {
    setEditingProductId(null);
    setCurrentImageUrl(null);
    setName("");
    setPrice(0);
    setStock(0);
    setDiscountPercentage(0);
    setIsActive(true);
    setImageFile(null);
    setSelectedSectionIds([]);
  };

  const onEditProduct = async (productId: string) => {
    setErrorMessage(null);

    try {
      const [product, relation] = await Promise.all([
        fetchJson<AdminProduct>(`/api/admin/products/${productId}`),
        fetchJson<{ sectionIds: string[] }>(`/api/admin/products/${productId}/sections`),
      ]);

      setEditingProductId(product.id);
      setCurrentImageUrl(product.image);
      setName(product.name);
      setPrice(product.price);
      setStock(product.stock);
      setDiscountPercentage(product.discountPercentage);
      setIsActive(product.isActive);
      setImageFile(null);
      setSelectedSectionIds(relation.sectionIds);
    } catch (error) {
      showToast("Falha ao carregar produto para edição.", { variant: "error" });
      setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar produto.");
    }
  };

  const onToggleSection = (sectionId: string) => {
    setSelectedSectionIds((current) =>
      current.includes(sectionId)
        ? current.filter((item) => item !== sectionId)
        : [...current, sectionId],
    );
  };

  const onSubmitProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      let imageUrl = currentImageUrl;
      if (imageFile) {
        const upload = await uploadImage(imageFile);
        imageUrl = upload.url;
      }

      const productPayload = {
        name,
        price,
        stock,
        discountPercentage,
        isActive,
        image: imageUrl,
      };

      const product = editingProductId
        ? await fetchJson<AdminProduct>(`/api/admin/products/${editingProductId}`, {
            method: "PATCH",
            body: JSON.stringify(productPayload),
          })
        : await fetchJson<AdminProduct>("/api/admin/products", {
            method: "POST",
            body: JSON.stringify(productPayload),
          });

      await fetchJson<{ updated: true }>(`/api/admin/products/${product.id}/sections`, {
        method: "PUT",
        body: JSON.stringify({
          sectionIds: selectedSectionIds,
        }),
      });

      resetForm();
      await loadData();
      showToast(
        editingProductId ? "Produto atualizado com sucesso." : "Produto criado com sucesso.",
        { variant: "success" },
      );
    } catch (error) {
      showToast("Falha ao salvar produto.", { variant: "error" });
      setErrorMessage(error instanceof Error ? error.message : "Falha ao salvar produto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteProduct = async (productId: string) => {
    const approved = window.confirm("Deseja realmente excluir este produto?");
    if (!approved) return;

    try {
      await fetchJson<{ deleted: true }>(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      showToast("Produto excluído com sucesso.", { variant: "success" });
      if (editingProductId === productId) {
        resetForm();
      }
      await loadData();
    } catch (error) {
      showToast("Falha ao excluir produto.", { variant: "error" });
      setErrorMessage(error instanceof Error ? error.message : "Falha ao excluir produto.");
    }
  };

  return (
    <main>
      <AdminNav />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr,1.2fr]">
        <form
          onSubmit={onSubmitProduct}
          className="space-y-4 rounded-2xl border border-[#334D40]/15 bg-white/80 p-5 shadow-sm"
        >
          <h1 className="text-2xl font-semibold [font-family:var(--font-title)]">
            {editingProductId ? "Editar produto" : "Novo produto"}
          </h1>

          <div className="space-y-1">
            <label className="text-sm font-medium">Nome</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
              required
              minLength={2}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Preço (centavos)</label>
              <input
                type="number"
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                min={0}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Estoque</label>
              <input
                type="number"
                value={stock}
                onChange={(event) => setStock(Number(event.target.value))}
                className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                min={0}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Desconto (%)</label>
            <input
              type="number"
              value={discountPercentage}
              onChange={(event) => setDiscountPercentage(Number(event.target.value))}
              className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
              min={0}
              max={100}
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Produto ativo
          </label>

          <div className="space-y-1">
            <label className="text-sm font-medium">Imagem do produto</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setImageFile(event.target.files?.item(0) ?? null)}
              className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
            />
            {currentImageUrl ? (
              <p className="text-xs text-[#334D40]/75 break-all">
                Imagem atual: {currentImageUrl}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Seções do produto</p>
            <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border border-[#334D40]/15 bg-white p-2">
              {sections.length === 0 ? (
                <p className="text-sm text-[#334D40]/75">
                  Cadastre seções antes de criar vínculos.
                </p>
              ) : (
                sections.map((section) => (
                  <label key={section.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSectionIds.includes(section.id)}
                      onChange={() => onToggleSection(section.id)}
                    />
                    {section.name}
                  </label>
                ))
              )}
            </div>
          </div>

          {errorMessage ? (
            <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#334D40] px-4 py-2 font-semibold text-[#DBD7CB] disabled:opacity-70"
          >
            {isSubmitting
              ? "Salvando..."
              : editingProductId
                ? "Salvar alterações"
                : "Criar produto"}
          </button>
          {editingProductId ? (
            <button
              type="button"
              onClick={resetForm}
              className="ml-2 rounded-xl border border-[#334D40]/20 px-4 py-2 text-sm"
            >
              Cancelar edição
            </button>
          ) : null}
        </form>

        <div className="space-y-3 rounded-2xl border border-[#334D40]/15 bg-white/80 p-5 shadow-sm">
          <h2 className="text-xl font-semibold [font-family:var(--font-title)]">
            Produtos cadastrados
          </h2>
          {products.length === 0 ? (
            <p className="text-sm text-[#334D40]/80">Nenhum produto cadastrado.</p>
          ) : (
            products.map((product) => (
              <article
                key={product.id}
                className="rounded-xl border border-[#334D40]/15 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-[#334D40]/75">
                      Preço: {product.price} centavos · Estoque: {product.stock}
                    </p>
                    <p className="text-xs text-[#334D40]/75">
                      Desconto: {product.discountPercentage}% ·{" "}
                      {product.isActive ? "Ativo" : "Inativo"}
                    </p>
                    {product.image ? (
                      <p className="mt-1 text-xs text-[#334D40]/75 break-all">
                        Imagem: {product.image}
                      </p>
                    ) : null}
                  </div>
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
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

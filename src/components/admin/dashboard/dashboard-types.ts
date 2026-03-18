export type CategoryForm = {
    name: string;
    pricePerGram: number;
    isActive: boolean;
};

export type ProductForm = {
    name: string;
    description: string;
    stock: number;
    discountPercentage: number;
    isActive: boolean;
};

export const initialCategoryForm: CategoryForm = {
    name: "",
    pricePerGram: 0,
    isActive: true,
};

export const initialProductForm: ProductForm = {
    name: "",
    description: "",
    stock: 0,
    discountPercentage: 0,
    isActive: true,
};

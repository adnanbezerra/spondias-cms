export type CategoryForm = {
    name: string;
    isActive: boolean;
};

export type ProductForm = {
    name: string;
    description: string;
    price: number;
    stock: number;
    discountPercentage: number;
    isActive: boolean;
};

export const initialCategoryForm: CategoryForm = {
    name: "",
    isActive: true,
};

export const initialProductForm: ProductForm = {
    name: "",
    description: "",
    price: 0,
    stock: 0,
    discountPercentage: 0,
    isActive: true,
};

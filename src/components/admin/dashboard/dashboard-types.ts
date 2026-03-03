export type CategoryForm = {
    name: string;
    isActive: boolean;
};

export type ProductForm = {
    name: string;
    price: number;
    stock: number;
    discountPercentage: number;
    image: string;
    isActive: boolean;
};

export const initialCategoryForm: CategoryForm = {
    name: "",
    isActive: true,
};

export const initialProductForm: ProductForm = {
    name: "",
    price: 0,
    stock: 0,
    discountPercentage: 0,
    image: "",
    isActive: true,
};

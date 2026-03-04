export type SectionCategoriesMap = Record<string, string[]>;

export type SectionForm = {
    name: string;
    order: number;
    isActive: boolean;
    isBanner: boolean;
};

export const initialSectionForm: SectionForm = {
    name: "",
    order: 1,
    isActive: true,
    isBanner: false,
};

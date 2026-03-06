export type UserForm = {
    name: string;
    email: string;
    cpf: string;
    password: string;
    isActive: boolean;
};

export const initialUserForm: UserForm = {
    name: "",
    email: "",
    cpf: "",
    password: "",
    isActive: true,
};

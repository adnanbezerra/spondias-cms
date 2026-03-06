export const PROTECTED_ADMIN_EMAIL = "adnanbezerra@proton.me";

export const isProtectedAdminEmail = (email: string): boolean => {
    return email.trim().toLowerCase() === PROTECTED_ADMIN_EMAIL;
};

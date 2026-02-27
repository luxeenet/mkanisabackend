export interface ITenant {
    id: string;
    name: string;
    slug: string;
    domain?: string;
    logoUrl?: string;
    primaryColor?: string;
    isActive: boolean;
    settings: any;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser {
    id: string;
    tenantId: string;
    churchId?: string;
    email?: string;
    phoneNumber: string;
    passwordHash: string;
    fullName: string;
    avatarUrl?: string;
    roleId?: string;
    isActive: boolean;
    isVerified: boolean;
    is_super_admin?: boolean;
    createdAt: Date;

    updatedAt: Date;
}

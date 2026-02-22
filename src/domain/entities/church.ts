export interface IChurch {
    id: string;
    tenantId: string;
    name: string;
    location?: string;
    contactPhone?: string;
    contactEmail?: string;
    bishopName?: string;
    pastorName?: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMember {
    id: string;
    churchId: string;
    registrationNumber?: string;
    fullName: string;
    phoneNumber: string;
    email?: string;
    gender?: string;
    dateOfBirth?: Date;
    memberType: string;
    isActive: boolean;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}

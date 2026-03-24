export interface Company {
  id: string;
  agencyName: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  staffCount: number;
  busCount: number;
  driverCount: number;
}

export interface CompanyFormData {
  agencyName?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  adminName?: string;
  adminPassword?: string;
}
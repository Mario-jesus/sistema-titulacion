export interface Quota {
  id: string;
  generationId: string;
  careerId: string;
  newAdmissionQuotasMale: number;
  newAdmissionQuotasFemale: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quota {
  id: string;
  generationId: string;
  careerId: string;
  newAdmissionQuotas: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

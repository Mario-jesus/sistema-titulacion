export interface NewAdmission {
  id: string;
  generationId: string;
  careerId: string;
  maleCount: number;
  femaleCount: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

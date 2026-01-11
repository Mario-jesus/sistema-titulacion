export interface Graduation {
  id: string;
  studentId: string;
  graduationOptionId: string | null;
  graduationDate: Date;
  isGraduated: boolean;
  president: string;
  secretary: string;
  vocal: string;
  substituteVocal: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

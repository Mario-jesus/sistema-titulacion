export interface CreateGraduationRequest {
  studentId: string;
  graduationOptionId: string | null;
  graduationDate: string | Date; // ISO string o Date
  idCardNumber?: string;
  idCardIssueDate?: string | Date;
  president: string;
  secretary: string;
  vocal: string;
  substituteVocal: string;
  notes?: string | null;
}

export interface UpdateGraduationRequest {
  studentId?: string;
  graduationOptionId?: string | null;
  graduationDate?: string | Date; // ISO string o Date
  idCardNumber?: string;
  idCardIssueDate?: string | Date;
  president?: string;
  secretary?: string;
  vocal?: string;
  substituteVocal?: string;
  notes?: string | null;
}

export interface GraduationError {
  message: string;
  code?: string;
  fieldErrors?: {
    studentId?: string;
    graduationOptionId?: string;
    graduationDate?: string;
    idCardNumber?: string;
    idCardIssueDate?: string;
    president?: string;
    secretary?: string;
    vocal?: string;
    substituteVocal?: string;
    notes?: string;
  };
}

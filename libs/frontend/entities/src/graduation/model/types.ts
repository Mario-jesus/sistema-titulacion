export interface Graduation {
  id: string;
  studentId: string;
  graduationOptionId: string | null;
  graduationDate?: string | Date; // Fecha en que el estudiante se tituló (opcional)
  scheduledDate?: string | Date; // Fecha programada para titulación
  president: string;
  secretary: string;
  vocal: string;
  substituteVocal: string;
  notes: string | null;
  idCardNumber?: string; // Cédula profesional
  idCardIssueDate?: string | Date; // Fecha de emisión de cédula
  createdAt: string | Date;
  updatedAt: string | Date;
}

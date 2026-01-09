/**
 * Representa los datos de ingreso y egreso para una generación y carrera específica
 */
export interface IngressEgress {
  id: string; // Combinación de generationId-careerId para el detail
  generationId: string;
  careerId: string;
  generationName: string | null;
  careerName: string;
  admissionNumber: number; // Número de ingreso (de Quota)
  egressNumber: number; // Número de egreso (estudiantes con hasCompletedCareer = true)
}

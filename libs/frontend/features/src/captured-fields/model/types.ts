export interface CreateCapturedFieldsRequest {
  studentId: string;
  processDate: string | Date; // ISO string o Date
  projectName: string;
  company: string;
}

export interface UpdateCapturedFieldsRequest {
  studentId?: string;
  processDate?: string | Date; // ISO string o Date
  projectName?: string;
  company?: string;
}

export interface CapturedFieldsError {
  message: string;
  code?: string;
  fieldErrors?: {
    studentId?: string;
    processDate?: string;
    projectName?: string;
    company?: string;
  };
}

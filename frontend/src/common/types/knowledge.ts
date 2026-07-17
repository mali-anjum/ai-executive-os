
export type UploadDocumentOptions = {
    allowedDepartments?: string;
    allowedRoles?: string;
  };
  
export type UploadDocumentRequest = UploadDocumentOptions & {
    file: File;
  };

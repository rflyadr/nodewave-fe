import type { User } from "./User";

export interface FileUpload {
  id: number;
  filename: string;
  fileUrl: string;
  status: "pending" | "success" | "fail" | "deleted";
  uploadedBy: number;
  createdAt: string;
  updatedAt: string;
  failReason?: string;
  user?: User;
}

export interface FileInfo {
  originalname: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

export interface UploadFileResponse {
  message: string;
  id: number;
  fileInfo: FileInfo;
}

// src/api.ts
import axios from "axios";
import type { FileUpload } from "./types/FileUpload";
import type { UploadFileResponse } from "./types/FileUpload";
import type { FileRow } from "./types/FileRow";
import type { AuthUser } from "./AuthContext";

const BASE_URL = "http://localhost:3150/api";

// --- Token Helpers, API ---
export function setToken(token: string, remember = false) {
  if (remember) {
    localStorage.setItem("accessToken", token);
  } else {
    sessionStorage.setItem("accessToken", token);
  }
}
export function getToken(): string | null {
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
}
export function clearToken() {
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("accessToken");
}
function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Fetch seluruh file
export async function fetchFiles(params?: Record<string, unknown>): Promise<FileUpload[]> {
  const res = await axios.get<{ content: { files: FileUpload[] } }>(`${BASE_URL}/files`, {
    headers: getAuthHeaders(),
    params,
  });
  return res.data.content?.files || [];
}

export async function uploadFile(file: File): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.post<UploadFileResponse>(
    `${BASE_URL}/files/upload`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
}

export async function login(email: string, password: string): Promise<{ accessToken: string }> {
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  return {
    accessToken:
      res.data.accessToken ||
      res.data.token ||
      res.data.content?.accessToken ||
      res.data.content?.token ||
      "",
  };
}

export async function register(email: string, fullName: string, password: string): Promise<void> {
  await axios.post(`${BASE_URL}/auth/register`, { email, fullName, password });
}

// get isi content dari file
export async function getFileContent(fileId: number): Promise<FileRow[]> {
  const res = await axios.get<{ content: { rows: FileRow[] } }>(
    `${BASE_URL}/files/${fileId}/content`,
    { headers: getAuthHeaders() }
  );
  return res.data.content.rows;
}

// hapus file
export async function deleteFile(fileId: number): Promise<unknown> {
  const res = await axios.delete(`${BASE_URL}/files/${fileId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

// Fetch semua user & admin
export const fetchUsers = async (): Promise<AuthUser[]> => {
  const response = await axios.get<{ content?: { users?: AuthUser[] } }>(`${BASE_URL}/users`);
  // Cek jika response nested atau tidak
  if (Array.isArray(response.data)) return response.data as AuthUser[];
  if (response.data?.content?.users) return response.data.content.users;
  if (Array.isArray(response.data?.content)) return response.data.content as AuthUser[];
  return [];
};


export async function fetchPaginatedFiles(
  page: number,
  rows: number,
  filters: Record<string, string | string[]> = {},
  searchFilters: Record<string, string | string[]> = {},
  rangedFilters: { key: string; start: string | number; end: string | number }[] = []
): Promise<{ files: FileUpload[]; total: number }> {
  const params = {
    page,
    rows,
    filters: JSON.stringify(filters),
    searchFilters: JSON.stringify(searchFilters),
    rangedFilters: JSON.stringify(rangedFilters),
  };
  const res = await axios.get(`${BASE_URL}/files`, {
    headers: getAuthHeaders(),
    params,
  });
  return {
    files: res.data.content?.files || [],
    total: res.data.content?.total || 0,
  };
}

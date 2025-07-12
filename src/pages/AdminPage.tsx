import { useEffect, useState, useCallback } from "react";
import { fetchPaginatedFiles, getFileContent, deleteFile, fetchUsers } from "../api";
import type { FileUpload } from "../types/FileUpload";
import type { FileRow } from "../types/FileRow";
import type { AuthUser } from "../AuthContext";

const statusColor = (status: string) => {
  if (status === "success") return "bg-green-200 text-green-800";
  if (status === "fail") return "bg-red-200 text-red-800";
  if (status === "pending") return "bg-yellow-200 text-yellow-800";
  if (status === "deleted") return "bg-gray-200 text-gray-600";
  return "";
};

type RangedFilter = { key: string; start: string | number; end: string | number };

const AdminPage = () => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AuthUser[]>([]);
  const [selectedFileData, setSelectedFileData] = useState<FileRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalFiles, setTotalFiles] = useState(0);
  const [filters, setFilters] = useState<Record<string, string | string[]>>({});
  const [searchFilters, setSearchFilters] = useState<Record<string, string | string[]>>({});
  const [rangedFilters, setRangedFilters] = useState<RangedFilter[]>([]);
  const [searchFilenameInput, setSearchFilenameInput] = useState("");

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { files, total } = await fetchPaginatedFiles(
        page,
        rowsPerPage,
        filters,
        searchFilters,
        rangedFilters
      );
      setFiles(files);
      setTotalFiles(total);
    } catch (err) {
      console.error("Failed to load files", err);
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters, searchFilters, rangedFilters]);

  const loadUsers = useCallback(async () => {
    try {
      const userList = await fetchUsers();
      setUsers(userList);
      setFilteredUsers(userList);
    } catch {
      setError("Failed to load users");
    }
  }, []);

  useEffect(() => {
    loadFiles();
    loadUsers();
  }, [loadFiles, loadUsers]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchFilters((old) => ({
        ...old,
        filename: searchFilenameInput
      }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchFilenameInput]);

  const handleView = async (fileId: number) => {
    try {
      setError(null);
      const data = await getFileContent(fileId);
      if (Array.isArray(data)) {
        setSelectedFileData(data);
      } else {
        throw new Error("Data format invalid");
      }
    } catch (err) {
      setError((err as Error).message);
      setSelectedFileData(null);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      setError(null);
      await deleteFile(fileId);
      await loadFiles();
      setSelectedFileData(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(
      (u) =>
        (u.fullName?.toLowerCase?.() ?? "").includes(term) ||
        (u.email?.toLowerCase?.() ?? "").includes(term)
    );
    setFilteredUsers(filtered);
  };

  const totalPages = Math.max(1, Math.ceil(totalFiles / rowsPerPage));

return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <main className="py-12 px-4 sm:px-8 max-w-6xl w-full mx-auto">
      {selectedFileData ? (
        <>
          <div className="overflow-auto max-h-[70vh] border rounded-2xl p-6 bg-white shadow">
            <div className="justify-between flex">
                <h3 className="font-semibold mb-4 text-lg">Data Viewer</h3>
                <button
                  onClick={() => setSelectedFileData(null)}
                  className="top-3 mb-6 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                >
                  ← Kembali
                </button>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="min-w-[600px] w-full text-sm border-separate border-spacing-0 rounded-xl">
                <thead>
                  <tr>
                    {selectedFileData.length > 0 &&
                      Object.keys(selectedFileData[0]).map((key) => (
                        <th
                          key={key}
                          className="border-b px-4 py-3 bg-[#f8f8fa] text-gray-800 font-semibold"
                        >
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedFileData.map((row, i) => (
                    <tr key={i} className="border-b last:border-b-0 hover:bg-gray-100">
                      {Object.values(row).map((val, idx) => (
                        <td key={idx} className="px-4 py-3 text-gray-800">
                          {val !== null && val !== undefined
                            ? typeof val === "object"
                              ? JSON.stringify(val)
                              : String(val)
                            : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {error && <div className="text-red-600 mb-4">{error}</div>}

          {/* File Table */}
          <div className="mb-12">
            <div className=" flex justify-between">
                <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
                <h2 className="text-xl font-semibold mb-4">Kumpulan File</h2>
            </div>
            {loading ? (
              <div className="text-gray-500 py-8 text-center">Memuat data...</div>
            ) : (
              <div className="rounded-2xl border border-gray-200 shadow bg-white pb-4">
                {/* FILTER BAR */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 px-6 pt-6 pb-2">
                  <input
                    type="text"
                    placeholder="Cari file"
                    value={searchFilenameInput}
                    onChange={(e) => setSearchFilenameInput(e.target.value)}
                    className="w-full md:w-64 border-b border-gray-300 rounded-md px-4 py-2 bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none placeholder-gray-400"
                  />
                  <select
                    value={typeof filters.status === "string" ? filters.status : ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        status: e.target.value || "",
                      })
                    }
                    className="w-full md:w-48 border-b border-gray-300 rounded-md px-4 py-2 bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none"
                  >
                    <option value="">Semua Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAIL">Fail</option>
                    <option value="DELETED">Deleted</option>
                  </select>
                  <input
                    type="date"
                    onChange={(e) => {
                      const start = e.target.value;
                      if (start) {
                        setRangedFilters([
                          {
                            key: "createdAt",
                            start: `${start}T00:00:00`,
                            end: `${start}T23:59:59`,
                          },
                        ]);
                      } else {
                        setRangedFilters([]);
                      }
                    }}
                    className="w-full md:w-48 border-b border-gray-300 rounded-md px-4 py-2 bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setFilters({});
                      setSearchFilters({});
                      setRangedFilters([]);
                      setSearchFilenameInput("");
                      setPage(1);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md font-medium text-gray-700 transition"
                  >
                    Hapus Filter
                  </button>
                </div>

                {/* TABLE DATA SEMUANYA */}
                <div className="overflow-x-auto">
                  <table className="min-w-[800px] w-full border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-[#f8f8fa] font-bold text-gray-800 text-base">No</th>
                        <th className="px-6 py-3 bg-[#f8f8fa] font-bold text-gray-800 text-base">Nama File</th>
                        <th className="px-6 py-3 bg-[#f8f8fa] font-bold text-gray-800 text-base">Diupload oleh</th>
                        <th className="px-6 py-3 bg-[#f8f8fa] font-bold text-gray-800 text-base">Status</th>
                        <th className="px-6 py-3 bg-[#f8f8fa] font-bold text-gray-800 text-base">Dibuat</th>
                        <th className="px-6 py-3 bg-[#f8f8fa] font-bold text-gray-800 text-base">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file, i) => (
                        <tr
                          key={file.id}
                          className={`border-b last:border-b-0 hover:bg-blue-50 transition-colors ${
                            file.status?.toLowerCase?.() === "deleted" ? "opacity-60" : ""
                          }`}
                        >
                          <td className="px-6 py-4 text-gray-700">{(page - 1) * rowsPerPage + i + 1}</td>
                          <td className="px-6 py-4 text-gray-800">{file.filename}</td>
                          <td className="px-6 py-4 text-gray-800">
                            {file.user?.fullName || file.user?.email || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block rounded-full px-4 py-1 font-semibold text-sm ${statusColor(
                                file.status?.toLowerCase?.() || ""
                              )}`}
                            >
                              {file.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {file.createdAt ? new Date(file.createdAt).toLocaleString() : "-"}
                          </td>
                          <td className="px-6 py-4 space-x-2">
                            <button
                              className="bg-blue-600 text-white px-4 py-1 rounded-lg shadow hover:bg-blue-700 transition"
                              onClick={() => handleView(file.id)}
                              disabled={file.status?.toLowerCase?.() === "deleted"}
                            >
                              Lihat
                            </button>
                            <button
                              className="bg-red-600 text-white px-4 py-1 rounded-lg shadow hover:bg-red-700 transition"
                              onClick={() => handleDelete(file.id)}
                              disabled={file.status?.toLowerCase?.() === "deleted"}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 pt-6">
                  <div>
                    <label className="mr-2">Rows per page:</label>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                      className="border-b border-gray-300 rounded-md px-2 py-1 bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none"
                    >
                      {[10, 20, 50, 100].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 bg-white hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      First
                    </button>
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 bg-white hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="mx-2 text-gray-600 font-medium">Page {page} of {totalPages}</span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 bg-white hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      Next
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(totalPages)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 bg-white hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DATA USER SEMUANYA */}
          <div className="mb-10">
            <div className="rounded-2xl border border-gray-200 shadow bg-white p-6">
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <div className="overflow-x-auto">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search by name or email"
                  className="mb-5 px-5 py-2 border border-gray-200 rounded-lg w-full max-w-md bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none placeholder-gray-400 transition"
                />
                <table className="min-w-[600px] w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 font-bold text-gray-800 text-left">No</th>
                      <th className="px-6 py-3 bg-gray-50 font-bold text-gray-800 text-left">Nama</th>
                      <th className="px-6 py-3 bg-gray-50 font-bold text-gray-800 text-left">Email</th>
                      <th className="px-6 py-3 bg-gray-50 font-bold text-gray-800 text-left">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(filteredUsers) && filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">
                          No users found.
                        </td>
                      </tr>
                    )}
                    {Array.isArray(filteredUsers) &&
                      filteredUsers.map((user, i) => (
                        <tr
                          key={user.id}
                          className="border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-6 py-4">{i + 1}</td>
                          <td className="px-6 py-4">{user.fullName || "-"}</td>
                          <td className="px-6 py-4">{user.email}</td>
                          <td className="px-6 py-4">{user.role}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  </div>
);
};

export default AdminPage;

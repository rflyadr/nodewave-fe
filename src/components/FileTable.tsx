import { useEffect, useState } from "react";
import type { FileUpload } from "../types/FileUpload";
import { fetchFiles, getFileContent, deleteFile } from "../api";
import type { FileRow } from "../types/FileRow";

const statusColor = (status: string) => {
  if (status === "success") return "text-green-600";
  if (status === "fail") return "text-red-600";
  if (status === "deleted") return "text-gray-500";
  return "text-yellow-500";
};

const FileTable = () => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFileData, setSelectedFileData] = useState<FileRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleFiles = files.filter(file => file.status.toLowerCase() !== "deleted");

  const loadFiles = () => {
    setLoading(true);
    fetchFiles()
      .then(setFiles)
      .catch(() => setError("Failed to load files"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFiles();
    const intervalId = setInterval(loadFiles, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleView = async (file: FileUpload) => {
    try {
      setError(null);
      const data = await getFileContent(file.id);
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
      loadFiles();
      setSelectedFileData(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (selectedFileData) {
    return (
      <div>
        <button
          onClick={() => setSelectedFileData(null)}
          className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          ← Kembali
        </button>

        {selectedFileData.length > 0 ? (
          <div className="overflow-auto max-h-[70vh] border rounded p-2 bg-gray-50">
            <h3 className="font-semibold mb-2">File Preview:</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {Object.keys(selectedFileData[0]).map((key) => (
                    <th key={key} className="border px-2 py-1 bg-gray-200">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedFileData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-100">
                    {Object.values(row).map((val, idx) => (
                      <td key={idx} className="border px-2 py-1">
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
        ) : (
          <div className="p-4 bg-gray-100 rounded border text-center">
            Data Kosong
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-blue-900 mb-4 text-xl font-semibold">Daftar File Upload</h2>

      {loading && <div>Loading...</div>}

      {error && <div className="text-red-600 mb-2">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="w-full border-collapse">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Nama File</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Dibuat</th>
                <th className="p-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visibleFiles.map((file, index) => (
                <tr
                  key={file.id}
                  className="bg-white border-b border-gray-200 cursor-default hover:bg-gray-50"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      {file.filename}
                    </a>
                  </td>
                  <td className={`p-3 font-semibold ${statusColor(file.status.toLowerCase())}`}>
                    {file.status}
                  </td>
                  <td className="p-3">{new Date(file.createdAt).toLocaleString()}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleView(file)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Lihat
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileTable;

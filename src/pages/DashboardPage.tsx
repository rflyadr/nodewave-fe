import { useState } from "react";
import FileTable from "../components/FileTable";
import { uploadFile } from "../api";
import TopNavbar from "../components/Navbar"; // import navbar

const DashboardPage = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    setUploadSuccess("");
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      await uploadFile(file);
      setUploadSuccess("File berhasil diupload dan sedang diproses");
      setFile(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error: unknown) {
      let message = "Upload gagal";

      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        message = (error as { message: string }).message;
      }

      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
  <>
    <TopNavbar />
    <div className="flex font-sans">
      <main className="flex-grow max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg h-[70vh]">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-blue-900 text-3xl font-semibold">Upload Data Produk</h4>
        </div>

        <div className="mb-6 p-4 border border-gray-300 rounded-md shadow-sm flex items-center gap-3">
          <input
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            className={`flex-grow p-2 rounded-md border border-gray-300 ${
              uploading ? "cursor-not-allowed bg-gray-100" : "cursor-pointer bg-white"
            }`}
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`bg-blue-700 text-white py-2 px-4 rounded-md font-bold text-lg transition-colors ${
              uploading ? "cursor-not-allowed bg-blue-400" : "hover:bg-blue-800 cursor-pointer"
            }`}
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>

        {uploadError && <div className="text-red-600 mb-4">{uploadError}</div>}
        {uploadSuccess && <div className="text-green-600 mb-4">{uploadSuccess}</div>}

        <FileTable key={refreshKey} />
      </main>
    </div>
  </>
);

};

export default DashboardPage;

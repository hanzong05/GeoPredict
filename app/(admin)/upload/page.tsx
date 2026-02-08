"use client";

import { useEffect, useState } from "react";

interface FileItem {
  name: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
  metadata?: { size?: number };
}

interface FolderItem {
  name: string;
  created_at?: string;
}

export default function Page() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const BUCKET_NAME = "geotechnical-data";

  // Fetch folders on mount
  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/folders");
      const data = await res.json();
      if (data.success) {
        setFolders(data.folders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch files when a folder is selected
  useEffect(() => {
    if (!selectedFolder) return;

    const fetchFiles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/files/${selectedFolder}`);
        const data = await res.json();
        if (data.success) {
          setFiles(data.files);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [selectedFolder]);

  // Update the handleFileUpload function in your page.tsx

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("Please upload only Excel files (.xlsx or .xls)");
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setUploadSuccess(true);

        let message = `✅ ${data.message}\n\nOriginal file: ${data.originalName}\nSaved as: Raw_Data.xlsx`;

        // Add pipeline status to message
        if (data.pipelineStatus === "started") {
          message += "\n\n🚀 Pipeline processing started successfully!";
        } else if (data.pipelineStatus === "failed") {
          message += `\n\n   Warning: Pipeline failed to start\nError: ${data.pipelineError}`;
        }

        alert(message);

        // Refresh folders and select raw folder
        await fetchFolders();
        setSelectedFolder("raw");
      } else {
        alert(`❌ Upload failed: ${data.error}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const downloadFile = (fileName: string) => {
    const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${selectedFolder}/${fileName}`;
    window.open(url, "_blank");
  };

  const downloadFolder = () => {
    files.forEach((file) => downloadFile(file.name));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Geotechnical Data Storage
              </h1>
              <p className="text-gray-600 mt-2">
                Browse and download geotechnical data files
              </p>
            </div>

            {/* Upload Button */}
            <div className="flex items-center gap-4">
              <label
                htmlFor="file-upload"
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? "📤 Uploading..." : "📤 Upload Raw Data"}
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>

          {/* Upload Instructions */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>📝 Upload Instructions:</strong> Upload an Excel file
              (.xlsx or .xls). It will be automatically renamed to{" "}
              <code className="bg-blue-100 px-2 py-1 rounded">
                Raw_Data.xlsx
              </code>{" "}
              and saved in the <strong>raw</strong> folder. Any existing file
              will be archived to <strong>old_raw_files</strong>.
            </p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Folders View */}
        {!selectedFolder && !loading && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Folders ({folders.length})
            </h2>
            {folders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No folders found in storage
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.name}
                    onClick={() => setSelectedFolder(folder.name)}
                    className="p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">📁</span>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {folder.name}
                        </p>
                        {folder.created_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Created:{" "}
                            {new Date(folder.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Files View */}
        {selectedFolder && !loading && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedFolder}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {files.length} file{files.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {files.length > 0 && (
                  <button
                    onClick={downloadFolder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download All Files
                  </button>
                )}
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ← Back to Folders
                </button>
              </div>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No files in this folder
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1">
                          {file.metadata?.size && (
                            <span>{formatBytes(file.metadata.size)}</span>
                          )}
                          {file.updated_at && (
                            <span>
                              Modified:{" "}
                              {new Date(file.updated_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadFile(file.name)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

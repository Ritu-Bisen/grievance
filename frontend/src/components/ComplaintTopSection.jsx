import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ComplaintTopSection({ complaint }) {
  const navigate = useNavigate();

  /* ---------- PREVIEW STATE ---------- */
  const [previewFile, setPreviewFile] = useState(null);

  /* ---------- SAFE DOCUMENT NORMALIZER ---------- */
  const normalizeDocuments = (docs) => {
    if (!docs) return [];

    // array of objects
    if (Array.isArray(docs) && typeof docs[0] === "object") {
      return docs;
    }

    // array of strings
    if (Array.isArray(docs)) {
      return docs.map((name) => ({
        file_name: name,
        original_name: name.split("-").slice(1).join("-") || name,
      }));
    }

    // JSON / comma string
    if (typeof docs === "string") {
      try {
        const parsed = JSON.parse(docs);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return docs.split(",").map((name) => ({
          file_name: name,
          original_name: name.split("-").slice(1).join("-") || name,
        }));
      }
    }

    return [];
  };

  const documents = normalizeDocuments(complaint.documents);

  /* ---------- FILE HELPERS ---------- */
  const isImage = (name) => /\.(jpg|jpeg|png|webp)$/i.test(name);
  const isPDF = (name) => /\.pdf$/i.test(name);
  const isText = (name) => /\.(csv|txt)$/i.test(name);
  const isDoc = (name) => /\.(doc|docx)$/i.test(name);

  return (
    <>
      <div className="bg-gray-50 border rounded p-6 mb-6">

        {/* 🔙 BACK BUTTON */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/warehouse")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* ===== BASIC DETAILS ===== */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div><b>Complaint ID:</b> {complaint.complaint_code}</div>
          <div><b>Type:</b> {complaint.complaint_type}</div>
          <div><b>Category:</b> {complaint.category}</div>
          <div><b>Facility:</b> {complaint.facility_name}</div>
          <div><b>Item Name:</b> {complaint.item_name}</div>
          <div><b>Item Code:</b> {complaint.item_code}</div>
          <div><b>Batch No:</b> {complaint.batch_no}</div>
          <div><b>Status:</b> {complaint.status}</div>

          {/* ✅ ADDED: CREATED DATE */}
          {complaint.created_at && (
            <div>
              <b>Complaint Created On:</b>{" "}
              {new Date(complaint.created_at).toLocaleString()}
            </div>
          )}
        </div>

        {/* ===== DOCUMENTS (SAME LOGIC AS COMPLAINT VIEW) ===== */}
        <div>
          <h4 className="font-semibold mb-3">Uploaded Documents</h4>

          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc, index) => {
                const name = doc.original_name;
                const path = doc.file_name;
                const fileUrl = `http://localhost:5000/uploads/${path}`;

                return (
                  <div
                    key={index}
                    className="flex justify-between items-center border px-4 py-2 rounded bg-white"
                  >
                    <span className="text-sm text-gray-700">{name}</span>

                    <div className="flex gap-3">
                      {(isImage(name) || isPDF(name) || isText(name)) && (
                        <button
                          onClick={() =>
                            setPreviewFile({ name, url: fileUrl })
                          }
                          className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                        >
                          View
                        </button>
                      )}

                      {isDoc(name) && (
                        <button
                          onClick={() =>
                            alert("Preview not supported for DOC/DOCX files")
                          }
                          className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                        >
                          View
                        </button>
                      )}

                      <a
                        href={`http://localhost:5000/api/grievance/complaint-user/download/${path}`}
                        className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No documents uploaded</p>
          )}
        </div>
      </div>

      {/* ===== PREVIEW MODAL (IMAGE / PDF / TEXT) ===== */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded max-w-4xl w-full">

            <div className="flex justify-end mb-3">
              <button
                onClick={() => setPreviewFile(null)}
                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>

            {isImage(previewFile.name) && (
              <img
                src={previewFile.url}
                alt="Preview"
                className="max-h-[75vh] mx-auto object-contain"
              />
            )}

            {isPDF(previewFile.name) && (
              <iframe
                src={previewFile.url}
                className="w-full h-[75vh]"
                title="PDF Preview"
              />
            )}

            {isText(previewFile.name) && (
              <iframe
                src={previewFile.url}
                className="w-full h-[75vh]"
                title="Text Preview"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

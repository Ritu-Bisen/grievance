import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaDownload, FaEye, FaTimes } from "react-icons/fa";

export default function ComplaintTopSection({ complaint }) {
  const navigate = useNavigate();

  /* ---------- PREVIEW STATE ---------- */
  const [previewFile, setPreviewFile] = useState(null);

  /* ---------- SAFE DOCUMENT NORMALIZER ---------- */
  const normalizeDocuments = (docs) => {
    if (!docs) return [];

    if (Array.isArray(docs) && typeof docs[0] === "object") {
      return docs.map(d => ({
        file_name: d.file_name || d.path,
        original_name: d.original_name || (d.path ? d.path.split("-").slice(1).join("-") : "document")
      }));
    }

    if (Array.isArray(docs)) {
      return docs.map((name) => ({
        file_name: name,
        original_name: name.split("-").slice(1).join("-") || name,
      }));
    }

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

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 mb-8">
        {/* ===== BASIC DETAILS (Matching Facility View Style) ===== */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 p-2 rounded-lg"><FaFileAlt className="text-blue-600 text-sm" /></span>
            Complaint Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            {[
              ["Complaint ID", complaint.complaint_code],
              ["Type", complaint.complaint_type],
              ["Category", complaint.category],
              ["Facility", complaint.facility_name],
              ["Warehouse Code", (() => {
                const warehouseNames = {
                  "WH-001": "Ambikapur Warehouse",
                  "WH-002": "Dantewada Warehouse"
                };
                return warehouseNames[complaint.warehouse_code] || complaint.warehouse_code || "—";
              })()],
              ["Status", complaint.status],
              ["Created On", complaint.created_at ? new Date(complaint.created_at).toLocaleString() : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center border-b border-gray-100 py-3 text-sm">
                <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">{label}</span>
                <span className="text-gray-800 font-semibold">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center border-b border-gray-100 py-3 text-sm">
            <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Item Description</span>
            <span className="text-gray-800 font-bold text-lg">{complaint.item_name} <span className="text-sm font-normal text-gray-500">({complaint.item_code})</span></span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 py-3 text-sm">
            <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Batch Number</span>
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold text-xs border border-indigo-100">{complaint.batch_no}</span>
          </div>
        </div>

        {/* ===== SUPPORTING DOCUMENTS (PREMIUM GRID) ===== */}
        {(documents.length > 0 || complaint.opd_slip) && (
          <div className="mt-8 border-t border-gray-100 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
              <div className="flex-1 w-full">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="bg-blue-100 p-2 rounded-lg"><FaFileAlt className="text-blue-600 text-sm" /></span>
                  Supporting Documents
                </h3>

                {documents.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {documents.map((doc, index) => {
                      const name = doc.original_name;
                      const path = doc.file_name;
                      const fullUrl = `http://localhost:5000/uploads/${path}`;
                      const isImg = isImage(name);
                      const isPdf = isPDF(name);

                      return (
                        <div key={index} className="group border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col">
                          <div
                            onClick={() => setPreviewFile({ name, url: fullUrl })}
                            className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden relative cursor-pointer"
                          >
                            {isImg ? (
                              <img src={fullUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="thumb" />
                            ) : isPdf ? (
                              <div className="w-16 h-20 bg-red-100 border-2 border-red-200 rounded-lg relative flex items-center justify-center shadow-sm group-hover:scale-110 transition duration-500">
                                <span className="text-[10px] font-black text-red-700 bg-white px-1.5 py-0.5 rounded shadow-sm border border-red-100">PDF</span>
                              </div>
                            ) : (
                              <FaFileAlt className="text-5xl text-gray-300" />
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[9px] font-bold py-1 translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-center gap-1 backdrop-blur-sm">
                              <FaEye size={10} /> TAP TO PREVIEW
                            </div>
                          </div>
                          <div className="p-3 text-center border-t bg-white">
                            <p className="text-[10px] font-bold text-gray-700 truncate mb-2" title={name}>{name}</p>
                            <a
                              href={`http://localhost:5000/api/grievance/complaint-user/download/${path}`}
                              className="text-indigo-600 hover:text-indigo-800 transition flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest bg-indigo-50 py-1.5 rounded-lg border border-indigo-100"
                            >
                              <FaDownload size={10} /> Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic py-4 bg-gray-50 border border-dashed rounded-xl text-center">No supporting documents available.</p>
                )}
              </div>

              {/* OPD SLIP PREVIEW */}
              {complaint.opd_slip && (
                <div className="w-full md:w-64 shrink-0">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="bg-red-100 p-2 rounded-lg"><FaFileAlt className="text-red-600 text-sm" /></span>
                    OPD Slip
                  </h3>
                  <div className="group border-2 border-red-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-red-50 flex flex-col">
                    <div
                      onClick={() => setPreviewFile({ name: "OPD Slip.pdf", url: `http://localhost:5000/uploads/${complaint.opd_slip}` })}
                      className="aspect-square bg-red-50 flex items-center justify-center overflow-hidden relative cursor-pointer"
                    >
                      <div className="w-full h-full p-3">
                        <div className="w-full h-full bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden relative group-hover:scale-105 transition duration-500">
                          <iframe
                            src={`http://localhost:5000/uploads/${complaint.opd_slip}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none"
                            title="OPD Slip Preview"
                          />
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black shadow-lg">PDF</div>
                          <div className="absolute inset-x-0 bottom-0 bg-red-600/10 py-1 text-center backdrop-blur-sm border-t border-red-200/50">
                            <span className="text-[9px] font-black text-red-700 uppercase tracking-widest">Document Preview</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white border-t border-red-100">
                      <a
                        href={`http://localhost:5000/api/grievance/complaint-user/download/${complaint.opd_slip}`}
                        className="text-red-600 hover:text-red-800 transition flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest bg-red-50 py-1.5 rounded-lg border border-red-100"
                      >
                        <FaDownload size={10} /> Download OPD Slip
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== PREVIEW MODAL ===== */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-gray-900 font-black text-sm uppercase tracking-widest flex items-center gap-3">
                <span className="bg-blue-600 w-1 h-4 rounded-full"></span>
                {previewFile.name}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="bg-gray-100 text-gray-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition duration-300 shadow-sm"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 bg-gray-50 flex justify-center max-h-[75vh] min-h-[50vh] overflow-auto">
              {isImage(previewFile.name) ? (
                <img src={previewFile.url} alt="Preview" className="max-w-full h-auto object-contain rounded-xl shadow-lg border border-white" />
              ) : isPDF(previewFile.name) ? (
                <iframe src={previewFile.url} className="w-full h-[70vh] rounded-xl border border-gray-200 shadow-sm" title="PDF Preview" />
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-6">
                  <div className="bg-white p-8 rounded-full shadow-inner"><FaFileAlt size={60} className="text-gray-200" /></div>
                  <div className="text-center">
                    <p className="font-black text-xl text-gray-800 uppercase tracking-tighter mb-2">No Visual Preview</p>
                    <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">This file format does not support in-browser previewing. Please download to view.</p>
                    <a href={previewFile.url} download className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition shadow-xl hover:shadow-blue-200">
                      Download File
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

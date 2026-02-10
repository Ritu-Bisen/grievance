import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import ComplaintTopSection from "../../components/ComplaintTopSection";
import { toast } from "sonner";
import { FaFileAlt, FaDownload, FaTimes, FaFileUpload, FaEye, FaPaperclip } from "react-icons/fa";

export default function QcResolveView() {
    const { code } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState({
        complaint: null,
        warehouse: null,
        qc: null,
        report: null
    });
    const [loading, setLoading] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    /* ---------- FILE HELPERS ---------- */
    const isImage = (name) => /\.(jpg|jpeg|png|webp)$/i.test(name);
    const isPDF = (name) => /\.pdf$/i.test(name);

    /* ---------------- LOAD DATA ---------------- */

    const loadData = async () => {
        try {
            const res = await api.get(`/grievance/qc/full-details/${code}`);
            setData(res.data);
            if (res.data.qc?.remarks) {
                setRemarks(res.data.qc.remarks);
            }
        } catch (err) {
            toast.error("Failed to load assessment data");
        }
    };

    useEffect(() => {
        loadData();
    }, [code]);

    /* ---------------- SUBMIT RESOLUTION ---------------- */

    const handleResolve = async (e) => {
        e.preventDefault();
        if (!remarks) return toast.error("Please enter remarks");

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("complaint_code", code);
            formData.append("remarks", remarks);
            if (file) {
                formData.append("document", file);
            }

            await api.post("/grievance/qc/resolve", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Complaint resolved and closed successfully");
            navigate(`/qc/assessment/view/${code}`);
        } catch (err) {
            setLoading(false);
            toast.error("Failed to resolve complaint");
        }
    };

    if (!data.complaint) return <div className="p-10 text-center text-gray-500">Loading details...</div>;

    const { complaint, warehouse, qc, report } = data;

    return (
        <div className="min-h-screen bg-gray-100 pb-12">
            <GovHeader />

            <div className="max-w-6xl mx-auto bg-white mt-6 p-8 rounded shadow">

                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate("/qc/dashboard")}
                    className="mb-6 bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700 transition font-medium"
                >
                    ← Back to Dashboard
                </button>

                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
                    Final Complaint Resolution – {complaint.complaint_code}
                </h2>

                {/* 1. COMPLAINT DETAILS (Standard Component) */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-purple-700 mb-4 bg-purple-50 p-2 px-4 rounded border-l-4 border-purple-600 shadow-sm">
                        01. Complaint Details
                    </h3>
                    <ComplaintTopSection complaint={complaint} />
                </div>

                {/* 2. WAREHOUSE ASSESSMENT */}
                <div className="mb-8 border rounded-lg overflow-hidden shadow-sm">
                    <h3 className="text-lg font-bold text-blue-700 bg-blue-50 p-3 px-6 border-b flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">02</span>
                        Warehouse Assessment Details
                    </h3>
                    {warehouse ? (
                        <div className="p-6 bg-white space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                <div className="space-y-3">
                                    <p><b>Assessment Type:</b> {warehouse.assessment_type || 'N/A'}</p>
                                    <p><b>Tender No:</b> {warehouse.tender_no || 'N/A'}</p>
                                    <p><b>PO No:</b> {warehouse.po_no || 'N/A'}</p>
                                </div>
                                <div className="space-y-3">
                                    <p><b>Stock (Warehouse):</b> {warehouse.stock_warehouse ?? 'N/A'}</p>
                                    <p><b>Stock (Facility):</b> {warehouse.stock_facility ?? 'N/A'}</p>
                                    <p><b>Total Stock:</b> {warehouse.total_stock ?? 'N/A'}</p>
                                </div>
                                <div className="space-y-3">
                                    <p><b>Same Complaint Present:</b> <span className={`font-bold ${warehouse.same_complaint_present === 'YES' ? 'text-red-600' : 'text-green-600'}`}>{warehouse.same_complaint_present || 'N/A'}</span></p>
                                    <p><b>ADR Severity:</b> {warehouse.adr_severity || 'N/A'}</p>
                                    <p><b>Dispatch Date:</b> {warehouse.sample_dispatch_date ? new Date(warehouse.sample_dispatch_date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-2">
                                    <p className="font-bold text-gray-700">Warehouse Observations:</p>
                                    <div className="p-4 bg-gray-50 rounded border italic text-gray-600 min-h-[60px]">
                                        "{warehouse.observations || 'No observations recorded.'}"
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-bold text-gray-700">Warehouse Remarks:</p>
                                    <div className="p-4 bg-gray-50 rounded border italic text-gray-600 min-h-[60px]">
                                        "{warehouse.remarks || 'No additional remarks.'}"
                                    </div>
                                </div>
                            </div>

                            {/* WAREHOUSE DOCUMENTS SECTION */}
                            <div className="pt-6 border-t">
                                <h4 className="flex items-center gap-2 text-md font-bold text-gray-800 mb-4">
                                    <FaFileAlt className="text-blue-500" />
                                    Assessment Supporting Documents
                                </h4>
                                {warehouse.documents?.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {warehouse.documents.map((doc, index) => {
                                            const name = typeof doc === "string" ? doc : (doc.original_name || doc.file_name || `Doc ${index + 1}`);
                                            const path = typeof doc === "string" ? doc : doc.file_name;
                                            const fullUrl = `http://localhost:5000/uploads/assessment/${path}`;
                                            const isImg = isImage(name);
                                            const isPdf = isPDF(name);

                                            return (
                                                <div
                                                    key={`wh-doc-${index}`}
                                                    className="group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col"
                                                >
                                                    <div
                                                        onClick={() => setPreviewFile({ name, url: fullUrl })}
                                                        className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden relative cursor-pointer"
                                                    >
                                                        {isImg ? (
                                                            <img src={fullUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="thumb" />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <FaFileAlt className={`text-4xl ${isPdf ? 'text-red-400' : 'text-gray-400'}`} />
                                                                {isPdf && <span className="text-[10px] font-bold text-red-700">PDF</span>}
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[9px] font-bold py-1 translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-center gap-1 backdrop-blur-sm">
                                                            <FaEye size={10} /> TAP TO PREVIEW
                                                        </div>
                                                    </div>
                                                    <div className="p-2 text-center border-t bg-white">
                                                        <p className="text-[10px] font-medium text-gray-700 truncate mb-1" title={name}>{name}</p>
                                                        <a
                                                            href={`http://localhost:5000/api/grievance/warehouse/assessment/download/${path}`}
                                                            className="text-blue-600 hover:text-blue-800 transition flex items-center justify-center gap-1 text-[9px] font-bold"
                                                        >
                                                            <FaDownload size={10} />
                                                            DOWNLOAD
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-xs italic bg-gray-50 p-3 rounded border">No assessment documents uploaded by warehouse.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-400 italic">No warehouse assessment found.</div>
                    )}
                </div>

                {/* 3. REPORTS / PDF PREVIEW */}
                <div className="mb-8 border rounded-lg overflow-hidden shadow-sm">
                    <h3 className="text-lg font-bold text-gray-700 bg-gray-50 p-3 px-6 border-b flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs">03</span>
                        Laboratory Analysis Report
                    </h3>
                    <div className="p-6 bg-white">
                        {report?.report_pdf ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-gray-100 p-2 px-4 rounded">
                                    <span className="text-sm font-medium text-gray-700">Report Document: {report.report_pdf}</span>
                                    <a
                                        href={report.report_pdf.startsWith('http') ? report.report_pdf : `http://localhost:5000/uploads/reports/${report.report_pdf}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-purple-700"
                                    >
                                        Open in New Tab
                                    </a>
                                </div>
                                <div className="aspect-video w-full border-2 border-gray-100 rounded-lg overflow-hidden bg-gray-50 shadow-inner">
                                    <iframe
                                        src={report.report_pdf.startsWith('http') ? `https://docs.google.com/viewer?url=${encodeURIComponent(report.report_pdf)}&embedded=true` : `http://localhost:5000/uploads/reports/${report.report_pdf}`}
                                        className="w-full h-full"
                                        title="Laboratory Report"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8 text-gray-400 italic">No laboratory report document available.</div>
                        )}
                    </div>
                </div>

                {/* 5. FINAL RESOLUTION FORM */}
                <div className="mt-12 bg-purple-50 rounded-xl border-2 border-purple-200 shadow-lg overflow-hidden">
                    <div className="bg-purple-700 px-6 py-4">
                        <h2 className="text-white text-xl font-bold">Final Resolution Submission</h2>
                    </div>
                    <form onSubmit={handleResolve} className="p-8 space-y-6">
                        <div className="space-y-6 bg-white p-8 rounded-xl border-2 border-purple-100 shadow-sm">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Final Closing Remarks <span className="text-red-500">*</span></label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full border-2 border-purple-100 rounded-lg p-4 h-48 focus:ring-4 focus:ring-purple-200 focus:border-purple-600 outline-none transition-all text-lg"
                                    placeholder="Enter final summary and instructions..."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Supporting Document (Optional)</label>
                                <div className="flex items-center gap-6 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                                    <input
                                        type="file"
                                        id="qc-doc-simple"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const f = e.target.files[0];
                                            if (f) {
                                                setFile(f);
                                                setFilePreview(URL.createObjectURL(f));
                                            }
                                        }}
                                    />
                                    {!filePreview ? (
                                        <label
                                            htmlFor="qc-doc-simple"
                                            className="flex-1 flex items-center justify-center gap-3 py-4 bg-white border-2 border-purple-100 text-purple-700 rounded-xl text-sm font-black uppercase tracking-widest cursor-pointer hover:bg-purple-600 hover:text-white transition-all shadow-sm active:scale-95"
                                        >
                                            <FaFileUpload size={18} />
                                            Select Resolution Image
                                        </label>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-between gap-4 bg-white p-2 pr-6 rounded-xl border-2 border-purple-100 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-md">
                                                    <img src={filePreview} className="w-full h-full object-cover" alt="Preview" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-purple-700 truncate max-w-[200px]">{file.name}</span>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Image Loaded Successfully</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFile(null);
                                                    setFilePreview(null);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-xl active:scale-[0.98]'
                                }`}
                        >
                            {loading ? "Processing Resolution..." : "COMPLAINT RESOLVE"}
                        </button>
                    </form>
                </div>

            </div>

            {/* PREVIEW MODAL */}
            {previewFile && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 truncate pr-8">{previewFile.name}</h3>
                            <button
                                onClick={() => setPreviewFile(null)}
                                className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 hover:text-red-500"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-100/50">
                            {isImage(previewFile.name) ? (
                                <img src={previewFile.url} alt="Large Preview" className="max-w-full h-auto object-contain rounded shadow-lg" />
                            ) : isPDF(previewFile.name) ? (
                                <iframe src={`${previewFile.url}#toolbar=0`} className="w-full h-[70vh] rounded border shadow-inner bg-white" title="PDF Preview" />
                            ) : (
                                <div className="p-20 text-center">
                                    <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">Preview not available for this file type.</p>
                                    <a
                                        href={previewFile.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
                                    >
                                        Open Original
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

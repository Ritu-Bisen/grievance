import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import { FaFileAlt, FaDownload, FaTimes, FaEye } from "react-icons/fa";

export default function QcReportReceived() {
    const { code } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [report, setReport] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [assessment, setAssessment] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    /* ---------- FILE HELPERS ---------- */
    const isImage = (name) => /\.(jpg|jpeg|png|webp)$/i.test(name);
    const isPDF = (name) => /\.pdf$/i.test(name);

    /* ---------------- LOAD DATA ---------------- */

    const loadData = async () => {
        try {
            const res = await api.get(`/grievance/qc/report/view/${code}`);
            setComplaint(res.data.complaint);
            setAssessment(res.data.assessment);
            setReport(res.data.report);
        } catch (err) {
            alert("Failed to load report data");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    /* ---------------- RECEIVE REPORT ---------------- */

    const handleReceiveReport = async () => {
        setLoading(true);

        try {
            await api.post("/grievance/qc/receive-report", {
                complaint_code: code
            });

            setLoading(false);
            setShowPopup(true);
            loadData();
        } catch (err) {
            setLoading(false);
            alert("Failed to mark report as received");
        }
    };

    /* ---------------- DOWNLOAD PDF ---------------- */

    const handleDownloadPdf = (url) => {
        // Check if it's an external URL
        const isExternalUrl = url.startsWith('http') && !url.includes('localhost:5000');

        if (isExternalUrl) {
            // Use backend proxy for external PDFs to bypass CORS
            const proxyUrl = `http://localhost:5000/api/grievance/qc/download-pdf?url=${encodeURIComponent(url)}`;
            window.location.href = proxyUrl;
        } else {
            // For local files, download directly
            const link = document.createElement('a');
            link.href = url;
            link.download = 'report.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (!complaint) return null;

    /* ---------------- UI ---------------- */

    return (
        <div className="min-h-screen bg-gray-100">
            <GovHeader />

            <div className="max-w-6xl mx-auto bg-white mt-6 p-6 rounded shadow">
                <div className="mb-4">
                    <button
                        onClick={() => navigate("/qc/dashboard")}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <h2 className="text-xl font-semibold mb-4">
                    Report Received – {complaint.complaint_code}
                </h2>
                {/* Complaint Details */}
                <div className="border rounded p-4 mb-6 bg-gray-50">
                    <h3 className="font-semibold mb-3">Complaint Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><b>Type:</b> {complaint.complaint_type}</div>
                        <div><b>Category:</b> {complaint.category}</div>
                        <div><b>Facility:</b> {complaint.facility_name}</div>
                        <div><b>Item:</b> {complaint.item_name}</div>
                        <div><b>Batch:</b> {complaint.batch_no}</div>
                        <div><b>Status:</b> {complaint.status}</div>
                    </div>
                </div>

                {/* Supporting Documents & OPD Slip (Unified Layout) */}
                {(complaint.documents?.length > 0 || complaint.opd_slip) && (
                    <div className="border rounded-xl p-6 mb-6 bg-white shadow-sm border-gray-100">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                            {/* SUPPORTING DOCUMENTS (LEFT) */}
                            <div className="flex-1 w-full">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="bg-blue-100 p-2 rounded-full"><FaFileAlt className="text-blue-600 text-sm" /></span>
                                    Supporting Documents
                                </h3>

                                {complaint.documents?.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {complaint.documents.map((doc, index) => {
                                            const name = doc.original_name || doc.file_name || `Doc ${index + 1}`;
                                            const path = doc.file_name || doc;
                                            const fullUrl = `http://localhost:5000/uploads/${path}`;
                                            const isImg = isImage(name);
                                            const isPdf = isPDF(name);

                                            return (
                                                <div
                                                    key={`doc-${index}`}
                                                    className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col"
                                                >
                                                    <div
                                                        onClick={() => setPreviewFile({ name, url: fullUrl })}
                                                        className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden relative cursor-pointer"
                                                    >
                                                        {isImg ? (
                                                            <img src={fullUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="thumb" />
                                                        ) : isPdf ? (
                                                            <div className="flex flex-col items-center gap-1 group-hover:scale-110 transition duration-500">
                                                                <div className="w-12 h-16 bg-red-100 border border-red-200 rounded relative flex items-center justify-center shadow-sm">
                                                                    <span className="text-[10px] font-bold text-red-700 bg-white px-1 rounded shadow-sm">PDF</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <FaFileAlt className="text-4xl text-gray-400" />
                                                        )}
                                                        <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[8px] font-bold py-1 translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-center gap-1 backdrop-blur-sm">
                                                            <FaEye size={8} /> TAP TO PREVIEW
                                                        </div>
                                                    </div>
                                                    <div className="p-2 text-center border-t bg-white">
                                                        <p className="text-[10px] font-medium text-gray-700 truncate mb-1" title={name}>{name}</p>
                                                        <a
                                                            href={`http://localhost:5000/api/grievance/complaint-user/download/${path}`}
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
                                    <p className="text-gray-400 text-xs italic">No supporting documents uploaded.</p>
                                )}
                            </div>

                            {/* OPD SLIP (RIGHT) */}
                            {complaint.opd_slip && (
                                <div className="w-full lg:w-48 shrink-0">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="bg-red-100 p-2 rounded-full"><FaFileAlt className="text-red-600 text-sm" /></span>
                                        OPD Slip
                                    </h3>
                                    <div className="group border-2 border-red-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-red-50 flex flex-col">
                                        <div
                                            onClick={() => setPreviewFile({ name: "OPD Slip.pdf", url: `http://localhost:5000/uploads/${complaint.opd_slip}` })}
                                            className="aspect-square bg-red-100 flex items-center justify-center overflow-hidden relative cursor-pointer"
                                        >
                                            <div className="w-full h-full p-2 group-hover:scale-110 transition duration-500">
                                                <div className="w-full h-full bg-white border border-red-200 rounded shadow-sm overflow-hidden relative">
                                                    <iframe
                                                        src={`http://localhost:5000/uploads/${complaint.opd_slip}#toolbar=0&navpanes=0&scrollbar=0`}
                                                        className="w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none"
                                                        title="OPD Slip Preview"
                                                    />
                                                    <div className="absolute top-1 right-1 bg-red-600 text-white text-[8px] px-1 rounded font-bold">PDF</div>
                                                </div>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[8px] font-bold py-1 translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-center gap-1 backdrop-blur-sm">
                                                <FaEye size={8} /> TAP TO PREVIEW
                                            </div>
                                        </div>
                                        <div className="p-2 text-center border-t border-red-100 bg-red-50">
                                            <p className="text-[10px] font-bold text-red-700 truncate mb-1">OPD Slip.pdf</p>
                                            <a
                                                href={`http://localhost:5000/api/grievance/complaint-user/download/${complaint.opd_slip}`}
                                                className="text-red-600 hover:text-red-800 transition flex items-center justify-center gap-1 text-[9px] font-bold"
                                            >
                                                <FaDownload size={10} />
                                                DOWNLOAD
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Warehouse Assessment Documents */}
                {assessment?.documents?.length > 0 && (
                    <div className="border rounded-xl p-6 mb-6 bg-white shadow-sm border-blue-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 p-2 rounded-full"><FaFileAlt className="text-blue-600 text-sm" /></span>
                            Warehouse Assessment Supporting Documents
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {assessment.documents.map((doc, index) => {
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
                                            <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[8px] font-bold py-1 translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-center gap-1 backdrop-blur-sm">
                                                <FaEye size={8} /> PREVIEW
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
                    </div>
                )}

                {/* Report Section */}
                {report ? (
                    <div className="border rounded p-4 mb-6">
                        <h3 className="font-semibold mb-3">Report Details</h3>

                        {report.report_description && (
                            <div className="mb-4">
                                <b>Description:</b>
                                <p className="text-sm text-gray-700 mt-1">{report.report_description}</p>
                            </div>
                        )}

                        {report.report_pdf && (
                            <div className="mb-4">
                                <b>Report PDF:</b>
                                {(() => {
                                    // Check if it's already a full URL
                                    const isExternalUrl = report.report_pdf.startsWith('http');
                                    const pdfUrl = isExternalUrl
                                        ? report.report_pdf
                                        : `http://localhost:5000/uploads/reports/${report.report_pdf}`;

                                    // Use Google Docs Viewer for external PDFs to bypass CORS
                                    const embedUrl = isExternalUrl
                                        ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
                                        : pdfUrl;

                                    return (
                                        <>
                                            <div className="mt-2">
                                                <iframe
                                                    src={embedUrl}
                                                    className="w-full h-96 border rounded"
                                                    title="Report PDF"
                                                />
                                            </div>
                                            <div className="mt-4 flex gap-3">
                                                <a
                                                    href={pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block text-sm"
                                                >
                                                    Open PDF in New Tab
                                                </a>
                                                <button
                                                    onClick={() => handleDownloadPdf(pdfUrl)}
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 inline-block text-sm cursor-pointer"
                                                >
                                                    Download Report PDF
                                                </button>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {report.received_at && (
                            <div className="text-sm text-gray-600">
                                <b>Report Received At:</b> {new Date(report.received_at).toLocaleString()}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="border rounded p-4 mb-6 bg-yellow-50">
                        <p className="text-gray-700">No report found for this complaint.</p>
                    </div>
                )}

                {/* Receive Report button */}
                {complaint.status === "SAMPLE_RECEIVED_QC" && report && (
                    <button
                        onClick={handleReceiveReport}
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-3 rounded font-semibold hover:bg-green-700"
                    >
                        {loading ? "Processing..." : "Mark Report as Received"}
                    </button>
                )}

                {/* Popup */}
                {showPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="bg-white p-6 rounded w-96 text-center">
                            <h3 className="font-semibold mb-4">
                                ✅ Report received successfully
                            </h3>

                            <p className="text-sm mb-6">
                                Status moved to <b>REPORT_RECEIVED</b>
                            </p>

                            <div className="flex justify-center">
                                <button
                                    onClick={() => navigate(`/qc/assessment-view/${code}`)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                >
                                    Proceed to View Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* PREVIEW MODAL */}
            {
                previewFile && (
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
                )
            }
        </div >
    );
}

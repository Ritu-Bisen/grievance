import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";

export default function QcReportReceived() {
    const { code } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [report, setReport] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);

    /* ---------------- LOAD DATA ---------------- */

    const loadData = async () => {
        try {
            const res = await api.get(`/grievance/qc/report/view/${code}`);
            setComplaint(res.data.complaint);
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
                                    onClick={() => navigate("/qc/dashboard")}
                                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

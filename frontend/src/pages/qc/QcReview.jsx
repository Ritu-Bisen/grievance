import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import { toast } from "sonner";

export default function QcReview() {
    const { code } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState(null); // 'Approve' or 'Reject'
    const [remarks, setRemarks] = useState("");

    /* ---------------- LOAD DATA ---------------- */

    const loadData = async () => {
        try {
            const res = await api.get(`/grievance/qc/report/view/${code}`);
            setComplaint(res.data.complaint);
            setReport(res.data.report);
        } catch (err) {
            toast.error("Failed to load report data");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    /* ---------------- SUBMIT ACTION ---------------- */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!action) {
            toast.error("Please select Approve or Reject");
            return;
        }

        if (action === 'Reject' && !remarks.trim()) {
            toast.error("Please provide remarks for rejection");
            return;
        }

        setLoading(true);

        try {
            await api.post("/grievance/qc/review", {
                complaint_code: code,
                status: action,
                remarks: remarks
            });

            toast.success(`Complaint ${action}ed successfully`);
            navigate("/qc/dashboard");
        } catch (err) {
            setLoading(false);
            toast.error("Failed to process QC review");
        }
    };

    /* ---------------- DOWNLOAD PDF ---------------- */

    const handleDownloadPdf = (url) => {
        const isExternalUrl = url.startsWith('http') && !url.includes('localhost:5000');
        if (isExternalUrl) {
            const proxyUrl = `http://localhost:5000/api/grievance/qc/download-pdf?url=${encodeURIComponent(url)}`;
            window.location.href = proxyUrl;
        } else {
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
        <div className="min-h-screen bg-gray-100 pb-12">
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

                <h2 className="text-xl font-semibold mb-4 text-purple-800 border-b pb-2">
                    QC Review – {complaint.complaint_code}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT COLUMN: DETAILS */}
                    <div>
                        <div className="border rounded p-4 mb-6 bg-gray-50 shadow-sm transition hover:shadow-md">
                            <h3 className="font-semibold mb-3 border-b text-purple-700">Complaint Details</h3>
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <div><b>Type:</b> {complaint.complaint_type}</div>
                                <div><b>Category:</b> {complaint.category}</div>
                                <div className="col-span-2"><b>Facility:</b> {complaint.facility_name}</div>
                                <div><b>Item:</b> {complaint.item_name}</div>
                                <div><b>Batch:</b> {complaint.batch_no}</div>
                                <div><b>Status:</b> <span className="text-blue-600 font-medium">{complaint.status}</span></div>
                            </div>
                        </div>

                        {report ? (
                            <div className="border rounded p-4 mb-6 bg-white shadow-sm transition hover:shadow-md">
                                <h3 className="font-semibold mb-3 border-b text-purple-700">Report Details</h3>
                                {report.report_description && (
                                    <div className="mb-4">
                                        <b>Description:</b>
                                        <p className="text-sm text-gray-700 mt-1">{report.report_description}</p>
                                    </div>
                                )}
                                {report.received_at && (
                                    <div className="text-sm text-gray-600">
                                        <b>Report Received At:</b> {new Date(report.received_at).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="border rounded p-4 mb-6 bg-yellow-50 text-yellow-700">
                                <p>No report found for this complaint.</p>
                            </div>
                        )}

                        {/* REVIEW FORM */}
                        <form onSubmit={handleSubmit} className="border-2 border-purple-100 rounded-xl p-6 bg-purple-50 space-y-4 shadow-sm">
                            <h3 className="text-lg font-bold text-purple-800 mb-2">Review Action</h3>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setAction('Approve')}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${action === 'Approve'
                                        ? 'bg-green-600 text-white scale-105 shadow-lg ring-2 ring-green-400'
                                        : 'bg-white text-green-700 border border-green-200 hover:bg-green-50'
                                        }`}
                                >
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAction('Reject')}
                                    className={`flex-1 py-3 rounded-lg font-bold transition-all ${action === 'Reject'
                                        ? 'bg-red-600 text-white scale-105 shadow-lg ring-2 ring-red-400'
                                        : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                                        }`}
                                >
                                    Reject
                                </button>
                            </div>

                            {action === 'Reject' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-bold text-gray-700">Reject Remarks <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="w-full border rounded-lg p-3 h-24 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none"
                                        placeholder="Enter the reason for rejection..."
                                        required
                                    />
                                </div>
                            )}


                            <button
                                type="submit"
                                disabled={loading || !action}
                                className={`w-full py-4 rounded-xl font-black text-xl shadow-xl transition-all ${loading || !action
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : action === 'Approve'
                                        ? 'bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 scale-[1.02]'
                                        : 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 scale-[1.02]'
                                    }`}
                            >
                                {loading ? "Processing..." : `Confirm ${action || 'Review'}`}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: PDF VIEW */}
                    <div className="h-full">
                        {report?.report_pdf ? (
                            <div className="sticky top-6 border-2 border-gray-200 rounded-xl overflow-hidden shadow-xl h-[800px] flex flex-col bg-white">
                                <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center text-sm">
                                    <span className="font-medium">Report Document Preview</span>
                                    <button
                                        onClick={() => handleDownloadPdf(report.report_pdf.startsWith('http') ? report.report_pdf : `http://localhost:5000/uploads/reports/${report.report_pdf}`)}
                                        className="bg-white text-gray-800 px-3 py-1 rounded font-bold hover:bg-gray-200"
                                    >
                                        Download PDF
                                    </button>
                                </div>
                                <div className="flex-1">
                                    {(() => {
                                        const isExternalUrl = report.report_pdf.startsWith('http');
                                        const pdfUrl = isExternalUrl
                                            ? report.report_pdf
                                            : `http://localhost:5000/uploads/reports/${report.report_pdf}`;

                                        const embedUrl = isExternalUrl
                                            ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
                                            : pdfUrl;

                                        return (
                                            <iframe
                                                src={embedUrl}
                                                className="w-full h-full border-0"
                                                title="Report PDF"
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 font-medium italic p-12 text-center">
                                No PDF document available for visual review.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

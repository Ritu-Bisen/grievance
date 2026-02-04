import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import ComplaintTopSection from "../../components/ComplaintTopSection";
import { toast } from "sonner";

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
        setLoading(true);

        try {
            await api.post("/grievance/qc/resolve", {
                complaint_code: code,
                remarks: remarks
            });

            toast.success("Complaint resolved and closed successfully");
            navigate("/qc/dashboard");
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
                        <div className="p-6 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
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
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">Final Closing Remarks <span className="text-red-500">*</span></label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full border-2 border-purple-100 rounded-lg p-4 h-32 focus:ring-4 focus:ring-purple-200 focus:border-purple-600 outline-none transition-all"
                                placeholder="Enter the final summary and instructions to close this case..."
                                required
                            />
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
        </div>
    );
}

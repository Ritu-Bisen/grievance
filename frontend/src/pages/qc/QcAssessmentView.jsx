import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import ComplaintTopSection from "../../components/ComplaintTopSection";
import {
    FaBoxOpen,
    FaFileInvoice,
    FaUserCheck,
    FaCheckDouble,
    FaRegCircle,
    FaCheckCircle,
    FaTimesCircle
} from "react-icons/fa";

export default function QcAssessmentView() {
    const { code } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [qc, setQc] = useState(null);
    const [report, setReport] = useState(null);

    /* 🖼 PREVIEW STATE (image / pdf / doc) */
    const [previewFile, setPreviewFile] = useState(null);

    useEffect(() => {
        api
            .get(`/grievance/qc/assessment/view/${code}`)
            .then(res => {
                setComplaint(res.data.complaint);
                setAssessment(res.data.assessment);
                setQc(res.data.qc);
                setReport(res.data.report);
            })
            .catch(() => alert("Failed to load QC assessment"));
    }, [code]);

    if (!complaint) return null;

    /* ---------- FILE TYPE CHECK ---------- */
    const isImage = (name) => /\.(jpg|jpeg|png|webp)$/i.test(name);
    const isPDF = (name) => /\.pdf$/i.test(name);

    return (
        <div className="min-h-screen bg-gray-100">
            <GovHeader />

            <div className="max-w-6xl mx-auto bg-white mt-6 p-6 rounded shadow">

                <button
                    onClick={() => navigate("/qc/dashboard")}
                    className="mb-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                    ← Back to Dashboard
                </button>

                {/* ================= WORKFLOW PROGRESS INDICATOR ================= */}
                <div className="border rounded p-6 mb-8 bg-gray-50 border-t-4 border-t-purple-600 shadow-sm">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                        <FaCheckDouble className="text-purple-600" />
                        Complaint Lifecycle Progress
                    </h3>

                    <div className="relative flex justify-between">
                        {/* Connecting Line */}
                        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-0"></div>
                        <div
                            className="absolute top-5 left-0 h-1 bg-green-500 transition-all duration-500 -z-0"
                            style={{
                                width: qc?.status === 'Reject'
                                    ? '66%'
                                    : (complaint.status === 'RESOLVED' ? '100%' : (qc?.status ? '66%' : (qc?.report_received_date ? '33%' : (qc ? '0%' : '0%'))))
                            }}
                        ></div>

                        {/* Step 1: Sample Received */}
                        <div className="relative z-10 flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${qc ? 'bg-green-100 border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-400'}`}>
                                {qc ? <FaCheckCircle /> : <FaBoxOpen />}
                            </div>
                            <span className={`mt-2 text-xs font-bold ${qc ? 'text-green-700' : 'text-gray-500'}`}>Sample Received</span>
                            <span className="text-[10px] text-gray-400">Step 1</span>
                        </div>

                        {/* Step 2: Report Received */}
                        <div className="relative z-10 flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${qc?.report_received_date ? 'bg-green-100 border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-400'}`}>
                                {qc?.report_received_date ? <FaCheckCircle /> : <FaFileInvoice />}
                            </div>
                            <span className={`mt-2 text-xs font-bold ${qc?.report_received_date ? 'text-green-700' : 'text-gray-500'}`}>Report Received</span>
                            <span className="text-[10px] text-gray-400">Step 2</span>
                        </div>

                        {/* Step 3: QC Verification */}
                        <div className="relative z-10 flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${qc?.status === 'Approve' ? 'bg-green-100 border-green-500 text-green-600' :
                                qc?.status === 'Reject' ? 'bg-red-100 border-red-500 text-red-600' :
                                    'bg-white border-gray-300 text-gray-400'
                                }`}>
                                {qc?.status === 'Approve' ? <FaCheckCircle /> :
                                    qc?.status === 'Reject' ? <FaTimesCircle /> : <FaUserCheck />}
                            </div>
                            <span className={`mt-2 text-xs font-bold ${qc?.status ? (qc.status === 'Reject' ? 'text-red-700' : 'text-green-700') : 'text-gray-500'}`}>
                                {qc?.status === 'Reject' ? 'Verification Rejected' : 'Verify Complaint'}
                            </span>
                            <span className="text-[10px] text-gray-400">Step 3</span>
                        </div>

                        {/* Step 4: Resolved */}
                        <div className="relative z-10 flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${(complaint.status === 'RESOLVED') ? 'bg-green-100 border-green-500 text-green-600' :
                                (qc?.status === 'Reject' && complaint.complaint_close_date) ? 'bg-red-100 border-red-300 text-red-400' :
                                    'bg-white border-gray-300 text-gray-400'
                                }`}>
                                {complaint.status === 'RESOLVED' ? <FaCheckCircle /> :
                                    (qc?.status === 'Reject' && complaint.complaint_close_date) ? <FaTimesCircle /> : <FaCheckDouble />}
                            </div>
                            <span className={`mt-2 text-xs font-bold ${complaint.status === 'RESOLVED' || (qc?.status === 'Reject' && complaint.complaint_close_date) ? (qc?.status === 'Reject' ? 'text-red-400' : 'text-green-700') : 'text-gray-500'}`}>
                                {qc?.status === 'Reject' ? 'Closed (Rejected)' : 'Complaint Resolved'}
                            </span>
                            <span className="text-[10px] text-gray-400">Step 4</span>
                        </div>
                    </div>
                </div>

                <ComplaintTopSection complaint={complaint} />

                {assessment ? (
                    <div className="border rounded p-6">

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                Warehouse Assessment Details
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                            <div><b>Assessment Type:</b> {assessment.assessment_type}</div>
                            <div><b>Item Code:</b> {assessment.item_code}</div>
                            <div><b>Batch No:</b> {assessment.batch_no}</div>
                            <div><b>Tender No:</b> {assessment.tender_no}</div>
                            <div><b>PO No:</b> {assessment.po_no}</div>
                            <div><b>Stock (Warehouse):</b> {assessment.stock_warehouse}</div>
                            <div><b>Stock (Facility):</b> {assessment.stock_facility}</div>
                            <div><b>Total Stock:</b> {assessment.total_stock}</div>

                            {assessment.same_complaint_present && (
                                <div className="col-span-2">
                                    <b>Same Complaint Present at Warehouse:</b>{" "}
                                    {assessment.same_complaint_present}
                                </div>
                            )}

                            {assessment.adr_severity && (
                                <div><b>ADR Severity:</b> {assessment.adr_severity}</div>
                            )}

                            {assessment.quality_description && (
                                <div className="col-span-2">
                                    <b>Quality Description:</b><br />
                                    {assessment.quality_description}
                                </div>
                            )}

                            {assessment.assessment_type === "ADR" && assessment.remarks && (
                                <div className="col-span-2">
                                    <b>Assessment Remarks:</b><br />
                                    {assessment.remarks}
                                </div>
                            )}

                            {complaint.dispatch_remark && (
                                <div className="col-span-2">
                                    <b>Dispatch Remark:</b><br />
                                    {complaint.dispatch_remark}
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">Assessment Documents</h4>

                            {assessment.documents?.length > 0 ? (
                                <div className="space-y-2">
                                    {assessment.documents.map((doc, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center border px-4 py-2 rounded"
                                        >
                                            <span className="text-sm text-gray-700">
                                                {doc.original_name}
                                            </span>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() =>
                                                        setPreviewFile({
                                                            url: `http://localhost:5000/uploads/assessment/${doc.file_name}`,
                                                            name: doc.file_name,
                                                        })
                                                    }
                                                    className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                                                >
                                                    View
                                                </button>

                                                <a
                                                    href={`http://localhost:5000/api/grievance/warehouse/assessment/download/${doc.file_name}`}
                                                    className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No assessment documents uploaded
                                </p>
                            )}
                        </div>
                    </div>

                ) : (
                    <p className="text-gray-500">Assessment not submitted yet</p>
                )}

                {/* ================= QC ASSESSMENT DETAILS (IF CLOSED) ================= */}
                {complaint.complaint_close_date && qc && (
                    <div className="border rounded p-6 mt-6 bg-purple-50">
                        <h3 className="text-lg font-semibold mb-4 text-purple-800">
                            QC Assessment Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <b>Final QC Status:</b>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${qc.status === 'Approve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {qc.status}
                                </span>
                            </div>
                            <div>
                                <b>Close Date:</b> {new Date(complaint.complaint_close_date).toLocaleString()}
                            </div>
                            {qc.remarks && (
                                <div className="col-span-2 mt-2">
                                    <b>QC Remarks:</b>
                                    <p className="p-3 bg-white border rounded mt-1 italic text-gray-700">
                                        {qc.remarks}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ================= QC REPORT PDF (IF RECEIVED) ================= */}
                {qc?.report_received_date && report?.report_pdf && (
                    <div className="border rounded p-6 mt-6 bg-blue-50">
                        <h3 className="text-lg font-semibold mb-4 text-blue-800">
                            QC Analysis Report
                        </h3>

                        {report.report_description && (
                            <div className="mb-4 text-sm">
                                <b>Report Summary:</b>
                                <p className="mt-1 text-gray-700 bg-white p-3 border rounded">
                                    {report.report_description}
                                </p>
                            </div>
                        )}

                        <div className="mb-4">
                            <b>Report Document:</b>
                            {(() => {
                                const isExternalUrl = report.report_pdf.startsWith('http');
                                const pdfUrl = isExternalUrl
                                    ? report.report_pdf
                                    : `http://localhost:5000/uploads/reports/${report.report_pdf}`;

                                const embedUrl = isExternalUrl
                                    ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
                                    : pdfUrl;

                                return (
                                    <div className="mt-2">
                                        <iframe
                                            src={embedUrl}
                                            className="w-full h-96 border rounded bg-white"
                                            title="QC Report PDF"
                                        />
                                        <div className="mt-4 flex gap-3">
                                            <a
                                                href={pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                                            >
                                                Open Report in New Tab
                                            </a>
                                            <button
                                                onClick={() => {
                                                    const isExternal = report.report_pdf.startsWith('http') && !report.report_pdf.includes('localhost:5000');
                                                    if (isExternal) {
                                                        window.location.href = `http://localhost:5000/api/grievance/qc/download-pdf?url=${encodeURIComponent(report.report_pdf)}`;
                                                    } else {
                                                        const link = document.createElement('a');
                                                        link.href = pdfUrl;
                                                        link.download = 'qc_report.pdf';
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    }
                                                }}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
                                            >
                                                Download Report
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="text-xs text-gray-500 text-right italic">
                            Report Received: {new Date(qc.report_received_date).toLocaleString()}
                        </div>
                    </div>
                )}
            </div>

            {/* ================= PREVIEW MODAL ================= */}
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

                        <div className="flex justify-center">
                            {isImage(previewFile.name) ? (
                                <img
                                    src={previewFile.url}
                                    alt="Preview"
                                    className="max-h-[75vh] object-contain"
                                />
                            ) : isPDF(previewFile.name) ? (
                                <iframe
                                    src={previewFile.url}
                                    className="w-full h-[75vh]"
                                    title="PDF Preview"
                                />
                            ) : (
                                <p className="text-gray-600">
                                    Preview not supported. Please download the file.
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

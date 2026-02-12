import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import ComplaintTopSection from "../../components/ComplaintTopSection";
import ComplaintLifecycle from "../../components/ComplaintLifecycle";
import {
    FaBoxOpen,
    FaFileInvoice,
    FaUserCheck,
    FaCheckDouble,
    FaRegCircle,
    FaCheckCircle,
    FaTimesCircle,
    FaWarehouse,
    FaEye,
    FaDownload,
    FaExclamationTriangle,
    FaFileAlt,
    FaFileUpload,
    FaTimes,
    FaPaperclip
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

    /* 🔥 QC ACTION STATES */
    const [submitting, setSubmitting] = useState(false);
    const [reportDescription, setReportDescription] = useState("");
    const [reportFile, setReportFile] = useState(null);
    const [resolutionRemarks, setResolutionRemarks] = useState("");
    const [resolutionFile, setResolutionFile] = useState(null);
    const [resolutionFilePreview, setResolutionFilePreview] = useState(null);

    /* 🧐 REVIEW WORKFLOW STATE */
    const [reviewMode, setReviewMode] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // RECEIVE, REPORT, RESOLVE
    const [pendingData, setPendingData] = useState(null);

    const loadData = () => {
        api
            .get(`/grievance/qc/assessment/view/${code}`)
            .then(res => {
                setComplaint(res.data.complaint);
                setAssessment(res.data.assessment);
                setQc(res.data.qc);
                setReport(res.data.report);
                if (res.data.qc?.remarks) setResolutionRemarks(res.data.qc.remarks);
                if (res.data.report?.report_description) setReportDescription(res.data.report.report_description);
            })
            .catch(() => alert("Failed to load QC assessment"));
    };

    useEffect(() => {
        loadData();
    }, [code]);

    if (!complaint) return null;

    /* ---------- FILE TYPE CHECK ---------- */
    const isImage = (name) => /\.(jpg|jpeg|png|webp)$/i.test(name);
    const isPDF = (name) => /\.pdf$/i.test(name);

    /* ---------- ACTION HANDLERS ---------- */
    const initiateReview = (action, data = null) => {
        setPendingAction(action);
        setPendingData(data);
        setReviewMode(true);
    };

    const handleReceiveSubmit = () => {
        initiateReview("RECEIVE", { complaint_code: code });
    };

    const handleReportSubmit = () => {
        initiateReview("REPORT", { complaint_code: code });
    };

    const handleResolveSubmit = () => {
        if (!resolutionRemarks) return alert("Please provide final resolution remarks");
        initiateReview("RESOLVE", { complaint_code: code, remarks: resolutionRemarks });
    };

    const executeAction = async () => {
        setSubmitting(true);
        try {
            switch (pendingAction) {
                case "RECEIVE":
                    await api.post("/grievance/qc/receive-sample", pendingData);
                    break;
                case "REPORT":
                    await api.post("/grievance/qc/receive-report", pendingData);
                    break;
                case "RESOLVE":
                    {
                        const formData = new FormData();
                        formData.append("complaint_code", code);
                        formData.append("remarks", resolutionRemarks);
                        if (resolutionFile) {
                            formData.append("document", resolutionFile);
                        }
                        await api.post("/grievance/qc/resolve", formData, {
                            headers: { "Content-Type": "multipart/form-data" }
                        });
                    }
                    break;
                default:
                    break;
            }
            setReviewMode(false);
            setPendingAction(null);
            setPendingData(null);
            setResolutionFile(null);
            setResolutionFilePreview(null);
            loadData();
        } catch (err) {
            alert("Action failed: " + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

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

                {/* ================= COMPLAINT LIFECYCLE ================= */}
                <ComplaintLifecycle
                    complaint={complaint}
                    warehouseAssessment={assessment}
                    qcAssessment={qc}
                />

                {/* <ComplaintTopSection complaint={complaint} /> */}

                {/* HEADER */}
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-purple-500 pb-1 inline-block">
                        Complaint Details
                    </h2>
                </div>

                {/* DETAILS - 2 columns grid matching Warehouse view */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 bg-gray-50/50 p-4 rounded-lg border mb-8">
                    {Object.entries({
                        "Complaint ID": complaint.complaint_code,
                        "Type": complaint.complaint_type,
                        "Category": complaint.category,
                        "Facility": complaint.facility_name,
                        "Facility Address": complaint.facility_address || "—",
                        "Item": complaint.item_name,
                        "Item Code": complaint.item_code,
                        "Batch No": complaint.batch_no,
                        "Warehouse Batch": complaint.warehouse_code || "—",
                        "Firm Name": complaint.firm_name || "—",
                        "Mfg Date": complaint.mfg_date ? new Date(complaint.mfg_date).toLocaleDateString() : "—",
                        "Exp Date": complaint.exp_date ? new Date(complaint.exp_date).toLocaleDateString() : "—",
                        "Purchase Date": complaint.purchase_date ? new Date(complaint.purchase_date).toLocaleDateString() : "—",
                        "Quantity Received": complaint.quantity_received || "—",
                        "Affected Quantity": complaint.affected_quantity || "—",
                        "Status": complaint.status,
                        "Created On": complaint.created_at ? new Date(complaint.created_at).toLocaleString() : "—",
                        "Description": complaint.description || "—",
                    }).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-gray-200 py-2 text-sm">
                            <span className="font-semibold text-gray-500 uppercase text-[10px] tracking-wider">{k}</span>
                            <span className="text-gray-800 font-medium text-right ml-2">{v}</span>
                        </div>
                    ))}
                </div>

                {/* DOCUMENTS SECTION (Unified Header, Split Layout) */}
                {(complaint.documents?.length > 0 || complaint.opd_slip) && (
                    <div className="mt-8 border-t pt-6 bg-white p-4 rounded-lg shadow-sm mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                            {/* SUPPORTING DOCUMENTS (LEFT) */}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="bg-blue-100 p-2 rounded-full"><FaFileAlt className="text-blue-600 text-sm" /></span>
                                    Supporting Documents
                                </h3>

                                {complaint.documents?.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                        {complaint.documents.map((doc, index) => {
                                            const name = doc.original_name || doc.file_name || `Doc ${index + 1}`;
                                            const path = doc.file_name || doc;
                                            const fullUrl = `http://localhost:5000/uploads/${path}`;
                                            const isImg = isImage(name);
                                            const isPdf = isPDF(name);

                                            return (
                                                <div
                                                    key={`doc-${index}`}
                                                    className="group border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col"
                                                >
                                                    <div
                                                        onClick={() => setPreviewFile({ name, url: fullUrl })}
                                                        className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden relative cursor-pointer"
                                                    >
                                                        {isImg ? (
                                                            <img src={fullUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="thumb" />
                                                        ) : isPdf ? (
                                                            <div className="flex flex-col items-center gap-1 group-hover:scale-110 transition duration-500">
                                                                <div className="w-14 h-18 bg-red-100 border-2 border-red-200 rounded-lg relative flex items-center justify-center shadow-sm">
                                                                    <span className="text-[9px] font-black text-red-700 bg-white px-1 py-0.5 rounded shadow-sm border border-red-100 italic">PDF</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <FaFileAlt className="text-4xl text-gray-300" />
                                                        )}
                                                        <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[9px] font-bold py-1 translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-center gap-1 backdrop-blur-sm">
                                                            <FaEye size={10} /> TAP TO PREVIEW
                                                        </div>
                                                    </div>
                                                    <div className="p-3 text-center border-t bg-white">
                                                        <p className="text-[10px] font-bold text-gray-700 truncate mb-2" title={name}>{name}</p>
                                                        <div className="flex justify-center">
                                                            <a
                                                                href={`http://localhost:5000/api/grievance/complaint-user/download/${path}`}
                                                                className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 w-full justify-center"
                                                                title="Download"
                                                            >
                                                                <FaDownload size={10} />
                                                                <span>DOWNLOAD</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm italic">No supporting documents uploaded.</p>
                                )}
                            </div>

                            {/* OPD SLIP (RIGHT) */}
                            {complaint.opd_slip && (
                                <div className="w-full md:w-56 shrink-0">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="bg-blue-100 p-2 rounded-full"><FaFileAlt className="text-blue-600 text-sm" /></span>
                                        OPD Slip
                                    </h3>
                                    <div className="group border-2 border-blue-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-blue-50 flex flex-col">
                                        <div
                                            onClick={() => setPreviewFile({ name: "OPD Slip.pdf", url: `http://localhost:5000/uploads/${complaint.opd_slip}` })}
                                            className="aspect-square bg-blue-100 flex items-center justify-center overflow-hidden relative cursor-pointer"
                                        >
                                            <div className="w-full h-full p-2 group-hover:scale-110 transition duration-500">
                                                <div className="w-full h-full bg-white border border-blue-200 rounded-lg shadow-sm overflow-hidden relative">
                                                    <iframe
                                                        src={`http://localhost:5000/uploads/${complaint.opd_slip}#toolbar=0&navpanes=0&scrollbar=0`}
                                                        className="w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none"
                                                        title="OPD Slip Preview"
                                                    />
                                                    <div className="absolute top-1 right-1 bg-red-600 text-white text-[8px] px-1 rounded font-bold">PDF</div>
                                                </div>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[9px] font-bold py-1 translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-center gap-1 backdrop-blur-sm">
                                                <FaEye size={10} /> TAP TO PREVIEW
                                            </div>
                                        </div>
                                        <div className="p-3 text-center border-t border-blue-100 bg-blue-50">
                                            <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">OPD Slip.pdf</p>
                                            <div className="flex justify-center">
                                                <a
                                                    href={`http://localhost:5000/api/grievance/complaint-user/download/${complaint.opd_slip}`}
                                                    className="text-blue-600 hover:text-blue-800 transition flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white py-1.5 px-3 rounded-lg border border-blue-100 w-full"
                                                >
                                                    <FaDownload size={10} />
                                                    <span>DOWNLOAD</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {assessment ? (
                    <div className="border rounded-xl p-6 bg-white shadow-sm border-purple-100 mt-6">
                        <div className="flex items-center gap-2 border-b border-purple-100 pb-3 mb-6">
                            <FaWarehouse className="text-purple-600" />
                            <h3 className="text-lg font-bold text-gray-800 tracking-tight">
                                Warehouse Assessment Details
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 bg-gray-50/50 p-4 rounded-lg border mb-6">
                            {[
                                ["Batch No", assessment.batch_no],
                                ["Tender No", assessment.tender_no],
                                ["PO No", assessment.po_no],
                                ["Stock (WH)", assessment.stock_warehouse],
                                ["Stock (Facility)", assessment.stock_facility],
                                ["Total Stock", assessment.total_stock],
                                ["Same Complaint Present", assessment.same_complaint_present === 'YES' ? 'Yes' : 'No'],
                                ...(assessment.adr_severity ? [["ADR Severity", assessment.adr_severity]] : []),
                                ...((assessment.quality_description || assessment.remarks) ? [["Assessment Remarks", assessment.quality_description || assessment.remarks]] : []),
                                ...((complaint.dispatch_remark) ? [["Dispatch Remark", complaint.dispatch_remark]] : []),
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between border-b border-gray-200 py-2 text-sm">
                                    <span className="font-semibold text-gray-500 uppercase text-[10px] tracking-wider">{label}</span>
                                    <span className="text-gray-800 font-medium text-right ml-2">{value || "—"}</span>
                                </div>
                            ))}
                        </div>

                        {/* ASSESSMENT DOCUMENTS GRID (PREMIUM STYLE) */}
                        {assessment.documents?.length > 0 && (
                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="bg-purple-100 p-2 rounded-full"><FaFileAlt className="text-purple-600 text-sm" /></span>
                                    Assessment Supporting Documents
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {assessment.documents.map((doc, index) => {
                                        const name = typeof doc === "string" ? doc : (doc.original_name || doc.file_name || `Doc ${index + 1}`);
                                        const fileName = typeof doc === "string" ? doc : doc.file_name;
                                        const fullUrl = `http://localhost:5000/uploads/assessment/${fileName}`;
                                        const isImg = isImage(name);
                                        const isPdf = isPDF(name);

                                        return (
                                            <div key={`as-doc-${index}`} className="group border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col">
                                                <div
                                                    onClick={() => setPreviewFile({ name, url: fullUrl })}
                                                    className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden relative cursor-pointer"
                                                >
                                                    {isImg ? (
                                                        <img src={fullUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="thumb" />
                                                    ) : isPdf ? (
                                                        <div className="w-14 h-18 bg-red-100 border-2 border-red-200 rounded-lg relative flex items-center justify-center shadow-sm group-hover:scale-110 transition duration-500">
                                                            <span className="text-[9px] font-black text-red-700 bg-white px-1 py-0.5 rounded shadow-sm border border-red-100">PDF</span>
                                                        </div>
                                                    ) : (
                                                        <FaFileAlt className="text-4xl text-gray-300" />
                                                    )}
                                                    <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[9px] font-bold py-1 translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-center gap-1 backdrop-blur-sm">
                                                        <FaEye size={10} /> TAP TO PREVIEW
                                                    </div>
                                                </div>
                                                <div className="p-3 text-center border-t bg-white">
                                                    <p className="text-[10px] font-bold text-gray-700 truncate mb-2" title={name}>{name}</p>
                                                    <a
                                                        href={`http://localhost:5000/api/grievance/warehouse/assessment/download/${fileName}`}
                                                        className="text-purple-600 hover:text-purple-800 transition flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest bg-purple-50 py-1.5 rounded-lg border border-purple-100"
                                                    >
                                                        <FaDownload size={10} /> Download
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center gap-4 text-gray-500 italic mt-6">
                        <FaRegCircle size={20} />
                        <span>Warehouse assessment not submitted yet.</span>
                    </div>
                )}

                {/* ================= QC ASSESSMENT DETAILS (IF CLOSED) ================= */}
                {complaint.complaint_close_date && qc && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-purple-500 pb-1 inline-block uppercase">
                                QC Assessment Details
                            </h2>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Data Column (LEFT) */}
                            <div className="flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 bg-gray-50/50 p-4 rounded-lg border">
                                    {[
                                        ["Final QC Status", (
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${qc.status === 'Approve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {qc.status}
                                            </span>
                                        )],
                                        ["Close Date", new Date(complaint.complaint_close_date).toLocaleString()],
                                        ["QC Remarks", qc.remarks || "—"],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between border-b border-gray-200 py-2 text-sm items-center">
                                            <span className="font-semibold text-gray-500 uppercase text-[10px] tracking-wider">{k}</span>
                                            <span className="text-gray-800 font-medium text-right ml-2">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Image Column (RIGHT) */}
                            {qc.document && (
                                <div className="w-full lg:w-72 shrink-0">
                                    <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
                                        <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <FaFileAlt size={12} /> Resolution Document
                                        </p>
                                        <div className="group border-2 border-gray-50 rounded-xl overflow-hidden shadow-md transition-all bg-gray-50 relative aspect-square">
                                            <div
                                                onClick={() => setPreviewFile({ name: "Resolution Document", url: `http://localhost:5000/uploads/assessment/${qc.document}` })}
                                                className="w-full h-full cursor-pointer overflow-hidden"
                                            >
                                                <img
                                                    src={`http://localhost:5000/uploads/assessment/${qc.document}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                    alt="Resolution Doc"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] font-bold py-2 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition duration-300 backdrop-blur-sm">
                                                    <FaEye size={12} /> TAP TO PREVIEW
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href={`http://localhost:5000/api/grievance/warehouse/assessment/download/${qc.document}`}
                                            className="mt-4 text-purple-600 hover:text-white hover:bg-purple-600 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border border-purple-200 bg-purple-50 py-3 rounded-xl w-full"
                                        >
                                            <FaDownload size={12} />
                                            DOWNLOAD FILE
                                        </a>
                                    </div>
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

                {/* ================= ACTION CENTER ================= */}
                {!(complaint.status === "RESOLVED" || complaint.complaint_close_date) && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaCheckCircle className="text-purple-600" />
                            Action Center
                        </h3>

                        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                            {/* PHYSICAL complaints with no sample dispatch - View Only */}
                            {assessment?.assessment_type === "PHYSICAL" && !assessment?.sample_dispatch_date ? (
                                <div className="flex items-center gap-4 text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <FaExclamationTriangle className="text-xl" />
                                    <div>
                                        <p className="font-bold">Physical Inspection Required</p>
                                        <p className="text-sm">This is a physical complaint. Please review the details. No sample tracking is available for this complaint.</p>
                                    </div>
                                </div>
                            ) : complaint.status === "SAMPLE_DISPATCHED_WH" ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-bold text-purple-900 text-lg">Sample Receipt Acknowledgement</p>
                                        <p className="text-gray-600">The warehouse has dispatched the sample. Confirm receipt to proceed with laboratory analysis.</p>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={handleReceiveSubmit}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition"
                                        >
                                            Mark Sample Received
                                        </button>
                                    </div>
                                </div>
                            ) : complaint.status === "SAMPLE_RECEIVED_QC" ? (
                                <div className="space-y-6">
                                    <div>
                                        <p className="font-bold text-purple-900 text-lg">Analysis Report Verification</p>
                                        <p className="text-gray-600">Review the laboratory analysis report before acknowledging receipt.</p>
                                    </div>

                                    {!report ? (
                                        <div className="flex items-center gap-4 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
                                            <FaExclamationTriangle className="text-xl" />
                                            <div>
                                                <p className="font-bold uppercase tracking-widest text-[10px]">Attention Required</p>
                                                <p className="text-sm font-medium italic">Analysis Report not found in the laboratory system for this batch.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Report Remark */}
                                            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] block mb-2">Analysis Report Remark</label>
                                                <p className="text-gray-800 font-medium italic leading-relaxed">
                                                    "{report.report_description || "No specific remarks provided by the laboratory."}"
                                                </p>
                                            </div>

                                            {/* Report PDF Preview */}
                                            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
                                                <label className="text-[10px] font-bold text-purple-500 uppercase tracking-[2px] block mb-3">Report PDF Preview</label>
                                                <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 h-[400px]">
                                                    {(() => {
                                                        const isExternalUrl = report.report_pdf?.startsWith('http');
                                                        const pdfUrl = isExternalUrl
                                                            ? report.report_pdf
                                                            : `http://localhost:5000/uploads/reports/${report.report_pdf}`;

                                                        const embedUrl = isExternalUrl
                                                            ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
                                                            : pdfUrl;

                                                        return (
                                                            <iframe
                                                                src={embedUrl}
                                                                className="w-full h-full"
                                                                title="QC Report Preview"
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    onClick={handleReportSubmit}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-green-100 transition transform active:scale-95 flex items-center gap-3"
                                                >
                                                    <span>REPORT RECEIVED</span>
                                                    <FaCheckCircle />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (complaint.status === "REPORT_RECEIVED" || complaint.status === "APPROVE_BY_QC") && !complaint.complaint_close_date ? (
                                <div className="space-y-6">
                                    <div>
                                        <p className="font-bold text-purple-900 text-lg">Final Resolution Feedback</p>
                                        <p className="text-gray-600">Based on the reports and assessments, provide the final decision and closing remarks.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">Final Remarks *</label>
                                                <textarea
                                                    rows="3"
                                                    value={resolutionRemarks}
                                                    onChange={(e) => setResolutionRemarks(e.target.value)}
                                                    className="w-full border-2 border-purple-100 px-4 py-3 rounded-xl bg-white focus:border-purple-600 transition outline-none text-sm shadow-sm"
                                                    placeholder="Enter final summary..."
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">Supporting Document (Optional)</label>
                                                <div className="flex items-center gap-4 bg-purple-50/30 p-2 rounded-xl border border-purple-100">
                                                    <input
                                                        type="file"
                                                        id="qc-res-simple"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const f = e.target.files[0];
                                                            if (f) {
                                                                setResolutionFile(f);
                                                                setResolutionFilePreview(URL.createObjectURL(f));
                                                            }
                                                        }}
                                                    />
                                                    {!resolutionFilePreview ? (
                                                        <label
                                                            htmlFor="qc-res-simple"
                                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-purple-200 text-purple-600 rounded-lg text-xs font-bold cursor-pointer hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <FaFileUpload size={14} />
                                                            Select Document Image
                                                        </label>
                                                    ) : (
                                                        <div className="flex-1 flex items-center justify-between gap-3 bg-white p-1 pr-3 rounded-lg border border-purple-200">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-md overflow-hidden border border-purple-100 shadow-sm">
                                                                    <img src={resolutionFilePreview} className="w-full h-full object-cover" alt="Preview" />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-purple-700 truncate max-w-[150px]">{resolutionFile.name}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setResolutionFile(null);
                                                                    setResolutionFilePreview(null);
                                                                }}
                                                                className="text-red-500 hover:text-red-700 transition font-black text-xs"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button
                                                onClick={() => {
                                                    if (!resolutionRemarks) return toast.error("Please enter remarks");
                                                    setPendingAction("RESOLVE");
                                                    setReviewMode(true);
                                                }}
                                                className="bg-purple-800 hover:bg-purple-900 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition"
                                            >
                                                Finalize & Resolve Complaint
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200 italic">
                                    <FaRegCircle className="text-xl" />
                                    <span>No pending actions for this complaint status.</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ================= REVIEW OVERLAY ================= */}
            {reviewMode && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full relative overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-purple-700 px-8 py-5 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <FaCheckDouble size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold leading-tight">Review & Process Action</h3>
                                    <p className="text-purple-100 text-xs font-medium uppercase tracking-[2px]">Action: {pendingAction}</p>
                                </div>
                            </div>
                            <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/20 text-[10px] font-black tracking-widest uppercase">
                                Confirmation Required
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/50">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Complaint Code</label>
                                    <p className="text-gray-900 font-bold">{complaint.complaint_code}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Item Name</label>
                                    <p className="text-gray-900 font-bold truncate" title={complaint.item_name}>{complaint.item_name}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Target Status</label>
                                    <p className="text-purple-600 font-black">
                                        {pendingAction === 'RECEIVE' ? 'SAMPLE_RECEIVED_QC' :
                                            pendingAction === 'REPORT' ? 'REPORT_RECEIVED' :
                                                'RESOLVED'}
                                    </p>
                                </div>
                            </div>

                            {/* Action Specific Review */}
                            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-purple-50 bg-purple-50/30">
                                    <h4 className="font-bold text-purple-900 flex items-center gap-2">
                                        <FaFileAlt className="text-sm" /> Submission Details
                                    </h4>
                                </div>
                                <div className="p-6 space-y-6">
                                    {pendingAction === 'RECEIVE' && (
                                        <p className="text-gray-600 font-medium">You are acknowledging the receipt of the physical sample for this complaint. This will transition the complaint to the technical analysis stage.</p>
                                    )}

                                    {pendingAction === 'REPORT' && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Laboratory Analysis Summary</label>
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm italic">
                                                    "{report?.report_description || "No specific remarks provided."}"
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                                                <div className="bg-green-600 p-2 rounded-lg text-white"><FaFileAlt size={16} /></div>
                                                <div>
                                                    <p className="text-xs font-bold text-green-800">Analysis Report PDF Attached</p>
                                                    <p className="text-[10px] text-green-600 font-medium uppercase tracking-tighter">Verified in System</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {pendingAction === 'RESOLVE' && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Closing Remarks</label>
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm italic leading-relaxed">
                                                    "{resolutionRemarks}"
                                                </div>
                                            </div>

                                            {resolutionFilePreview && (
                                                <div>
                                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Resolution Document Preview</label>
                                                    <div className="w-48">
                                                        <div className="rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                                                            <img
                                                                src={resolutionFilePreview}
                                                                alt="Resolution preview"
                                                                className="w-full aspect-square object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Important Notice */}
                            <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800">
                                <FaExclamationTriangle className="text-2xl mt-1 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-bold mb-1 uppercase tracking-tight">Finalizing Process</p>
                                    <p className="font-medium opacity-80 leading-relaxed">Please ensure all information above is accurate. Once processed, these details will be permanently recorded in the system and the lifecycle will advance.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-white border-t flex justify-end gap-4">
                            <button
                                onClick={() => setReviewMode(false)}
                                disabled={submitting}
                                className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                Back to Edit
                            </button>
                            <button
                                onClick={executeAction}
                                disabled={submitting}
                                className="px-10 py-3 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-100 transition transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? "Processing..." : (
                                    <>
                                        <span>FINAL PROCESS</span>
                                        <FaUserCheck />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ================= FILE PREVIEW MODAL ================= */}
            {previewFile && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-6 lg:p-10 scale-in-center">
                    <div className="bg-white rounded-3xl shadow-2xl relative max-w-5xl w-full flex flex-col overflow-hidden animate-slide-up h-[90vh]">
                        {/* Modal Header */}
                        <div className="bg-purple-700 px-8 py-5 flex items-center justify-between text-white border-b-4 border-purple-800">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-2 rounded-xl text-white backdrop-blur-md">
                                    <FaFileAlt size={20} />
                                </div>
                                <h4 className="text-xl font-black truncate max-w-[200px] md:max-w-md tracking-tight">
                                    {previewFile.name}
                                </h4>
                            </div>
                            <button
                                onClick={() => setPreviewFile(null)}
                                className="bg-red-500/10 hover:bg-red-500 text-red-100 hover:text-white p-3 rounded-full transition-all duration-300 shadow-inner group"
                            >
                                <FaTimes size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4">
                            {isImage(previewFile.name) ? (
                                <img
                                    src={previewFile.url}
                                    alt="Large Preview"
                                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border-4 border-white"
                                />
                            ) : isPDF(previewFile.name) ? (
                                <iframe
                                    src={previewFile.url}
                                    className="w-full h-full rounded-xl border-4 border-white shadow-2xl bg-white"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="text-center p-12 bg-white rounded-3xl shadow-xl border-2 border-purple-100">
                                    <div className="bg-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FaFileAlt className="text-4xl text-purple-600" />
                                    </div>
                                    <h5 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-wide">Preview Unavailable</h5>
                                    <p className="text-gray-500 font-bold mb-8">This file type does not support direct browser preview.</p>
                                    <a
                                        href={previewFile.url}
                                        download
                                        className="inline-flex items-center gap-3 bg-purple-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[2px] hover:bg-purple-700 transition shadow-xl hover:shadow-purple-200 active:scale-95"
                                    >
                                        <FaDownload size={20} />
                                        Download to View
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-white/90 backdrop-blur-md px-10 py-6 border-t flex justify-end gap-6">
                            <button
                                onClick={() => setPreviewFile(null)}
                                className="px-10 py-4 bg-gray-100 text-gray-700 font-black rounded-2xl hover:bg-gray-200 transition active:scale-95 uppercase tracking-widest text-xs"
                            >
                                Close Preview
                            </button>
                            <a
                                href={previewFile.url}
                                download
                                className="flex items-center gap-3 bg-purple-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[2px] hover:bg-purple-700 transition shadow-xl shadow-purple-100 active:scale-95"
                            >
                                <FaDownload size={14} />
                                Download File
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

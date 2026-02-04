/* ============================================================= */
/*              COMPLAINT LIFECYCLE COMPONENT                     */
/* ============================================================= */

import { FaCheck, FaTimes, FaCircle, FaExclamationTriangle } from "react-icons/fa";

/**
 * ComplaintLifecycle Component
 * 
 * Shows the step-by-step lifecycle of a complaint in horizontal format.
 * 
 * Props:
 * - complaint: The complaint object from complaints table
 * - warehouseAssessment: The warehouse assessment object (optional)
 * - qcAssessment: The QC assessment object (optional)
 */

const STEPS = [
    { id: 1, label: "Submitted", key: "submitted" },
    { id: 2, label: "Dispatched (Facility)", key: "dispatch_facility" },
    { id: 3, label: "Received (WH)", key: "received_warehouse" },
    { id: 4, label: "WH Review", key: "in_progress_warehouse" },
    { id: 5, label: "Dispatched (WH)", key: "dispatch_qc" },
    { id: 6, label: "Received (QC)", key: "received_qc" },
    { id: 7, label: "Report Received", key: "report_received" },
    { id: 8, label: "Resolved", key: "resolved" },
];

// Steps shown when complaint is rejected at warehouse
const REJECTED_STEPS = [
    { id: 1, label: "Submitted", key: "submitted" },
    { id: 2, label: "Dispatched (Facility)", key: "dispatch_facility" },
    { id: 3, label: "Received (WH)", key: "received_warehouse" },
    { id: 4, label: "Rejected (WH)", key: "rejected_warehouse" },
];

export default function ComplaintLifecycle({ complaint, warehouseAssessment, qcAssessment }) {
    if (!complaint) return null;

    const isRejected = complaint.status === "REJECTED_WH";

    // Choose which steps to show
    const visibleSteps = isRejected ? REJECTED_STEPS : STEPS;

    // Calculate which steps are completed
    const getStepStatus = (stepKey) => {
        const status = complaint.status;

        switch (stepKey) {
            case "submitted":
                return "completed";

            case "dispatch_facility":
                if (complaint.date_of_dispatch) return "completed";
                return "pending";

            case "received_warehouse":
                if (["SAMPLE_RECEIVED_WH", "IN_PROGRESS_WH", "REJECTED_WH", "SAMPLE_DISPATCHED_WH",
                    "SAMPLE_RECEIVED_QC", "REPORT_RECEIVED", "APPROVE_BY_QC", "REJECT_BY_QC", "RESOLVED"].includes(status)) {
                    return "completed";
                }
                return "pending";

            case "rejected_warehouse":
                return "rejected";

            case "in_progress_warehouse":
                if (["IN_PROGRESS_WH", "SAMPLE_DISPATCHED_WH", "SAMPLE_RECEIVED_QC",
                    "REPORT_RECEIVED", "APPROVE_BY_QC", "REJECT_BY_QC", "RESOLVED"].includes(status)) {
                    return "completed";
                }
                return "pending";

            case "dispatch_qc":
                if (warehouseAssessment?.sample_dispatch_date) return "completed";
                return "pending";

            case "received_qc":
                if (qcAssessment) return "completed";
                return "pending";

            case "report_received":
                if (qcAssessment?.report_received_date) return "completed";
                return "pending";

            case "resolved":
                if (status === "RESOLVED") return "completed";
                return "pending";

            default:
                return "pending";
        }
    };

    // Get date or info for each step
    const getStepInfo = (stepKey) => {
        const formatDate = (date) => {
            if (!date) return null;
            return new Date(date).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });
        };

        switch (stepKey) {
            case "submitted":
                return formatDate(complaint.created_at);
            case "dispatch_facility":
                return formatDate(complaint.date_of_dispatch);
            case "received_warehouse":
                return formatDate(complaint.sample_received_date);
            case "in_progress_warehouse":
                // For WH Review, show complaint status text as requested
                return complaint.status;

            case "rejected_warehouse":
                // For rejection step, show rejection date
                return formatDate(complaint.rejected_at);

            case "dispatch_qc":
                return formatDate(warehouseAssessment?.sample_dispatch_date);
            case "received_qc":
                return formatDate(qcAssessment?.created_at);
            case "report_received":
                return formatDate(qcAssessment?.report_received_date);
            case "resolved":
                // Check qcAssessment first, then fallback to complaint
                return formatDate(qcAssessment?.complaint_close_date || complaint.complaint_close_date);
            default:
                return null;
        }
    };

    // Calculate progress percentage
    const completedCount = visibleSteps.filter(step => {
        const st = getStepStatus(step.key);
        return st === "completed" || st === "rejected";
    }).length;
    const progressPercent = (completedCount / visibleSteps.length) * 100;

    return (
        <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">
                📋 Complaint Lifecycle
            </h3>

            {/* Horizontal Timeline */}
            <div className="relative pb-8">
                {/* Progress Bar Background */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded"></div>

                {/* Progress Bar Fill */}
                <div
                    className={`absolute top-4 left-0 h-1 rounded transition-all duration-500 ${isRejected ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${progressPercent}%` }}
                ></div>

                {/* Steps */}
                <div className="flex justify-between relative">
                    {visibleSteps.map((step, index) => {
                        const stepStatus = getStepStatus(step.key);
                        const stepInfo = getStepInfo(step.key);

                        return (
                            <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / visibleSteps.length}%` }}>
                                {/* Step Circle */}
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 border-2
                  ${stepStatus === "completed" ? "bg-green-500 border-green-500 text-white" : ""}
                  ${stepStatus === "rejected" ? "bg-red-500 border-red-500 text-white" : ""}
                  ${stepStatus === "pending" ? "bg-white border-gray-300 text-gray-400" : ""}
                `}>
                                    {stepStatus === "completed" && <FaCheck className="text-[10px]" />}
                                    {stepStatus === "rejected" && <FaTimes className="text-[10px]" />}
                                    {stepStatus === "pending" && <span className="text-xs">{index + 1}</span>}
                                </div>

                                {/* Step Label */}
                                <span className={`
                  mt-2 text-[10px] text-center font-medium leading-tight
                  ${stepStatus === "completed" ? "text-green-700" : ""}
                  ${stepStatus === "rejected" ? "text-red-700" : ""}
                  ${stepStatus === "pending" ? "text-gray-500" : ""}
                `}>
                                    {step.label}
                                </span>

                                {/* Step Date/Info */}
                                {stepInfo && (
                                    <span className="mt-1 text-[9px] text-gray-500 text-center font-medium">
                                        {stepInfo}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Rejection Notice */}
            {isRejected && (
                <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <FaExclamationTriangle className="text-red-500 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-700">Complaint Rejected at Warehouse</p>
                        <p className="text-xs text-red-600 mt-1">
                            This complaint was found invalid during warehouse review and has been closed.
                        </p>
                        {complaint.rejected_at && (
                            <p className="text-xs text-red-600 mt-1">
                                <b>Rejected On:</b> {new Date(complaint.rejected_at).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

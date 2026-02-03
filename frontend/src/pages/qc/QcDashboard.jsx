/* ============================================================= */
/*                      QC DASHBOARD                             */
/* ============================================================= */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import GovHeader from "../../components/GovHeader";

import {
    FaFlask,
    FaHeartbeat,
    FaExclamationTriangle,
    FaBox
} from "react-icons/fa";

/* ============================================================= */
/*                       COMPONENT                               */
/* ============================================================= */

export default function QcDashboard() {
    const navigate = useNavigate();

    /* ======================= STATE ============================== */

    const [complaints, setComplaints] = useState([]);

    const [complaintCode, setComplaintCode] = useState("");
    const [status, setStatus] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredIds, setFilteredIds] = useState([]);

    /* =================== LOAD DASHBOARD ========================= */

    const loadDashboard = async (complaintType = "") => {
        try {
            const res = await api.get("/grievance/qc/dashboard", {
                params: {
                    complaintCode,
                    status,
                    fromDate,
                    toDate,
                    complaintType,
                    _t: Date.now()
                }
            });

            setComplaints(res.data.complaints || []);
        } catch (err) {
            console.error("QC DASHBOARD ERROR:", err);
            alert("Failed to load QC dashboard");
        }
    };

    /* =================== INITIAL LOAD =========================== */

    useEffect(() => {
        loadDashboard();
    }, []);

    /* =================== CLEAR FILTERS ========================== */

    const clearFilters = () => {
        setComplaintCode("");
        setStatus("");
        setFromDate("");
        setToDate("");
        setShowDropdown(false);
        setFilteredIds([]);
        loadDashboard();
    };

    /* ================= COMPLAINT SEARCH ========================= */

    const handleComplaintSearchChange = (value) => {
        setComplaintCode(value);
        setShowDropdown(true);

        if (!value) {
            setFilteredIds(complaints);
            return;
        }

        const matches = complaints.filter((c) =>
            c.complaint_code?.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredIds(matches);
    };

    /* =========================== UI ============================= */

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-gray-50 to-blue-50">
            <GovHeader />

            <div className="max-w-7xl mx-auto p-6 space-y-6">

                {/* ================= WELCOME ================= */}
                <div className="flex items-center gap-4 bg-white shadow-lg border-l-8 border-purple-700 rounded-lg px-6 py-4">
                    <FaFlask className="text-purple-800 text-3xl" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            QC Dashboard
                        </h2>
                        <p className="text-sm text-gray-500">
                            Quality Control & Assessment Management
                        </p>
                    </div>
                </div>

                {/* ================= QUICK FILTERS ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => loadDashboard("ADR")}
                        className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-5 rounded-xl shadow-lg hover:scale-105 transition"
                    >
                        <FaHeartbeat className="mx-auto text-2xl mb-2" />
                        <span className="font-bold">ADR</span>
                    </button>

                    <button
                        onClick={() => loadDashboard("QUALITY")}
                        className="bg-gradient-to-r from-purple-500 to-purple-700 text-white py-5 rounded-xl shadow-lg hover:scale-105 transition"
                    >
                        <FaExclamationTriangle className="mx-auto text-2xl mb-2" />
                        <span className="font-bold">Poor Quality</span>
                    </button>

                    <button
                        onClick={() => loadDashboard("PHYSICAL")}
                        className="bg-gradient-to-r from-amber-500 to-amber-700 text-white py-5 rounded-xl shadow-lg hover:scale-105 transition"
                    >
                        <FaBox className="mx-auto text-2xl mb-2" />
                        <span className="font-bold">Physical</span>
                    </button>
                </div>

                {/* ================= FILTER CARD ================= */}
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                    <h3 className="font-semibold text-gray-700 border-b pb-2">
                        Filters
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                        {/* Complaint ID */}
                        <div className="relative">
                            <label className="text-sm font-medium">Complaint ID</label>
                            <input
                                value={complaintCode}
                                onChange={(e) => handleComplaintSearchChange(e.target.value)}
                                onFocus={() => {
                                    setShowDropdown(true);
                                    setFilteredIds(complaints);
                                }}
                                className="border px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-purple-600"
                                placeholder="Enter Complaint ID"
                            />

                            {showDropdown && filteredIds.length > 0 && (
                                <div className="absolute bg-white border w-full mt-1 rounded-lg shadow-xl z-20 max-h-40 overflow-y-auto">
                                    {filteredIds.map((c) => (
                                        <div
                                            key={c.complaint_code}
                                            onClick={() => {
                                                setComplaintCode(c.complaint_code);
                                                setShowDropdown(false);
                                            }}
                                            className="px-3 py-2 cursor-pointer hover:bg-purple-50"
                                        >
                                            {c.complaint_code}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="border px-3 py-2 w-full rounded-lg"
                            >
                                <option value="">All</option>
                                <option value="SAMPLE_DISPATCHED_WH">Sample Dispatched (Warehouse)</option>
                                <option value="SAMPLE_RECEIVED_QC">Sample Received (QC)</option>
                                <option value="REPORT_RECEIVED">Report Received</option>
                                <option value="IN_PROGRESS_QC">In Progress (QC)</option>
                                <option value="COMPLETED_QC">Completed (QC)</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                        </div>

                        {/* Dates */}
                        <div>
                            <label className="text-sm font-medium">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="border px-3 py-2 w-full rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="border px-3 py-2 w-full rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={clearFilters}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg"
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => loadDashboard()}
                            className="bg-purple-500 text-white px-6 py-2 rounded-lg shadow"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* ================= TABLE ================= */}
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-purple-500 text-white">
                            <tr>
                                {[
                                    "Complaint ID", "Type", "Category", "Facility", "Item",
                                    "Batch", "Status", "Date", "View", "Action"
                                ].map(h => (
                                    <th key={h} className="p-3 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {complaints.length === 0 && (
                                <tr>
                                    <td colSpan="10" className="p-6 text-center text-gray-500">
                                        No complaints found
                                    </td>
                                </tr>
                            )}

                            {complaints.map((c, i) => (
                                <tr
                                    key={c.complaint_code}
                                    className={`border-t hover:bg-purple-50 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"
                                        }`}
                                >
                                    <td className="p-3 font-medium">{c.complaint_code}</td>
                                    <td className="p-3">{c.complaint_type}</td>
                                    <td className="p-3">{c.category}</td>
                                    <td className="p-3">{c.facility_name}</td>
                                    <td className="p-3">{c.item_name}</td>
                                    <td className="p-3">{c.batch_no}</td>
                                    <td className="p-3">
                                        <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {new Date(c.created_at).toLocaleDateString()}
                                    </td>

                                    {/* VIEW */}
                                    <td className="p-3">
                                        <button
                                            onClick={() =>
                                                navigate(`/qc/assessment/view/${c.complaint_code}`)
                                            }
                                            className="bg-indigo-600 text-white px-3 py-1 rounded text-xs w-full"
                                        >
                                            View
                                        </button>
                                    </td>

                                    {/* ACTION */}
                                    <td className="p-3">
                                        {/* PHYSICAL complaints with no sample dispatch - View Only */}
                                        {c.assessment_type === "PHYSICAL" && !c.sample_dispatch_date ? (
                                            <span className="px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-700 block text-center font-bold">
                                                Physical (View Only)
                                            </span>
                                        ) : c.status === "SAMPLE_DISPATCHED_WH" ? (
                                            <button
                                                onClick={() => {
                                                    navigate(`/qc/sample-received/${c.complaint_code}`);
                                                }}
                                                className="bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-xs text-white w-full"
                                            >
                                                Sample Received
                                            </button>
                                        ) : c.status === "SAMPLE_RECEIVED_QC" ? (
                                            <button
                                                onClick={() => {
                                                    navigate(`/qc/report-received/${c.complaint_code}`);
                                                }}
                                                className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs text-white w-full"
                                            >
                                                Report Received
                                            </button>
                                        ) : c.status === "REPORT_RECEIVED" && !c.complaint_close_date ? (
                                            <button
                                                onClick={() => {
                                                    navigate(`/qc/resolve/${c.complaint_code}`);
                                                }}
                                                className="bg-purple-600 hover:bg-purple-700 font-bold px-3 py-1 rounded text-xs text-white w-full"
                                            >
                                                Complaint Resolve
                                            </button>
                                        ) : c.status === "APPROVE_BY_QC" && !c.complaint_close_date ? (
                                            <button
                                                onClick={() => {
                                                    navigate(`/qc/resolve/${c.complaint_code}`);
                                                }}
                                                className="bg-purple-600 hover:bg-purple-700 font-bold px-3 py-1 rounded text-xs text-white w-full"
                                            >
                                                Complaint Resolve
                                            </button>
                                        ) : c.status === "REJECT_BY_QC" && c.complaint_close_date ? (
                                            <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700 block text-center font-bold">
                                                Complaint Rejected
                                            </span>
                                        ) : c.status === "RESOLVED" ? (
                                            <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 block text-center font-bold">
                                                Complaint Resolved
                                            </span>
                                        ) : (
                                            <button
                                                disabled
                                                className="bg-gray-400 px-3 py-1 rounded text-xs text-white w-full cursor-not-allowed"
                                            >
                                                No Action
                                            </button>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

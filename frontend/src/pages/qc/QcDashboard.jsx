/* ============================================================= */
/*                      QC DASHBOARD                             */
/* ============================================================= */

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../services/api.js";
import GovHeader from "../../components/GovHeader";

import {
    FaFlask,
    FaHeartbeat,
    FaExclamationTriangle,
    FaBox,
    FaChartBar,
    FaCheckCircle,
    FaBroom,
    FaFilter,
    FaDownload,
    FaUserShield,
    FaSearch
} from "react-icons/fa";

/* ============================================================= */
/*                       COMPONENT                               */
/* ============================================================= */

export default function QcDashboard() {
    const navigate = useNavigate();
    const statusPriority = {
        'SUBMITTED': 1,
        'SAMPLE_DISPATCHED_FACILITY': 2,
        'SAMPLE_RECEIVED_WH': 3,
        'IN_PROGRESS_WH': 4,
        'SAMPLE_DISPATCHED_WH': 5,
        'SAMPLE_RECEIVED_QC': 6,
        'REPORT_RECEIVED': 7,
        'IN_PROGRESS_QC': 8,
        'APPROVE_BY_QC': 8,
        'RESOLVED': 9,
        'REJECTED_WH': 10
    };

    /* ======================= STATE ============================== */

    const [complaints, setComplaints] = useState([]);
    const [allComplaints, setAllComplaints] = useState([]);

    // Initialize state from sessionStorage if available
    const [activeComplaintType, setActiveComplaintType] = useState(sessionStorage.getItem("qc_complaintType") || "");
    const [complaintCode, setComplaintCode] = useState(sessionStorage.getItem("qc_complaintCode") || "");
    const [status, setStatus] = useState(sessionStorage.getItem("qc_status") || "");
    const [fromDate, setFromDate] = useState(sessionStorage.getItem("qc_fromDate") || "");
    const [toDate, setToDate] = useState(sessionStorage.getItem("qc_toDate") || "");
    const [dateFilter, setDateFilter] = useState(sessionStorage.getItem("qc_dateFilter") || "ALL");

    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredIds, setFilteredIds] = useState([]);
    const [activeDownloadMenu, setActiveDownloadMenu] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /* =================== PERSISTENCE ============================ */

    useEffect(() => {
        sessionStorage.setItem("qc_complaintType", activeComplaintType);
        sessionStorage.setItem("qc_complaintCode", complaintCode);
        sessionStorage.setItem("qc_status", status);
        sessionStorage.setItem("qc_fromDate", fromDate);
        sessionStorage.setItem("qc_toDate", toDate);
        sessionStorage.setItem("qc_dateFilter", dateFilter);
    }, [activeComplaintType, complaintCode, status, fromDate, toDate, dateFilter]);

    /* =================== LOAD DASHBOARD ========================= */

    const loadDashboard = async (complaintType = activeComplaintType, fDate = fromDate, tDate = toDate, cStatus = status, cCode = complaintCode) => {
        // If specific type passed (e.g. clicking card), update state
        if (complaintType !== activeComplaintType) {
            setActiveComplaintType(complaintType);
        }

        try {
            const res = await api.get("/grievance/qc/dashboard", {
                params: {
                    complaintCode: cCode,
                    status: cStatus,
                    fromDate: fDate,
                    toDate: tDate,
                    complaintType,
                    _t: Date.now()
                }
            });

            const sorted = (res.data.complaints || []).sort((a, b) => {
                const pA = statusPriority[a.status] || 99;
                const pB = statusPriority[b.status] || 99;
                return pA - pB;
            });
            setComplaints(sorted);
        } catch (err) {
            console.error("QC DASHBOARD ERROR:", err);
            alert("Failed to load QC dashboard");
        }
    };

    /* =================== INITIAL LOAD =========================== */

    useEffect(() => {
        // Load with current state (restored from session)
        loadDashboard();

        // Fetch all complaints for counts
        api.get("/grievance/qc/dashboard", { params: { _t: Date.now() } })
            .then(res => setAllComplaints(res.data.complaints || []))
            .catch(err => console.error("Failed to load all complaints for counts", err));
    }, []);

    /* =================== CLEAR FILTERS ========================== */

    const clearFilters = () => {
        // Clear session storage
        sessionStorage.removeItem("qc_complaintType");
        sessionStorage.removeItem("qc_complaintCode");
        sessionStorage.removeItem("qc_status");
        sessionStorage.removeItem("qc_fromDate");
        sessionStorage.removeItem("qc_toDate");
        sessionStorage.removeItem("qc_dateFilter");

        // Reset state
        setActiveComplaintType("");
        setComplaintCode("");
        setStatus("");
        setFromDate("");
        setToDate("");
        setDateFilter("ALL");
        setShowDropdown(false);
        setFilteredIds([]);
        loadDashboard("", "", "", "", "");
    };

    /* =================== DATE HELPERS =========================== */

    const handleDateFilterChange = (value) => {
        setDateFilter(value);

        if (value === "ALL" || value === "CUSTOM") {
            if (value === "ALL") {
                setFromDate("");
                setToDate("");
                loadDashboard(activeComplaintType, "", "", status, complaintCode);
            }
            return;
        }

        const today = new Date();
        let start = new Date();

        today.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);

        switch (value) {
            case "TODAY":
                break;
            case "YESTERDAY":
                start.setDate(today.getDate() - 1);
                today.setDate(today.getDate() - 1);
                break;
            case "LAST_7_DAYS":
                start.setDate(today.getDate() - 7);
                break;
            case "LAST_30_DAYS":
                start.setDate(today.getDate() - 30);
                break;
            case "THIS_MONTH":
                start.setDate(1);
                break;
            case "LAST_MONTH": {
                const lastMonth = new Date();
                lastMonth.setMonth(today.getMonth() - 1);
                start.setDate(1);
                start.setMonth(lastMonth.getMonth());
                today.setDate(0);
                break;
            }
            default:
                break;
        }

        const format = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const formattedStart = format(start);
        const formattedEnd = format(today);

        setFromDate(formattedStart);
        setToDate(formattedEnd);

        loadDashboard(activeComplaintType, formattedStart, formattedEnd, status, complaintCode);
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

    const getStatusColor = (st) => {
        switch (st) {
            case 'SAMPLE_DISPATCHED_WH': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'SAMPLE_RECEIVED_QC': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'REPORT_RECEIVED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'IN_PROGRESS_QC': return 'bg-pink-100 text-pink-700 border-pink-200';
            case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    /* ================= DOWNLOAD HANDLER ========================= */

    const handleDownload = (format) => {
        setActiveDownloadMenu(null);
        const filename = `qc_dashboard_${new Date().toISOString().split('T')[0]}`;
        const headers = [["S No.", "Complaint ID", "Type", "Facility", "Item", "Status", "Date"]];

        const formatDateCSV = (date) => {
            if (!date) return "-";
            const d = new Date(date);
            if (isNaN(d.getTime())) return "-";
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${day}-${month}-${year} ${hours}:${minutes}`;
        };

        const data = complaints.map((c, i) => [
            i + 1,
            c.complaint_code,
            c.complaint_type,
            c.facility_name,
            c.item_name,
            c.status,
            formatDateCSV(c.created_at)
        ]);

        if (format === 'CSV') {
            // Create HTML table with bold headers that Excel can open
            let htmlContent = '<html><head><meta charset="utf-8"><style>table { border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #f2f2f2; font-weight: bold; }</style></head><body><table>';

            // Add header row
            htmlContent += '<thead><tr>';
            headers[0].forEach(header => {
                htmlContent += `<th>${header}</th>`;
            });
            htmlContent += '</tr></thead><tbody>';

            // Add data rows
            data.forEach(row => {
                htmlContent += '<tr>';
                row.forEach(cell => {
                    htmlContent += `<td>${cell}</td>`;
                });
                htmlContent += '</tr>';
            });

            htmlContent += '</tbody></table></body></html>';

            // Create blob and download as .xls (HTML format that Excel opens)
            const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.xls`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            const doc = new jsPDF();
            doc.text("QC Dashboard Report", 14, 20);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

            autoTable(doc, {
                startY: 35,
                head: headers,
                body: data,
                theme: 'striped',
                styles: { fontSize: 8 }, // Smaller font to fit content
                headStyles: { fillColor: [79, 70, 229], halign: 'center' },
                columnStyles: {
                    0: { cellWidth: 12, halign: 'center' }, // S No.
                    1: { cellWidth: 35 }, // Complaint ID
                    2: { cellWidth: 20 }, // Type
                    3: { cellWidth: 30 }, // Facility
                    4: { cellWidth: 25 }, // Item
                    5: { cellWidth: 30 }, // Status
                    6: { cellWidth: 30 }  // Date
                },
                margin: { left: 10, right: 10 }
            });
            doc.save(`${filename}.pdf`);
        }
    };

    const formatDateDDMMYYYY = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    /* =========================== UI ============================= */

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-inter">
            <GovHeader />

            <div className="flex flex-1 overflow-hidden">

                {/* ================= SIDEBAR ================= */}
                <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-lg z-20">

                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
                                <FaFlask size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">QC Panel</h2>
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1">Quality Control</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

                        {/* Total Complaints */}
                        <div className="px-2 mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overview</p>
                        </div>
                        <button
                            onClick={clearFilters}
                            className={`w-full p-4 rounded-xl text-left border transition-all duration-200 group relative overflow-hidden ${!activeComplaintType && !status ? 'bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-100' : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600'}`}
                        >
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${!activeComplaintType && !status ? 'text-indigo-100' : 'text-slate-400'}`}>All Complaints</span>
                                <FaChartBar size={14} className={!activeComplaintType && !status ? 'text-white' : 'text-indigo-600'} />
                            </div>
                            <div className={`text-3xl font-black relative z-10 ${!activeComplaintType && !status ? 'text-white' : 'text-slate-800'}`}>
                                {allComplaints.length}
                            </div>
                            {!activeComplaintType && !status && (
                                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                                    <FaFlask size={80} />
                                </div>
                            )}
                        </button>

                        {/* Type Filters */}
                        <div className="px-2 mt-6 mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type Filters</p>
                        </div>
                        {[
                            { label: "Physical", type: "PHYSICAL", icon: <FaBox />, color: "amber" },
                            { label: "ADR", type: "ADR", icon: <FaHeartbeat />, color: "indigo" },
                            { label: "Poor Quality", type: "QUALITY", icon: <FaExclamationTriangle />, color: "blue" }
                        ].map((item) => {
                            const isActive = activeComplaintType === item.type;
                            return (
                                <button
                                    key={item.type}
                                    onClick={() => loadDashboard(item.type)}
                                    className={`w-full p-3 rounded-xl text-left border transition-all duration-200 flex items-center justify-between group ${isActive
                                        ? 'bg-slate-800 border-slate-800 text-white shadow-md'
                                        : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : `bg-${item.color}-50 text-${item.color}-600 group-hover:bg-white`}`}>
                                            {item.icon}
                                        </div>
                                        <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>{item.label}</span>
                                    </div>
                                    <span className={`text-xs font-black ${isActive ? 'bg-white text-slate-800' : 'bg-slate-100 text-slate-600'} px-2 py-1 rounded-md`}>
                                        {allComplaints.filter(c => c.complaint_type === item.type).length}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                        <button
                            onClick={clearFilters}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-600 px-4 py-3 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
                        >
                            <FaBroom /> Clear All Filters
                        </button>
                    </div>
                </div>

                {/* ================= MAIN CONTENT ================= */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">

                    {/* Header bar */}
                    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-10 transition-all">
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">Quality Assessment</h1>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                {status ? `Filtered by: ${status.replace(/_/g, ' ')}` : activeComplaintType ? `Filtered by: ${activeComplaintType}` : 'Management Dashboard'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">

                            {/* Complaint Search */}
                            <div className="relative group" ref={dropdownRef}>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-slate-400 text-xs group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    value={complaintCode}
                                    onChange={(e) => handleComplaintSearchChange(e.target.value)}
                                    onFocus={() => {
                                        setShowDropdown(true);
                                        setFilteredIds(complaints);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setShowDropdown(false);
                                            loadDashboard(activeComplaintType, fromDate, toDate, status, complaintCode);
                                        }
                                    }}
                                    className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all"
                                    placeholder="Search Complaint ID (Press Enter)"
                                />
                                {showDropdown && filteredIds.length > 0 && (
                                    <div className="absolute bg-white border border-slate-100 w-full mt-2 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                        {filteredIds.map((c) => (
                                            <div
                                                key={c.complaint_code}
                                                onClick={() => {
                                                    setComplaintCode(c.complaint_code);
                                                    setShowDropdown(false);
                                                    loadDashboard(activeComplaintType, fromDate, toDate, status, c.complaint_code);
                                                }}
                                                className="px-4 py-3 cursor-pointer hover:bg-indigo-50 text-xs font-bold text-slate-700 border-b border-slate-50 last:border-0"
                                            >
                                                {c.complaint_code}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>


                            {/* Status Select */}
                            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        loadDashboard(activeComplaintType, fromDate, toDate, e.target.value, complaintCode);
                                    }}
                                    className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 px-2 outline-none cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="SAMPLE_DISPATCHED_WH">Sample Dispatched</option>
                                    <option value="SAMPLE_RECEIVED_QC">Sample Received</option>
                                    <option value="REPORT_RECEIVED">Report Received</option>
                                    <option value="IN_PROGRESS_QC">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                                <select
                                    value={dateFilter}
                                    onChange={(e) => handleDateFilterChange(e.target.value)}
                                    className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 px-2 outline-none cursor-pointer"
                                >
                                    <option value="ALL">All Time</option>
                                    <option value="TODAY">Today</option>
                                    <option value="YESTERDAY">Yesterday</option>
                                    <option value="LAST_7_DAYS">Last 7 Days</option>
                                    <option value="LAST_30_DAYS">Last 30 Days</option>
                                    <option value="THIS_MONTH">This Month</option>
                                    <option value="LAST_MONTH">Last Month</option>
                                </select>
                            </div>

                            {/* CLEAR FILTER BUTTON */}
                            {(activeComplaintType || status || complaintCode || fromDate || toDate || dateFilter !== "ALL") && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-xs font-black hover:bg-red-100 transition-all active:scale-95 shadow-sm"
                                >
                                    <FaBroom /> Clear Filters
                                </button>
                            )}

                            {/* DOWNLOAD BUTTON */}
                            <div className="relative">
                                <button
                                    onClick={() => setActiveDownloadMenu(activeDownloadMenu === 'MAIN' ? null : 'MAIN')}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <FaDownload /> Download
                                </button>
                                {activeDownloadMenu === 'MAIN' && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                            onClick={() => handleDownload('CSV')}
                                            className="w-full text-left px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50 flex items-center gap-2"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Download CSV
                                        </button>
                                        <button
                                            onClick={() => handleDownload('PDF')}
                                            className="w-full text-left px-4 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Download PDF
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-auto p-8 custom-scrollbar space-y-8">

                        {/* Lifecycle Analysis Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <FaChartBar className="text-indigo-600" /> Lifecycle Status Analysis
                                </h3>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Real-time Tracking
                                </div>
                            </div>

                            <div className="h-48 flex items-end justify-between gap-6 px-4">
                                {[
                                    { statusKey: "SAMPLE_DISPATCHED_WH", gradient: "from-amber-400 to-amber-600", label: "Dispatch Warehouse", hoverColor: "text-amber-600" },
                                    { statusKey: "SAMPLE_RECEIVED_QC", gradient: "from-indigo-500 to-indigo-700", label: "Sample Received", hoverColor: "text-indigo-700" },
                                    { statusKey: "REPORT_RECEIVED", gradient: "from-blue-500 to-blue-700", label: "Report Received", hoverColor: "text-blue-700" },
                                    { statusKey: "RESOLVED", gradient: "from-green-500 to-green-700", label: "Complaint Closed", hoverColor: "text-green-700" }
                                ].map(bar => {
                                    const count = allComplaints.filter(c => c.status === bar.statusKey).length;
                                    const maxCount = Math.max(...[
                                        "SAMPLE_DISPATCHED_WH", "SAMPLE_RECEIVED_QC", "REPORT_RECEIVED", "RESOLVED"
                                    ].map(k => allComplaints.filter(c => c.status === k).length), 1);

                                    const height = count === 0 ? 2 : Math.max((count / maxCount) * 100, 10);
                                    const isActive = status === bar.statusKey;

                                    return (
                                        <div
                                            key={bar.statusKey}
                                            className="flex flex-col items-center group flex-1 cursor-pointer h-full justify-end"
                                            onClick={() => {
                                                setStatus(bar.statusKey);
                                                loadDashboard(activeComplaintType, fromDate, toDate, bar.statusKey, complaintCode);
                                            }}
                                        >
                                            <div className={`mb-2 text-xs font-black transition-colors ${isActive ? bar.hoverColor : 'text-slate-400 group-hover:' + bar.hoverColor}`}>{count}</div>
                                            <div className="w-full h-full flex items-end relative">
                                                <div
                                                    className={`w-full rounded-t-xl bg-gradient-to-t ${bar.gradient} shadow-md transition-all duration-300 relative overflow-hidden ${isActive ? 'ring-4 ring-indigo-50 scale-x-105 z-10' : 'opacity-70 group-hover:opacity-100'}`}
                                                    style={{ height: `${height}%` }}
                                                >
                                                    {isActive && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                                                </div>
                                            </div>
                                            <div className={`mt-4 text-[10px] text-center font-black uppercase tracking-tighter leading-3 transition-colors ${isActive ? 'text-indigo-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                                {bar.label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        {[
                                            "S No", "Complaint ID", "Type", "Facility", "Item", "Status", "Start Date", "End Date", "Action"
                                        ].map((h, idx) => (
                                            <th key={idx} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {complaints.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="p-12 text-center text-slate-400 font-medium italic">No records found matching your criteria.</td>
                                        </tr>
                                    ) : (
                                        complaints.map((c, i) => (
                                            <tr key={c.complaint_code} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4 text-xs font-bold text-slate-400">{i + 1}</td>
                                                <td className="px-6 py-4 font-black text-indigo-600 text-xs">{c.complaint_code}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-tighter">{c.complaint_type}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-700">{c.facility_name}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-600 truncate max-w-[120px]" title={c.item_name}>{c.item_name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusColor(c.status)}`}>
                                                        {c.status?.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 font-bold text-[10px] whitespace-nowrap">
                                                    {formatDateDDMMYYYY(c.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 font-bold text-[10px] whitespace-nowrap">
                                                    {formatDateDDMMYYYY(c.resolved_at)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => navigate(`/qc/assessment/view/${c.complaint_code}`)}
                                                            className="text-indigo-600 hover:text-indigo-800 font-black text-[10px] uppercase border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

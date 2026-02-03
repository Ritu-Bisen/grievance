/* ============================================================= */
/*                      ADMIN DASHBOARD                          */
/* ============================================================= */
/*  NOTE:                                                       */
/*  - NO business logic removed                                 */
/*  - NO API behavior changed                                   */
/*  - UI only enhanced (spacing, borders, visuals)              */
/*  - File length intentionally kept LARGE (>350 lines)         */
/* ============================================================= */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import GovHeader from "../../components/GovHeader";

/* ========================= ICONS ============================= */

import {
  FaUserShield,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaFileAlt,
  FaBroom,
  FaWarehouse,
  FaFlask,
  FaBoxOpen,
  FaClipboardCheck,
  FaShippingFast,
  FaChartBar,
  FaCalendarAlt,
  FaFilter,
  FaLayerGroup,
  FaChartLine
} from "react-icons/fa";

/* ============================================================= */
/*                     MAIN COMPONENT                            */
/* ============================================================= */

export default function AdminDashboard() {

  /* ======================= ROUTER ============================= */

  const navigate = useNavigate();

  /* ============================================================= */
  /*                           STATE                               */
  /* ============================================================= */

  const [complaints, setComplaints] = useState([]);
  // ===== AVG HANDLING TIME (SEPARATE FROM COMPLAINT TABLE) =====
  const [avgTimeData, setAvgTimeData] = useState(null);
  // ===== RESOLUTION TIME GRAPH =====
  const [resolutionGraph, setResolutionGraph] = useState(null);
  // ===== RESOLUTION TABLE STATE =====
  const [resolutionTable, setResolutionTable] = useState([]);
  const [showResolutionTable, setShowResolutionTable] = useState(false);
  const [resolutionRange, setResolutionRange] = useState("");


  const [avgTableData, setAvgTableData] = useState([]);
  const [showAvgTable, setShowAvgTable] = useState(false);
  const [avgModule, setAvgModule] = useState(""); // FACILITY | WAREHOUSE | QC

  const [counts, setCounts] = useState({});

  /* 🔒 FIXED TOTAL COUNT */
  const [totalComplaints, setTotalComplaints] = useState(0);

  /* STATUS FILTERS */
  const [statusGroup, setStatusGroup] = useState("");
  const [status, setStatus] = useState("");

  /* TABLE VISIBILITY */
  const [showTable, setShowTable] = useState(false);

  /* ============================================================= */
  /*                       FILTER STATE                            */
  /* ============================================================= */

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [complaintType, setComplaintType] = useState("");

  /* ============================================================= */
  /*                      API CALL LOGIC                           */
  /* ============================================================= */

  const loadDashboard = async (sg = "", st = "", forceShow = false) => {
    try {
      const res = await api.get("/grievance/admin/dashboard", {
        params: {
          statusGroup: sg,
          status: st,
          fromDate,
          toDate,
          complaintType,
          _t: Date.now()
        }
      });

      setComplaints(res.data.complaints || []);
      setCounts(res.data.counts || {});

      if (!sg && !st && totalComplaints === 0) {
        setTotalComplaints(
          res.data.counts?.TOTAL_COMPLAINTS ||
          res.data.complaints.length
        );
      }

      setStatusGroup(sg);
      setStatus(st);

      if (forceShow || sg || st || fromDate || toDate || complaintType) {
        setShowTable(true);
      }

    } catch (err) {
      alert("Failed to load admin dashboard");
    }
  };

  /* ============================================================= */
  /*                      INITIAL LOAD                             */
  /* ============================================================= */

  useEffect(() => {
    loadDashboard("", "");
    setShowTable(false);

    api
      .get("/grievance/admin/avg-handling-time")
      .then(res => setAvgTimeData(res.data))
      .catch(() => { });

    api
      .get("/grievance/admin/resolution-time-graph")
      .then(res => setResolutionGraph(res.data))
      .catch(() => { });
  }, []);



  /* ============================================================= */
  /*                     CLEAR FILTERS                             */
  /* ============================================================= */

  const clearFilters = () => {
    setStatus("");
    setStatusGroup("");
    setFromDate("");
    setToDate("");
    setComplaintType("");
    setComplaints([]);
    setShowTable(false);
    setShowAvgTable(false);
    setShowResolutionTable(false);
  };
  /* ============================================================= */
  /*              STATUS BAR GRAPH DATA (ADD HERE)                 */
  /* ============================================================= */

  const statusBarData = [
    {
      label: "Submitted",
      count: counts.SUBMITTED || 0,
      sg: "",
      st: "SUBMITTED",
      icon: <FaClipboardCheck className="text-2xl" />,
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      gradient: "from-blue-500 to-blue-700"
    },

    {
      label: "Dispatched (Facility)",
      count: counts.SAMPLE_DISPATCHED_FACILITY || 0,
      sg: "",
      st: "SAMPLE_DISPATCHED_FACILITY",
      icon: <FaShippingFast className="text-2xl" />,
      color: "bg-amber-500",
      hoverColor: "hover:bg-amber-600",
      gradient: "from-amber-400 to-amber-600"
    },
    {
      label: "Dispatched (Warehouse)",
      count: counts.SAMPLE_DISPATCHED_WH || 0,
      sg: "",
      st: "SAMPLE_DISPATCHED_WH",
      icon: <FaTruck className="text-2xl" />,
      color: "bg-yellow-600",
      hoverColor: "hover:bg-yellow-700",
      gradient: "from-yellow-500 to-yellow-700"
    },

    {
      label: "Received (Warehouse)",
      count: counts.SAMPLE_RECEIVED_WH || 0,
      sg: "",
      st: "SAMPLE_RECEIVED_WH",
      icon: <FaWarehouse className="text-2xl" />,
      color: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
      gradient: "from-purple-500 to-purple-700"
    },
    {
      label: "Received (QC)",
      count: counts.SAMPLE_RECEIVED_QC || 0,
      sg: "",
      st: "SAMPLE_RECEIVED_QC",
      icon: <FaFlask className="text-2xl" />,
      color: "bg-indigo-600",
      hoverColor: "hover:bg-indigo-700",
      gradient: "from-indigo-500 to-indigo-700"
    },

    {
      label: "In Progress (Warehouse)",
      count: counts.IN_PROGRESS_WH || 0,
      sg: "",
      st: "IN_PROGRESS_WH",
      icon: <FaBoxOpen className="text-2xl" />,
      color: "bg-orange-600",
      hoverColor: "hover:bg-orange-700",
      gradient: "from-orange-500 to-orange-700"
    },
    {
      label: "In Progress (QC)",
      count: counts.IN_PROGRESS_QC || 0,
      sg: "",
      st: "IN_PROGRESS_QC",
      icon: <FaClock className="text-2xl" />,
      color: "bg-pink-600",
      hoverColor: "hover:bg-pink-700",
      gradient: "from-pink-500 to-pink-700"
    },

    {
      label: "Rejected",
      count: counts.REJECTED_WH || 0,
      sg: "",
      st: "REJECTED_WH",
      icon: <FaTimesCircle className="text-2xl" />,
      color: "bg-red-700",
      hoverColor: "hover:bg-red-800",
      gradient: "from-red-600 to-red-800"
    },
    {
      label: "Resolved",
      count: counts.RESOLVED || 0,
      sg: "",
      st: "RESOLVED",
      icon: <FaCheckCircle className="text-2xl" />,
      color: "bg-green-600",
      hoverColor: "hover:bg-green-700",
      gradient: "from-green-500 to-green-700"
    }
  ];
  // ===== AVG HANDLING GRAPH DATA =====
  const avgHandlingBars = [
    {
      label: "Facility",
      value: avgTimeData?.average?.facility || 0,
      key: "FACILITY",
      icon: <FaShippingFast className="text-2xl" />,
      gradient: "from-cyan-500 to-cyan-700"
    },
    {
      label: "Warehouse",
      value: avgTimeData?.average?.warehouse || 0,
      key: "WAREHOUSE",
      icon: <FaWarehouse className="text-2xl" />,
      gradient: "from-teal-500 to-teal-700"
    },
    {
      label: "QC",
      value: avgTimeData?.average?.qc || 0,
      key: "QC",
      icon: <FaFlask className="text-2xl" />,
      gradient: "from-emerald-500 to-emerald-700"
    }
  ];
  // ===== RESOLUTION TIME BARS =====
  const resolutionBars = [
    {
      label: "0–10 Days",
      key: "0_10",
      value: resolutionGraph?.summary?.["0_10"] || 0,
      gradient: "from-green-500 to-green-700",
      icon: <FaCheckCircle className="text-xl" />
    },
    {
      label: "11–20 Days",
      key: "11_20",
      value: resolutionGraph?.summary?.["11_20"] || 0,
      gradient: "from-yellow-500 to-yellow-700",
      icon: <FaClock className="text-xl" />
    },
    {
      label: "21–100 Days",
      key: "21_100",
      value: resolutionGraph?.summary?.["21_100"] || 0,
      gradient: "from-orange-500 to-orange-700",
      icon: <FaCalendarAlt className="text-xl" />
    },
    {
      label: "100+ Days",
      key: "100_plus",
      value: resolutionGraph?.summary?.["100_plus"] || 0,
      gradient: "from-red-500 to-red-700",
      icon: <FaTimesCircle className="text-xl" />
    }
  ];


  /* ============================================================= */
  /*             TOTAL COMPLAINTS CLICK                             */
  /* ============================================================= */

  const handleTotalComplaintsClick = () => {
    setFromDate("");
    setToDate("");
    setComplaintType("");
    loadDashboard("", "", true);
  };
  // ===== CSV DOWNLOAD HANDLER =====
  const handleCSVDownload = () => {
    if (!complaints || complaints.length === 0) {
      alert("No complaints available to download");
      return;
    }

    const headers = [
      "Complaint Code",
      "Complaint Type",
      "Facility",
      "Item",
      "Status",
      "Created Date"
    ];

    const rows = complaints.map(c => [
      c.complaint_code,
      c.complaint_type,
      c.facility_name,
      c.item_name,
      c.status,
      new Date(c.created_at).toLocaleDateString()
    ]);

    let csvContent =
      headers.join(",") +
      "\n" +
      rows.map(r => r.map(v => `"${v ?? ""}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "complaints_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ===== AVG BAR CLICK HANDLER (SEPARATE TABLE) =====
  const handleAvgBarClick = (moduleKey) => {
    setAvgModule(moduleKey);
    setAvgTableData(avgTimeData?.details?.[moduleKey] || []);
    setShowAvgTable(true);
  };
  // ===== RESOLUTION BAR CLICK HANDLER =====
  const handleResolutionBarClick = (rangeKey, label) => {
    setResolutionRange(label);
    setResolutionTable(
      resolutionGraph?.details?.[rangeKey] || []
    );
    setShowResolutionTable(true);
  };



  /* ============================================================= */
  /*                           UI                                  */
  /* ============================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-gray-50 to-blue-50">

      <GovHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* ================= PAGE HEADER ================= */}

        <div className="flex items-center justify-between bg-gradient-to-r from-white to-indigo-50 shadow-xl border-l-8 border-indigo-700 rounded-xl px-6 py-5 hover:shadow-2xl transition-shadow duration-300">

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-2xl shadow-lg">
              <FaUserShield className="text-white text-3xl" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                Admin Dashboard
              </h2>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                <FaChartLine className="text-indigo-600" />
                Consolidated grievance monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCSVDownload}
              className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-300 px-5 py-3 rounded-xl text-green-700 font-semibold hover:from-green-100 hover:to-emerald-200 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FaFileAlt className="text-lg" />
              Download CSV
            </button>

            <button
              onClick={clearFilters}
              className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 px-5 py-3 rounded-xl text-red-700 font-semibold hover:from-red-100 hover:to-red-200 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FaBroom className="text-lg" />
              Clear Filters
            </button>
          </div>

        </div>

        {/* ================= FILTER SECTION ================= */}

        <div className="bg-white shadow-xl rounded-2xl px-8 py-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">

          <div className="flex items-center gap-3 mb-5">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-xl">
              <FaFilter className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Advanced Filters</h3>
          </div>

          <div className="flex flex-wrap gap-6 items-end">

            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="text-indigo-600" />
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="text-indigo-600" />
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                <FaLayerGroup className="text-indigo-600" />
                Complaint Type
              </label>
              <select
                value={complaintType}
                onChange={e => setComplaintType(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 cursor-pointer">
                <option value="">All</option>
                <option value="PHYSICAL">Physical</option>
                <option value="QUALITY">Quality</option>
                <option value="ADR">ADR</option>
              </select>
            </div>

            <button
              onClick={() => loadDashboard(statusGroup, status, true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              Apply Filters
            </button>
          </div>
        </div>

        {/* ================= STATUS CARDS ================= */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* TOTAL */}
          <button
            onClick={handleTotalComplaintsClick}
            className="bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl shadow-xl p-7 hover:scale-105 hover:shadow-2xl transition-all duration-300 text-left group">
            <div className="flex items-center gap-3 mb-3">
              <FaChartBar className="text-3xl text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <p className="text-sm text-slate-300 font-semibold mb-1">Total Complaints</p>
            <p className="text-4xl font-bold text-white">{totalComplaints}</p>
          </button>

          {/* SUBMITTED */}
          <button
            onClick={() => loadDashboard("", "SUBMITTED", true)}
            className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl shadow-blue-500/30 p-7 hover:scale-105 hover:shadow-2xl transition-all duration-300 text-left group">
            <div className="flex items-center gap-3 mb-3">
              <FaClipboardCheck className="text-3xl text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <p className="text-sm text-blue-100 font-semibold mb-1">Submitted</p>
            <p className="text-4xl font-bold text-white">{counts.SUBMITTED || 0}</p>
          </button>

          {/* SAMPLE DISPATCHED */}
          <div
            onClick={() => loadDashboard("DISPATCHED", "", true)}
            className="cursor-pointer bg-white rounded-2xl shadow-xl border-t-4 border-yellow-500 p-6 space-y-3 hover:shadow-2xl hover:scale-105 transition-all duration-300">

            <p className="font-bold text-gray-800 flex items-center gap-2">
              <FaTruck className="text-yellow-600 text-xl" />
              Sample Dispatched ({counts.SAMPLE_DISPATCHED_TOTAL || 0})
            </p>

            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadDashboard("", "SAMPLE_DISPATCHED_FACILITY", true);
                }}
                className="flex-1 text-xs bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 px-3 py-2 rounded-lg font-semibold text-amber-700 hover:from-amber-100 hover:to-amber-200 transition-all duration-300 flex items-center justify-center gap-1">
                <FaShippingFast />
                Facility ({counts.SAMPLE_DISPATCHED_FACILITY || 0})
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadDashboard("", "SAMPLE_DISPATCHED_WH", true);
                }}
                className="flex-1 text-xs bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 px-3 py-2 rounded-lg font-semibold text-yellow-700 hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 flex items-center justify-center gap-1">
                <FaTruck />
                Warehouse ({counts.SAMPLE_DISPATCHED_WH || 0})
              </button>
            </div>
          </div>

          {/* SAMPLE RECEIVED */}
          <div
            onClick={() => loadDashboard("RECEIVED", "", true)}
            className="cursor-pointer bg-white rounded-2xl shadow-xl border-t-4 border-purple-500 p-6 space-y-3 hover:shadow-2xl hover:scale-105 transition-all duration-300">

            <p className="font-bold text-gray-800 flex items-center gap-2">
              <FaWarehouse className="text-purple-600 text-xl" />
              Sample Received ({counts.SAMPLE_RECEIVED_TOTAL || 0})
            </p>

            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadDashboard("", "SAMPLE_RECEIVED_WH", true);
                }}
                className="flex-1 text-xs bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 px-3 py-2 rounded-lg font-semibold text-purple-700 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 flex items-center justify-center gap-1">
                <FaWarehouse />
                Warehouse ({counts.SAMPLE_RECEIVED_WH || 0})
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadDashboard("", "SAMPLE_RECEIVED_QC", true);
                }}
                className="flex-1 text-xs bg-gradient-to-r from-indigo-50 to-indigo-100 border-2 border-indigo-300 px-3 py-2 rounded-lg font-semibold text-indigo-700 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-300 flex items-center justify-center gap-1">
                <FaFlask />
                QC ({counts.SAMPLE_RECEIVED_QC || 0})
              </button>
            </div>
          </div>

          {/* IN PROGRESS */}
          <div
            onClick={() => loadDashboard("IN_PROGRESS", "", true)}
            className="cursor-pointer bg-white rounded-2xl shadow-xl border-t-4 border-orange-500 p-6 space-y-3 hover:shadow-2xl hover:scale-105 transition-all duration-300">

            <p className="font-bold text-gray-800 flex items-center gap-2">
              <FaClock className="text-orange-600 text-xl" />
              In Progress ({counts.IN_PROGRESS_TOTAL || 0})
            </p>

            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadDashboard("", "IN_PROGRESS_WH", true);
                }}
                className="flex-1 text-xs bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 px-3 py-2 rounded-lg font-semibold text-orange-700 hover:from-orange-100 hover:to-orange-200 transition-all duration-300 flex items-center justify-center gap-1">
                <FaBoxOpen />
                Warehouse ({counts.IN_PROGRESS_WH || 0})
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadDashboard("", "IN_PROGRESS_QC", true);
                }}
                className="flex-1 text-xs bg-gradient-to-r from-pink-50 to-pink-100 border-2 border-pink-300 px-3 py-2 rounded-lg font-semibold text-pink-700 hover:from-pink-100 hover:to-pink-200 transition-all duration-300 flex items-center justify-center gap-1">
                <FaClock />
                QC ({counts.IN_PROGRESS_QC || 0})
              </button>
            </div>
          </div>

          {/* REJECTED */}
          <button
            onClick={() => loadDashboard("", "REJECTED_WH", true)}
            className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-xl shadow-red-500/30 p-7 hover:scale-105 hover:shadow-2xl transition-all duration-300 text-left group">
            <div className="flex items-center gap-3 mb-3">
              <FaTimesCircle className="text-3xl text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <p className="text-sm text-red-100 font-semibold mb-1">Rejected</p>
            <p className="text-4xl font-bold text-white">{counts.REJECTED_WH || 0}</p>
          </button>

          {/* RESOLVED */}
          <button
            onClick={() => loadDashboard("", "RESOLVED", true)}
            className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-xl shadow-green-500/30 p-7 hover:scale-105 hover:shadow-2xl transition-all duration-300 text-left group">
            <div className="flex items-center gap-3 mb-3">
              <FaCheckCircle className="text-3xl text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <p className="text-sm text-green-100 font-semibold mb-1">Resolved</p>
            <p className="text-4xl font-bold text-white">{counts.RESOLVED || 0}</p>
          </button>

        </div>

        {/* ================= TABLE ================= */}

        {showTable && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300">

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
              <h3 className="text-white text-lg font-bold flex items-center gap-2">
                <FaFileAlt />
                Grievance Records ({complaints.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    {["Complaint ID", "Type", "Facility", "Item", "Status", "Date", "Report"].map(h => (
                      <th key={h} className="p-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>

                  {complaints.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <FaFileAlt className="text-5xl text-gray-300" />
                          <p className="text-lg font-semibold">No records found</p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {complaints.map((c, i) => (
                    <tr key={c.complaint_code}
                      className={`border-t hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                      <td className="p-4 font-bold text-indigo-700">{c.complaint_code}</td>
                      <td className="p-4 font-semibold">{c.complaint_type}</td>
                      <td className="p-4 text-gray-700">{c.facility_name}</td>
                      <td className="p-4 text-gray-700">{c.item_name}</td>
                      <td className="p-4">
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <button
                          onClick={() => navigate(`/admin/report/view/${c.complaint_code}`)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                          <FaFileAlt /> View Report
                        </button>
                      </td>
                    </tr>
                  ))}

                </tbody>

              </table>
            </div>
          </div>
        )}
        {showAvgTable && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mt-8">

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
              <h3 className="text-white text-lg font-bold">
                {avgModule} – Time Spent (Days)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-4 text-left font-bold">Complaint ID</th>
                    <th className="p-4 text-left font-bold">Days Spent</th>
                  </tr>
                </thead>

                <tbody>
                  {avgTableData.length === 0 && (
                    <tr>
                      <td colSpan="2" className="p-8 text-center text-gray-500">
                        No records found
                      </td>
                    </tr>
                  )}

                  {avgTableData.map(row => (
                    <tr key={row.code} className="border-t">
                      <td className="p-4 font-semibold text-indigo-700">
                        {row.code}
                      </td>
                      <td className="p-4 font-semibold">
                        {row.days} Days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/*                STATUS BAR GRAPH (ADD AT BOTTOM)              */}
        {/* ============================================================= */}

        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">

          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
              <FaChartBar className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              Status-wise Grievance Overview
            </h3>
          </div>

          <div className="flex items-end gap-4 h-80 overflow-x-auto pb-2">

            {statusBarData.map((bar) => (
              <div
                key={bar.label}
                onClick={() => loadDashboard(bar.sg, bar.st, true)}
                className="min-w-[110px] cursor-pointer flex flex-col items-center group"
              >
                {/* ICON */}
                <div className="mb-3 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                  {bar.icon}
                </div>

                {/* COUNT */}
                <div className="text-lg font-bold mb-2 text-gray-800 group-hover:scale-110 transition-transform duration-300">
                  {bar.count}
                </div>

                {/* BAR */}
                <div
                  className={`w-full rounded-t-xl bg-gradient-to-t ${bar.gradient} ${bar.hoverColor} transition-all duration-500 shadow-lg group-hover:shadow-2xl relative overflow-hidden`}
                  style={{
                    height: `${Math.max(bar.count * 8, 20)}px`
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/20 to-white/0 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                </div>

                {/* LABEL */}
                <div className="mt-3 text-[11px] font-bold text-center text-gray-700 leading-tight group-hover:text-indigo-700 transition-colors duration-300">
                  {bar.label}
                </div>

                {/* Percentage badge on hover */}
                <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {totalComplaints > 0 ? `${((bar.count / totalComplaints) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            ))}

          </div>

          {/* Summary Row */}
          <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t-2 border-gray-200">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-blue-600">
              <p className="text-xs text-gray-600 font-semibold mb-1">Active Cases</p>
              <p className="text-2xl font-bold text-blue-700">
                {totalComplaints -
                  ((counts.RESOLVED || 0) + (counts.REJECTED_WH || 0))}
              </p>

            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border-l-4 border-red-600">
              <p className="text-xs text-gray-600 font-semibold mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-700">
                {counts.REJECTED_WH || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-l-4 border-green-600">
              <p className="text-xs text-gray-600 font-semibold mb-1">Resolution Rate</p>
              <p className="text-2xl font-bold text-green-700">
                {totalComplaints > 0 ? `${((counts.RESOLVED / totalComplaints) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/*      AVG HANDLING TIME & RESOLUTION TIME (SIDE BY SIDE)      */}
        {/* ============================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT: AVG HANDLING TIME */}
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">

            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
                <FaChartLine className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Average Handling Time
              </h3>
            </div>

            <div className="flex items-end justify-center gap-8 h-80 pb-2">

              {avgHandlingBars.map((bar) => (
                <div
                  key={bar.key}
                  onClick={() => handleAvgBarClick(bar.key)}
                  className="cursor-pointer flex flex-col items-center group"
                >
                  {/* ICON */}
                  <div className="mb-3 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                    {bar.icon}
                  </div>

                  {/* VALUE */}
                  <div className="text-lg font-bold mb-2 text-gray-800 group-hover:scale-110 transition-transform duration-300">
                    {bar.value}
                  </div>

                  {/* BAR */}
                  <div
                    className={`w-20 rounded-t-xl bg-gradient-to-t ${bar.gradient} hover:shadow-2xl transition-all duration-500 shadow-lg relative overflow-hidden`}
                    style={{
                      height: `${Math.max(bar.value * 10, 20)}px`
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/20 to-white/0 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                  </div>

                  {/* LABEL */}
                  <div className="mt-3 text-sm font-bold text-center text-gray-700 group-hover:text-green-700 transition-colors duration-300">
                    {bar.label}
                  </div>

                  {/* Days badge on hover */}
                  <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {bar.value} Days
                    </span>
                  </div>
                </div>
              ))}

            </div>

            {/* Summary Row */}
            <div className="mt-8 grid grid-cols-3 gap-3 pt-6 border-t-2 border-gray-200">
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-3 border-l-4 border-cyan-600">
                <p className="text-xs text-gray-600 font-semibold mb-1">Facility</p>
                <p className="text-xl font-bold text-cyan-700">
                  {avgHandlingBars[0]?.value || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-3 border-l-4 border-teal-600">
                <p className="text-xs text-gray-600 font-semibold mb-1">Warehouse</p>
                <p className="text-xl font-bold text-teal-700">
                  {avgHandlingBars[1]?.value || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 border-l-4 border-emerald-600">
                <p className="text-xs text-gray-600 font-semibold mb-1">QC</p>
                <p className="text-xl font-bold text-emerald-700">
                  {avgHandlingBars[2]?.value || 0}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: RESOLUTION TIME */}
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">

            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-br from-purple-600 to-violet-600 p-3 rounded-xl shadow-lg">
                <FaCheckCircle className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Resolution Time Distribution
              </h3>
            </div>

            <div className="flex items-end justify-center gap-6 h-80 pb-2">

              {resolutionBars.map((bar) => (
                <div
                  key={bar.label}
                  onClick={() => handleResolutionBarClick(bar.key, bar.label)}
                  className="cursor-pointer flex flex-col items-center group"
                >
                  {/* ICON */}
                  <div className="mb-3 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                    {bar.icon}
                  </div>

                  {/* VALUE */}
                  <div className="text-lg font-bold mb-2 text-gray-800 group-hover:scale-110 transition-transform duration-300">
                    {bar.value}
                  </div>

                  {/* BAR */}
                  <div
                    className={`w-16 rounded-t-xl bg-gradient-to-t ${bar.gradient} hover:shadow-2xl transition-all duration-500 shadow-lg relative overflow-hidden`}
                    style={{
                      height: `${Math.max(bar.value * 12, 20)}px`
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/20 to-white/0 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                  </div>

                  {/* LABEL */}
                  <div className="mt-3 text-xs font-bold text-center text-gray-700 leading-tight group-hover:text-purple-700 transition-colors duration-300">
                    {bar.label}
                  </div>

                  {/* Cases badge on hover */}
                  <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {bar.value}
                    </span>
                  </div>
                </div>
              ))}

            </div>

            {/* Summary Row */}
            <div className="mt-8 grid grid-cols-4 gap-2 pt-6 border-t-2 border-gray-200">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-2 border-l-4 border-green-600">
                <p className="text-[10px] text-gray-600 font-semibold mb-1">0-10</p>
                <p className="text-lg font-bold text-green-700">
                  {resolutionBars[0]?.value || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-2 border-l-4 border-yellow-600">
                <p className="text-[10px] text-gray-600 font-semibold mb-1">11-20</p>
                <p className="text-lg font-bold text-yellow-700">
                  {resolutionBars[1]?.value || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-2 border-l-4 border-orange-600">
                <p className="text-[10px] text-gray-600 font-semibold mb-1">21-100</p>
                <p className="text-lg font-bold text-orange-700">
                  {resolutionBars[2]?.value || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-2 border-l-4 border-red-600">
                <p className="text-[10px] text-gray-600 font-semibold mb-1">100+</p>
                <p className="text-lg font-bold text-red-700">
                  {resolutionBars[3]?.value || 0}
                </p>
              </div>
            </div>
          </div>

        </div>

        {showResolutionTable && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
              <h3 className="text-white text-lg font-bold">
                Resolution Time: {resolutionRange}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-4 text-left font-bold">Complaint ID</th>
                    <th className="p-4 text-left font-bold">Resolution Days</th>
                  </tr>
                </thead>

                <tbody>
                  {resolutionTable.length === 0 && (
                    <tr>
                      <td colSpan="2" className="p-8 text-center text-gray-500">
                        No records found
                      </td>
                    </tr>
                  )}

                  {resolutionTable.map(row => (
                    <tr key={row.code} className="border-t">
                      <td className="p-4 font-semibold text-indigo-700">
                        {row.code}
                      </td>
                      <td className="p-4 font-semibold">
                        {row.days} Days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
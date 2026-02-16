/* ============================================================= */
/*                      ADMIN DASHBOARD                          */
/* ============================================================= */
/*  NOTE:                                                       */
/*  - NO business logic removed                                 */
/*  - NO API behavior changed                                   */
/*  - UI only enhanced (spacing, borders, visuals)              */
/*  - File length intentionally kept LARGE (>350 lines)         */
/* ============================================================= */

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import api from "../../services/api.js";
import GovHeader from "../../components/GovHeader";

/* ========================= ICONS ============================= */

import {
  FaUserShield,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaDownload,
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
  FaChartLine,
  FaExclamationTriangle,
  FaSearch
} from "react-icons/fa";

/* ============================================================= */
/*                     MAIN COMPONENT                            */
/* ============================================================= */

export default function AdminDashboard() {

  /* ======================= ROUTER ============================= */

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

  const formatDateDDMMYYYY = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /* ============================================================= */
  /*                           STATE                               */
  /* ============================================================= */

  /* VIEW STATE */
  const [activeView, setActiveView] = useState("DASHBOARD"); // DASHBOARD, TABLE, AVG, RESOLUTION

  /* DATA STATE */
  const [complaints, setComplaints] = useState([]);
  const [counts, setCounts] = useState({});
  const [totalComplaints, setTotalComplaints] = useState(0);

  /* GRAPH & TABLE DATA */
  const [avgTimeData, setAvgTimeData] = useState(null);
  const [resolutionGraph, setResolutionGraph] = useState(null);

  /* INTERACTIVE STATE */
  const [avgTableData, setAvgTableData] = useState([]);
  const [avgModule, setAvgModule] = useState("");
  const [resolutionTable, setResolutionTable] = useState([]);
  const [resolutionRange, setResolutionRange] = useState("");

  /* STATUS FILTER STATE */
  const [statusGroup, setStatusGroup] = useState("");
  const [status, setStatus] = useState("");

  /* ============================================================= */
  /*                      FILTER STATE                             */
  /* ============================================================= */

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [complaintType, setComplaintType] = useState("");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [scrollTrigger, setScrollTrigger] = useState(0);

  /* SEARCH STATE */
  const [complaintCode, setComplaintCode] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredIds, setFilteredIds] = useState([]);

  /* ============================================================= */
  /*                      API CALL LOGIC                           */
  /* ============================================================= */

  const loadDashboard = async (sg = "", st = "", forceShow = false, fDate = fromDate, tDate = toDate, explicitType = null, cCode = complaintCode) => {
    const finalType = explicitType !== null ? explicitType : complaintType;
    try {
      const res = await api.get("/grievance/admin/dashboard", {
        params: {
          statusGroup: sg,
          status: st,
          fromDate: fDate,
          toDate: tDate,
          complaintType: finalType,
          complaintCode: cCode,
          _t: Date.now()
        }
      });

      const sorted = (res.data.complaints || []).sort((a, b) => {
        const pA = statusPriority[a.status] || 99;
        const pB = statusPriority[b.status] || 99;
        return pA - pB;
      });
      setComplaints(sorted);
      setCounts(res.data.counts || {});

      if (!sg && !st && !finalType && totalComplaints === 0) {
        setTotalComplaints(
          res.data.counts?.TOTAL_COMPLAINTS ||
          res.data.complaints.length
        );
      }

      setStatusGroup(sg);
      setStatus(st);
      if (explicitType !== null) setComplaintType(explicitType);

      const view = (forceShow || sg || st || fDate || tDate || finalType || cCode) ? "TABLE" : "DASHBOARD";
      setActiveView(view);

      // ✅ PERSIST FILTERS
      sessionStorage.setItem("admin_filters", JSON.stringify({
        sg, st, fromDate: fDate, toDate: tDate, complaintType: finalType, activeView: view, complaintCode: cCode
      }));

    } catch (err) {
      alert("Failed to load admin dashboard");
    }
  };

  /* ============================================================= */
  /*                      INITIAL LOAD                             */
  /* ============================================================= */

  useEffect(() => {
    // ✅ RESTORE FILTERS
    const saved = sessionStorage.getItem("admin_filters");
    if (saved) {
      const { sg, st, fromDate: fD, toDate: tD, complaintType: cT, activeView: aV, complaintCode: cC } = JSON.parse(saved);
      setFromDate(fD || "");
      setToDate(tD || "");
      setComplaintType(cT || "");
      setComplaintCode(cC || "");

      // Load data with saved filters
      loadDashboard(sg, st, aV === "TABLE", fD, tD, cT, cC);
    } else {
      loadDashboard("", "");
      setActiveView("DASHBOARD");
    }

    api
      .get("/grievance/admin/avg-handling-time")
      .then(res => setAvgTimeData(res.data))
      .catch(() => { });

    api
      .get("/grievance/admin/resolution-time-graph")
      .then(res => setResolutionGraph(res.data))
      .catch(() => { });
  }, []);

  // Add table ref for focused scrolling
  const tableRef = useRef(null);
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

  // Auto-scroll when activeView changes to a table view
  useEffect(() => {
    if (activeView === 'TABLE' || activeView === 'AVG_TABLE' || activeView === 'RESOLUTION_TABLE') {
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeView, status, statusGroup, avgModule, resolutionRange, scrollTrigger]);



  /* ============================================================= */
  /*                     COMPLAINT SEARCH                          */
  /* ============================================================= */

  const handleComplaintSearchChange = (value) => {
    setComplaintCode(value);
    setShowDropdown(true);

    if (!value) {
      setFilteredIds([]);
      return;
    }

    const matches = complaints.filter((c) =>
      c.complaint_code?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredIds(matches);
  };

  /* ============================================================= */
  /*                     CLEAR FILTERS                             */
  /* ============================================================= */

  const clearFilters = () => {
    sessionStorage.removeItem("admin_filters");
    setStatus("");
    setStatusGroup("");
    setFromDate("");
    setToDate("");
    setComplaintType("");
    setComplaintCode("");
    setDateFilter("ALL");
    setComplaints([]);
    setActiveView("DASHBOARD");
    loadDashboard("", "", false, "", "", "", "");
  };

  /* ============================================================= */
  /*                     DOWNLOAD HANDLERS                         */
  /* ============================================================= */

  const [activeDownloadMenu, setActiveDownloadMenu] = useState(null); // 'MAIN', 'TABLE', 'AVG', 'RES'

  const handleSpecificDownload = (type, format) => {
    setActiveDownloadMenu(null);
    const doc = new jsPDF();
    let data = [];
    let headers = [];
    let title = "";
    let filename = "";

    if (type === 'TABLE' || type === 'MAIN') {
      data = complaints;
      headers = [["ID", "Start Date", "End Date", "Type", "Status"]];
      title = "Grievance Report";
      filename = `grievance_report_${new Date().toISOString().split('T')[0]}`;
    } else if (type === 'AVG') {
      data = avgTableData;
      headers = [["Complaint ID", "Start Date", "End Date", "Days Taken"]];
      title = `Average Time Analysis: ${avgModule}`;
      filename = `avg_time_report_${avgModule}_${new Date().toISOString().split('T')[0]}`;
    } else if (type === 'RES') {
      data = resolutionTable;
      headers = [["Complaint ID", "Start Date", "End Date", "Days Taken"]];
      title = `Resolution Time: ${resolutionRange}`;
      filename = `resolution_report_${resolutionRange}_${new Date().toISOString().split('T')[0]}`;
    }

    const formatDateCSV = (date) => {
      if (!date) return "-";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "-";
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return ` ${day}-${month}-${year} ${hours}:${minutes}`;
    };

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
        if (type === 'TABLE' || type === 'MAIN') {
          htmlContent += `<td>${row.complaint_code}</td>`;
          htmlContent += `<td>${formatDateCSV(row.created_at)}</td>`;
          htmlContent += `<td>${formatDateCSV(row.resolved_at)}</td>`;
          htmlContent += `<td>${row.complaint_type}</td>`;
          htmlContent += `<td>${row.status}</td>`;
        } else {
          htmlContent += `<td>${row.code}</td>`;
          htmlContent += `<td>${formatDateCSV(row.start_date || row.created_at)}</td>`;
          htmlContent += `<td>${formatDateCSV(row.end_date || row.resolved_at)}</td>`;
          htmlContent += `<td>${row.days}</td>`;
        }
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
      // PDF
      doc.text(title, 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      const tableBody = data.map(row => {
        if (type === 'TABLE' || type === 'MAIN') {
          return [
            row.complaint_code,
            row.created_at ? new Date(row.created_at).toLocaleDateString() : '-',
            row.resolved_at ? new Date(row.resolved_at).toLocaleDateString() : '-',
            row.complaint_type,
            row.status
          ];
        } else {
          return [
            row.code,
            row.start_date || row.created_at ? new Date(row.start_date || row.created_at).toLocaleDateString() : '-',
            row.end_date || row.resolved_at ? new Date(row.end_date || row.resolved_at).toLocaleDateString() : '-',
            row.days
          ];
        }
      });

      autoTable(doc, {
        startY: 40,
        head: headers,
        body: tableBody,
      });

      doc.save(`${filename}.pdf`);
    }
  };

  /* ============================================================= */
  /*                   DATE FILTER HANDLER                         */
  /* ============================================================= */

  const handleDateFilterChange = (value) => {
    setDateFilter(value);

    if (value === "ALL" || value === "CUSTOM") {
      if (value === "ALL") {
        setFromDate("");
        setToDate("");
        loadDashboard(statusGroup, status, true, "", "");
      }
      return;
    }

    const today = new Date();
    let start = new Date();
    let end = new Date();

    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    switch (value) {
      case "TODAY":
        break;
      case "YESTERDAY":
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
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
      case "LAST_MONTH":
        start.setMonth(today.getMonth() - 1);
        start.setDate(1);
        end.setDate(0);
        break;
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
    const formattedEnd = (value === "LAST_MONTH") ? format(end) : format(today);

    setFromDate(formattedStart);
    setToDate(formattedEnd);

    loadDashboard(statusGroup, status, true, formattedStart, formattedEnd);
  };

  /* ============================================================= */
  /*              COMPLAINT TYPE FILTER DATA                       */
  /* ============================================================= */

  const typeFilters = [
    { label: "Physical", type: "PHYSICAL", icon: <FaBoxOpen />, color: "bg-amber-50 text-amber-600" },
    { label: "ADR", type: "ADR", icon: <FaFlask />, color: "bg-indigo-50 text-indigo-600" },
    { label: "Poor Quality", type: "QUALITY", icon: <FaExclamationTriangle className="text-blue-500" />, color: "bg-blue-50 text-blue-600" }
  ];

  /* ============================================================= */
  /*              STATUS BAR GRAPH DATA (ADD HERE)                 */
  /* ============================================================= */

  const statusBarData = [
    {
      label: "Complaint Raised",
      count: counts.SUBMITTED || 0,
      sg: "",
      st: "SUBMITTED",
      icon: <FaClipboardCheck className="text-2xl" />,
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      gradient: "from-blue-500 to-blue-700"
    },

    {
      label: "Dispatched (FAC)",
      count: counts.SAMPLE_DISPATCHED_FACILITY || 0,
      sg: "",
      st: "SAMPLE_DISPATCHED_FACILITY",
      icon: <FaShippingFast className="text-2xl" />,
      color: "bg-indigo-500",
      hoverColor: "hover:bg-indigo-600",
      gradient: "from-indigo-400 to-indigo-600"
    },
    {
      label: "Dispatched (WH)",
      count: counts.SAMPLE_DISPATCHED_WH || 0,
      sg: "",
      st: "SAMPLE_DISPATCHED_WH",
      icon: <FaTruck className="text-2xl" />,
      color: "bg-sky-600",
      hoverColor: "hover:bg-sky-700",
      gradient: "from-sky-500 to-sky-700"
    },

    {
      label: "Received (WH)",
      count: counts.SAMPLE_RECEIVED_WH || 0,
      sg: "",
      st: "SAMPLE_RECEIVED_WH",
      icon: <FaWarehouse className="text-2xl" />,
      color: "bg-cyan-600",
      hoverColor: "hover:bg-cyan-700",
      gradient: "from-cyan-500 to-cyan-700"
    },
    {
      label: "Received (QC)",
      count: counts.SAMPLE_RECEIVED_QC || 0,
      sg: "",
      st: "SAMPLE_RECEIVED_QC",
      icon: <FaFlask className="text-2xl" />,
      color: "bg-teal-600",
      hoverColor: "hover:bg-teal-700",
      gradient: "from-teal-500 to-teal-700"
    },

    {
      label: "In Progress (WH)",
      count: counts.IN_PROGRESS_WH || 0,
      sg: "",
      st: "IN_PROGRESS_WH",
      icon: <FaBoxOpen className="text-2xl" />,
      color: "bg-sky-500",
      hoverColor: "hover:bg-sky-600",
      gradient: "from-sky-400 to-sky-600"
    },
    {
      label: "In Progress (QC)",
      count: counts.IN_PROGRESS_QC || 0,
      sg: "",
      st: "IN_PROGRESS_QC",
      icon: <FaClock className="text-2xl" />,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      gradient: "from-blue-400 to-blue-600"
    },

    {
      label: "Rejected",
      count: counts.REJECTED_WH || 0,
      sg: "",
      st: "REJECTED_WH",
      icon: <FaTimesCircle className="text-2xl" />,
      color: "bg-red-600",
      hoverColor: "hover:bg-red-700",
      gradient: "from-red-500 to-red-700"
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
      gradient: "from-blue-500 to-blue-700"
    },
    {
      label: "Warehouse",
      value: avgTimeData?.average?.warehouse || 0,
      key: "WAREHOUSE",
      icon: <FaWarehouse className="text-2xl" />,
      gradient: "from-indigo-500 to-indigo-700"
    },
    {
      label: "QC",
      value: avgTimeData?.average?.qc || 0,
      key: "QC",
      icon: <FaFlask className="text-2xl" />,
      gradient: "from-sky-500 to-sky-700"
    }
  ];
  // ===== RESOLUTION TIME BARS =====
  const resolutionBars = [
    {
      label: "0–10 Days",
      key: "0_10",
      value: resolutionGraph?.summary?.["0_10"] || 0,
      gradient: "from-blue-400 to-blue-600",
      icon: <FaCheckCircle className="text-xl" />
    },
    {
      label: "11–20 Days",
      key: "11_20",
      value: resolutionGraph?.summary?.["11_20"] || 0,
      gradient: "from-indigo-400 to-indigo-600",
      icon: <FaClock className="text-xl" />
    },
    {
      label: "21–100 Days",
      key: "21_100",
      value: resolutionGraph?.summary?.["21_100"] || 0,
      gradient: "from-sky-400 to-sky-600",
      icon: <FaCalendarAlt className="text-xl" />
    },
    {
      label: "100+ Days",
      key: "100_plus",
      value: resolutionGraph?.summary?.["100_plus"] || 0,
      gradient: "from-slate-400 to-slate-600",
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
    setDateFilter("ALL");
    setScrollTrigger(prev => prev + 1);
    loadDashboard("", "", true);
  };
  // ===== EXCEL DOWNLOAD HANDLER =====
  const handleExcelDownload = () => {
    if (!complaints || complaints.length === 0) {
      alert("No complaints available to download");
      return;
    }

    const formatDate = (date) => {
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
      formatDate(c.created_at)
    ]);

    // Create HTML table with bold headers that Excel can open
    let htmlContent = '<html><head><meta charset="utf-8"><style>table { border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #f2f2f2; font-weight: bold; }</style></head><body><table>';

    // Add header row
    htmlContent += '<thead><tr>';
    headers.forEach(header => {
      htmlContent += `<th>${header}</th>`;
    });
    htmlContent += '</tr></thead><tbody>';

    // Add data rows
    rows.forEach(row => {
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
    link.download = `Admin_Complaints_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ===== CSV DOWNLOAD HANDLER (NOW USES XLSX WITH BOLD HEADERS) =====
  const handleCSVDownload = () => {
    if (!complaints || complaints.length === 0) {
      alert("No complaints available to download");
      return;
    }

    const formatDate = (date) => {
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
      formatDate(c.created_at)
    ]);

    // Create HTML table with bold headers that Excel can open
    let htmlContent = '<html><head><meta charset="utf-8"><style>table { border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #f2f2f2; font-weight: bold; }</style></head><body><table>';

    // Add header row
    htmlContent += '<thead><tr>';
    headers.forEach(header => {
      htmlContent += `<th>${header}</th>`;
    });
    htmlContent += '</tr></thead><tbody>';

    // Add data rows
    rows.forEach(row => {
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
    link.download = `complaints_report_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ===== AVG BAR CLICK HANDLER (SEPARATE TABLE) =====
  const handleAvgBarClick = (moduleKey) => {
    setAvgModule(moduleKey);
    // Sort by days ascending (1 to infinity)
    const rawData = avgTimeData?.details?.[moduleKey] || [];
    const processedData = rawData.map(item => {
      let days = item.days;
      if (!item.end_date) {
        const start = new Date(item.start_date);
        const end = new Date();
        const diffTime = Math.abs(end - start);
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      return { ...item, days };
    });

    const data = processedData.sort((a, b) => a.days - b.days);
    setAvgTableData(data);
    setActiveView("AVG_TABLE");
    setScrollTrigger(prev => prev + 1);
  };
  // ===== RESOLUTION BAR CLICK HANDLER =====
  const handleResolutionBarClick = (rangeKey, label) => {
    setResolutionRange(label);
    // Sort by days ascending (1 to infinity)
    const data = [...(resolutionGraph?.details?.[rangeKey] || [])].sort((a, b) => a.days - b.days);
    setResolutionTable(data);
    setActiveView("RESOLUTION_TABLE");
    setScrollTrigger(prev => prev + 1);
  };



  const getStatusColor = (st) => {
    switch (st) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SAMPLE_DISPATCHED_FACILITY': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'SAMPLE_DISPATCHED_WH': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'SAMPLE_RECEIVED_WH': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'SAMPLE_RECEIVED_QC': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'IN_PROGRESS_WH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'IN_PROGRESS_QC': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'REJECTED_WH': return 'bg-red-100 text-red-700 border-red-200';
      case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-inter">

      {/* ================= GOV HEADER ================= */}
      <GovHeader />

      <div className="flex flex-1 overflow-hidden">

        {/* ================= SIDEBAR ================= */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-lg z-20">

          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
                <FaUserShield size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">Admin Panel</h2>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1">Grievance Dashboard</p>
              </div>
            </div>
          </div>

          {/* Scrollable Status List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">

            <div className="px-2 mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overview</p>
            </div>

            <button
              onClick={handleTotalComplaintsClick}
              className={`w-full p-4 rounded-xl text-left border transition-all duration-200 group relative overflow-hidden ${!status && !statusGroup ? 'bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-100' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm text-slate-600'
                }`}
            >
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className={`text-[10px] font-black uppercase tracking-widest ${!status && !statusGroup ? 'text-indigo-100' : 'text-slate-400'}`}>Total Complaints</span>
                <FaChartBar className={!status && !statusGroup ? 'text-white' : 'text-indigo-600'} />
              </div>
              <div className={`text-3xl font-black relative z-10 ${!status && !statusGroup ? 'text-white' : 'text-slate-800'}`}>
                {totalComplaints}
              </div>
              {/* Background Pattern for Active State */}
              {!status && !statusGroup && (
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                  <FaChartBar size={80} />
                </div>
              )}
            </button>

            <div className="px-2 mt-6 mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type Filters</p>
            </div>

            {typeFilters.map((item) => {
              const isActive = complaintType === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => {
                    setScrollTrigger(prev => prev + 1);
                    if (isActive) {
                      clearFilters();
                    } else {
                      loadDashboard("", "", true, fromDate, toDate, item.type);
                    }
                  }}
                  className={`w-full p-3 rounded-xl text-left border transition-all duration-200 flex items-center justify-between group ${isActive
                    ? 'bg-slate-800 border-slate-800 text-white shadow-md'
                    : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : `${item.color} group-hover:bg-white`}`}>
                      {item.icon}
                    </div>
                    <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>{item.label}</span>
                  </div>
                  <span className={`text-xs font-black ${isActive ? 'bg-white text-slate-800' : 'bg-slate-100 text-slate-600'} px-2 py-1 rounded-md`}>
                    {counts[item.type] || 0}
                  </span>
                </button>
              );
            })}

            <div className="px-2 mt-6 mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Filters</p>
            </div>

            {statusBarData.map((item) => {
              const isActive = status === item.st || (item.sg && statusGroup === item.sg);
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setScrollTrigger(prev => prev + 1);
                    if (isActive) {
                      clearFilters();
                    } else {
                      loadDashboard(item.sg, item.st, true);
                    }
                  }}
                  className={`w-full p-3 rounded-xl text-left border transition-all duration-200 flex items-center justify-between group ${isActive
                    ? 'bg-slate-800 border-slate-800 text-white shadow-md'
                    : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600'}`}>
                      {item.icon}
                    </div>
                    <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>{item.label}</span>
                  </div>
                  <span className={`text-xs font-black ${isActive ? 'bg-white text-slate-800' : 'bg-slate-100 text-slate-600'} px-2 py-1 rounded-md`}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
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

          {/* Top Bar */}
          <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-10">
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {status ? `Filtered by Status: ${status}` : complaintType ? `Filtered by Type: ${complaintType}` : activeView === 'DASHBOARD' ? 'Showing all records' : 'Filtered View'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* CLEAR FILTER BUTTON */}
              {(status || statusGroup || fromDate || toDate || complaintType || dateFilter !== "ALL" || activeView === 'TABLE') && (
                <button
                  onClick={clearFilters}
                  className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-xs font-bold border border-red-200 transition-colors flex items-center gap-2"
                >
                  <FaBroom /> Clear
                </button>
              )}

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
                      loadDashboard(statusGroup, status, true, fromDate, toDate, complaintType, complaintCode);
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
                          loadDashboard(statusGroup, status, true, fromDate, toDate, complaintType, c.complaint_code);
                        }}
                        className="px-4 py-3 cursor-pointer hover:bg-indigo-50 text-xs font-bold text-slate-700 border-b border-slate-50 last:border-0"
                      >
                        {c.complaint_code}
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                  <option value="CUSTOM">Custom Range</option>
                </select>

                {dateFilter === "CUSTOM" && (
                  <>
                    <div className="w-px h-4 bg-slate-300 mx-2"></div>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={e => setFromDate(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 px-2"
                    />
                    <span className="text-slate-400 text-[10px] font-black uppercase">TO</span>
                    <input
                      type="date"
                      value={toDate}
                      onChange={e => setToDate(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 px-2"
                    />
                    <button onClick={() => loadDashboard(statusGroup, status, true, fromDate, toDate)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md shadow-sm transition-colors">
                      <FaFilter size={10} />
                    </button>
                  </>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setActiveDownloadMenu(activeDownloadMenu === 'MAIN' ? null : 'MAIN')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2"
                >
                  <FaDownload /> Download
                </button>

                {activeDownloadMenu === 'MAIN' && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <button
                      onClick={() => handleSpecificDownload('MAIN', 'CSV')}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                    >
                      <span className="text-green-600">CSV</span> Export
                    </button>
                    <button
                      onClick={() => handleSpecificDownload('MAIN', 'PDF')}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                    >
                      <span className="text-red-500">PDF</span> Export
                    </button>
                  </div>
                )}
              </div>




            </div>
          </header>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

            {/* DYNAMIC CONTENT (TABLES) */}
            <div className="space-y-8 pb-12">

              {activeView === 'TABLE' && (
                <div ref={tableRef} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md"><FaFileAlt size={12} /></span>
                      Grievance Records
                      <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full ml-2">{complaints.length}</span>
                    </h3>

                    {/* TABLE DOWNLOAD */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveDownloadMenu(activeDownloadMenu === 'TABLE' ? null : 'TABLE')}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        <FaDownload size={10} /> Download
                      </button>
                      {activeDownloadMenu === 'TABLE' && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
                          <button onClick={() => handleSpecificDownload('TABLE', 'CSV')} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50">CSV Export</button>
                          <button onClick={() => handleSpecificDownload('TABLE', 'PDF')} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50">PDF Export</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                        <tr>
                          {["ID", "Start Date", "End Date", "Type", "Facility", "Item", "Status", "Action"].map(h => (
                            <th key={h} className="px-6 py-4 text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {complaints.length === 0 ? (
                          <tr><td colSpan="7" className="p-12 text-center text-slate-400 font-medium italic">No records found for this selection.</td></tr>
                        ) : (
                          complaints.map((c) => (
                            <tr key={c.complaint_code} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-bold text-indigo-600">{c.complaint_code}</td>
                              <td className="px-6 py-4 text-slate-600 text-xs font-bold whitespace-nowrap">
                                {formatDateDDMMYYYY(c.created_at)}
                              </td>
                              <td className="px-6 py-4 text-slate-600 text-xs font-bold whitespace-nowrap">
                                {formatDateDDMMYYYY(c.resolved_at || c.rejected_at)}
                              </td>
                              <td className="px-6 py-4 font-semibold text-slate-700">{c.complaint_type}</td>
                              <td className="px-6 py-4 text-slate-600">{c.facility_name}</td>
                              <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]" title={c.item_name}>{c.item_name}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusColor(c.status)}`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => navigate(`/admin/report/view/${c.complaint_code}`)}
                                  className="text-indigo-600 hover:text-indigo-800 font-bold text-xs border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {/* GRAPHS SECTION (Always visible, pushed down by table if active) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* STATUS BAR GRAPH */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 xl:col-span-2">
                  <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <FaChartBar className="text-blue-500" /> Complaint Status Analysis
                  </h3>
                  <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {statusBarData.map(bar => {
                      const maxCount = Math.max(...statusBarData.map(b => b.count), 1);
                      const height = bar.count === 0 ? 2 : Math.max((bar.count / maxCount) * 100, 10);

                      return (
                        <div key={bar.label} className="flex flex-col items-center group flex-1 cursor-pointer h-full justify-end" onClick={() => {
                          const isActive = status === bar.st || (bar.sg && statusGroup === bar.sg);
                          if (isActive) {
                            clearFilters();
                          } else {
                            loadDashboard(bar.sg, bar.st, true);
                          }
                        }}>
                          <div className={`mb-2 text-xs font-bold text-slate-600 transition-colors ${bar.hoverColor.replace('bg', 'text')}`}>{bar.count}</div>
                          <div className="w-full h-full flex items-end">
                            <div className={`w-full rounded-t-lg bg-gradient-to-t ${bar.gradient} shadow-md transition-all duration-300 relative overflow-hidden`} style={{ height: `${height}%` }}></div>
                          </div>
                          <div className="mt-2 text-[10px] text-center font-bold text-slate-400 group-hover:text-slate-800 uppercase tracking-tight leading-3">{bar.label}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* AVG HANDLING TIME */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <FaChartLine className="text-green-500" /> Avg. Handling Time of complaints (Days)
                  </h3>
                  <div className="flex items-end justify-around h-48">
                    {avgHandlingBars.map(bar => {
                      const maxVal = Math.max(...avgHandlingBars.map(b => b.value), 1);
                      const height = bar.value === 0 ? 2 : Math.max((bar.value / maxVal) * 100, 10);

                      return (
                        <div key={bar.label} className="flex flex-col items-center cursor-pointer group h-full justify-end" onClick={() => handleAvgBarClick(bar.key)}>
                          <span className="mb-2 font-black text-slate-700 text-lg group-hover:scale-110 transition-transform">{bar.value}</span>
                          <div className="w-16 h-full flex items-end">
                            <div className="w-full rounded-t-xl bg-gradient-to-t from-blue-500 to-blue-700 opacity-80 group-hover:opacity-100 transition-all duration-300" style={{ height: `${height}%` }}></div>
                          </div>
                          <span className="mt-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{bar.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* RESOLUTION TIME */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <FaCheckCircle className="text-purple-500" /> Resolution Timeline of complaints
                  </h3>
                  <div className="flex items-end justify-around h-48">
                    {resolutionBars.map(bar => {
                      const maxVal = Math.max(...resolutionBars.map(b => b.value), 1);
                      const height = bar.value === 0 ? 2 : Math.max((bar.value / maxVal) * 100, 10);

                      return (
                        <div key={bar.label} className="flex flex-col items-center cursor-pointer group h-full justify-end" onClick={() => handleResolutionBarClick(bar.key, bar.label)}>
                          <span className="mb-2 font-black text-slate-700 text-lg group-hover:scale-110 transition-transform">{bar.value}</span>
                          <div className="w-16 h-full flex items-end">
                            <div className={`w-full rounded-t-xl bg-gradient-to-t ${bar.gradient} opacity-80 group-hover:opacity-100 transition-all duration-300`} style={{ height: `${height}%` }}></div>
                          </div>
                          <span className="mt-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{bar.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

              {/* DETAIL TABLES (Rendered BELOW graphs) */}

              {activeView === 'AVG_TABLE' && (
                <div ref={tableRef} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up">
                  <div className="px-6 py-4 border-b border-slate-100 bg-blue-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-blue-800 flex items-center gap-2">
                      <FaClock /> Average Time Analysis: {avgModule}
                    </h3>
                    <div className="relative">
                      <button
                        onClick={() => setActiveDownloadMenu(activeDownloadMenu === 'AVG' ? null : 'AVG')}
                        className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
                      >
                        <FaDownload size={10} /> Download
                      </button>
                      {activeDownloadMenu === 'AVG' && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
                          <button onClick={() => handleSpecificDownload('AVG', 'CSV')} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50">CSV Export</button>
                          <button onClick={() => handleSpecificDownload('AVG', 'PDF')} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50">PDF Export</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                      <tr>
                        <th className="px-6 py-4 text-left">Complaint ID</th>
                        <th className="px-6 py-4 text-left">Start Date</th>
                        <th className="px-6 py-4 text-left">End Date</th>
                        <th className="px-6 py-4 text-left">Days Taken</th>
                        <th className="px-6 py-4 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {avgTableData.map(r => (
                        <tr key={r.code} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-700">{r.code}</td>
                          <td className="px-6 py-4 text-slate-600">
                            {formatDateDDMMYYYY(r.start_date)}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {formatDateDDMMYYYY(r.end_date)}
                          </td>
                          <td className="px-6 py-4 font-bold text-green-600">{r.days} Days</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => navigate(`/admin/report/view/${r.code}`)}
                              className="text-indigo-600 hover:text-white font-black text-[10px] uppercase border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg hover:border-indigo-600 hover:bg-indigo-600 transition-all shadow-sm"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeView === 'RESOLUTION_TABLE' && (
                <div ref={tableRef} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up">
                  <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-indigo-800 flex items-center gap-2">
                      <FaCheckCircle /> Resolution Time: {resolutionRange}
                    </h3>
                    <div className="relative">
                      <button
                        onClick={() => setActiveDownloadMenu(activeDownloadMenu === 'RES' ? null : 'RES')}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        <FaDownload size={10} /> Download
                      </button>
                      {activeDownloadMenu === 'RES' && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
                          <button onClick={() => handleSpecificDownload('RES', 'CSV')} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50">CSV Export</button>
                          <button onClick={() => handleSpecificDownload('RES', 'PDF')} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50">PDF Export</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                      <tr>
                        <th className="px-6 py-4 text-left">Complaint ID</th>
                        <th className="px-6 py-4 text-left">Start Date</th>
                        <th className="px-6 py-4 text-left">End Date</th>
                        <th className="px-6 py-4 text-left">Days Taken</th>
                        <th className="px-6 py-4 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resolutionTable.map(r => (
                        <tr key={r.code} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-700">{r.code}</td>
                          <td className="px-6 py-4 text-slate-600">
                            {formatDateDDMMYYYY(r.created_at)}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {formatDateDDMMYYYY(r.resolved_at || r.rejected_at)}
                          </td>
                          <td className="px-6 py-4 font-bold text-purple-600">{r.days} Days</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => navigate(`/admin/report/view/${r.code}`)}
                              className="text-indigo-600 hover:text-white font-black text-[10px] uppercase border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg hover:border-indigo-600 hover:bg-indigo-600 transition-all shadow-sm"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

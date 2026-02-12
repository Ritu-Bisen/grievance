import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import ComplaintLifecycle from "../../components/ComplaintLifecycle";
import { FaWarehouse, FaBoxOpen, FaHeartbeat, FaExclamationTriangle, FaFileAlt, FaDownload, FaEye, FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function WarehouseAssessmentView() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [qcAssessment, setQcAssessment] = useState(null);

  /* 🖼 PREVIEW STATE (image / pdf / doc) */
  const [previewFile, setPreviewFile] = useState(null);

  /* 🔥 INTEGRATED ACTION STATES */
  const [submitting, setSubmitting] = useState(false);
  const [sameComplaint, setSameComplaint] = useState("");
  const [adrSeverity, setAdrSeverity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [qualityDescription, setQualityDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [resolutionRemark, setResolutionRemark] = useState("");
  const [dispatchRemark, setDispatchRemark] = useState("");

  /* 📦 PHYSICAL ASSESSMENT STATES */
  const [stockWarehouse, setStockWarehouse] = useState("1200");
  const [stockFacility, setStockFacility] = useState("1000");
  const [totalStock, setTotalStock] = useState("500");
  const [tenderNo, setTenderNo] = useState("");
  const [poNo, setPoNo] = useState("");

  /* 🧐 REVIEW WORKFLOW STATE */
  const [reviewMode, setReviewMode] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // RECEIVE, APPROVE, REJECT, ASSESS, RESOLVE, DISPATCH
  const [pendingData, setPendingData] = useState(null);

  /* 📄 PDF STATE */
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const loadData = () => {
    api
      .get(`/grievance/warehouse/assessment/view/${code}`)
      .then(res => {
        setComplaint(res.data.complaint);
        setAssessment(res.data.assessment);
        setQcAssessment(res.data.qcAssessment);
      })
      .catch(() => alert("Failed to load warehouse assessment"));
  };

  useEffect(() => {
    loadData();
  }, [code]);

  useEffect(() => {
    if (complaint) {
      setTenderNo(complaint.tender_no || "TN-2024-001");
      setPoNo(complaint.po_no || "PO-889977");
    }
  }, [complaint]);

  const calculateTotalStock = (wh, fac) => {
    const w = parseFloat(wh) || 0;
    const f = parseFloat(fac) || 0;
    setTotalStock(w + f);
  };

  /* ---------- PDF DOWNLOAD ---------- */
  const imageUrlToBase64 = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image`);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Error fetching image for PDF:", url, err);
      throw err;
    }
  };

  const downloadPDF = async () => {
    setShowDownloadMenu(false);
    try {
      setLoadingPDF(true);
      const doc = new jsPDF();

      // BRANDING & HEADER
      doc.setFillColor(234, 88, 12); // orange-600
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("Grievance Management System", 105, 18, { align: "center" });
      doc.setFontSize(12);
      doc.text("Warehouse Assessment Report", 105, 28, { align: "center" });

      let yPos = 50;

      // Complaint ID & Status Header
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Complaint ID: ${complaint.complaint_code}`, 14, yPos);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Status: ${complaint.status}`, 140, yPos);
      yPos += 15;

      // Date formatters
      const createdAtFormatted = complaint.created_at ? new Date(complaint.created_at).toLocaleString() : "—";
      const rejectedAtFormatted = complaint.rejected_at ? new Date(complaint.rejected_at).toLocaleString() : null;
      const resolvedAtFormatted = complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleString() : null;

      // ALL FIELDS including tender, PO, etc.
      const allFields = [
        ["Complaint ID", complaint.complaint_code],
        ["Complaint Type", complaint.complaint_type],
        ["Category", complaint.category],
        ["Facility Name", complaint.facility_name],
        ["Facility Address", complaint.facility_address || "—"],
        ["Item Name", complaint.item_name],
        ["Item Code", complaint.item_code],
        ["Batch Number", complaint.batch_no],
        ["Warehouse Code", complaint.warehouse_code || "—"],
        ["Tender No", complaint.tender_no || assessment?.tender_no || "—"],
        ["PO Number", complaint.po_no || assessment?.po_no || "—"],
        ["Firm Name", complaint.firm_name || "—"],
        ["Stock Warehouse", assessment?.stock_warehouse || "—"],
        ["Stock Facility", assessment?.stock_facility || "—"],
        ["Total Stock", assessment?.total_stock || "—"],
        ["Mfg Date", complaint.mfg_date ? new Date(complaint.mfg_date).toLocaleDateString() : "—"],
        ["Exp Date", complaint.exp_date ? new Date(complaint.exp_date).toLocaleDateString() : "—"],
        ["Purchase Date", complaint.purchase_date ? new Date(complaint.purchase_date).toLocaleDateString() : "—"],
        ["Quantity Received", complaint.quantity_received ?? "—"],
        ["Affected Quantity", complaint.affected_quantity ?? "—"],
        ["Created On", createdAtFormatted],
        ["OPD Slip", complaint.opd_slip ? "View/Download" : "—"],
      ];

      if (rejectedAtFormatted) allFields.push(["Rejected On", rejectedAtFormatted]);
      if (resolvedAtFormatted) allFields.push(["Resolved On", resolvedAtFormatted]);

      // SPLIT FIELDS INTO TWO COLUMNS (HALF & HALF)
      const half = Math.ceil(allFields.length / 2);
      const leftData = allFields.slice(0, half);
      const rightData = allFields.slice(half);

      const tableConfig = {
        startY: yPos,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 35 } },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 1) {
            const label = data.row.cells[0].raw;
            if (label === "OPD Slip" && complaint.opd_slip) {
              data.cell.styles.textColor = [37, 99, 235]; // blue-600
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 1) {
            const label = data.row.cells[0].raw;
            if (label === "OPD Slip" && complaint.opd_slip) {
              doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
                url: `http://localhost:5000/uploads/${complaint.opd_slip}`,
              });
            }
          }
        },
      };

      // Render Left Table
      autoTable(doc, {
        ...tableConfig,
        body: leftData,
        margin: { left: 14, right: 110 },
      });

      // Render Right Table (Starting at same Y)
      autoTable(doc, {
        ...tableConfig,
        body: rightData,
        margin: { left: 110, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // DESCRIPTION SECTION
      doc.setFont("helvetica", "bold");
      doc.text("Description:", 14, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitDesc = doc.splitTextToSize(complaint.description || "—", 182);
      doc.text(splitDesc, 14, yPos);
      yPos += splitDesc.length * 5 + 10;

      // WAREHOUSE ASSESSMENT SECTION
      if (assessment) {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Warehouse Assessment Details:", 14, yPos);
        yPos += 8;

        const assessFields = [
          ["Assessment Type", assessment.assessment_type || "—"],
          ["Same Complaint Present", assessment.same_complaint_present || "—"],
          ["ADR Severity", assessment.adr_severity || "—"],
          ["Quality Description", assessment.quality_description || "—"],
          ["Remarks", assessment.remarks || "—"],
        ].filter(([, val]) => val !== "—");

        if (assessFields.length > 0) {
          autoTable(doc, {
            startY: yPos,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
            body: assessFields,
          });
          yPos = doc.lastAutoTable.finalY + 10;
        }
      }

      // IMAGES SECTION (EMBED IN THE REPORT IN A GRID)
      const images = complaint.documents?.filter(d => isImage(d.original_name || d)) || [];
      if (images.length > 0) {
        if (yPos > 220) { doc.addPage(); yPos = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Supporting Images:", 14, yPos);
        yPos += 10;

        const imgWidth = 58;
        const imgHeight = 58;
        const gap = 4;
        const startX = 14;
        let xPos = startX;
        let count = 0;

        for (const imgDoc of images) {
          if (yPos + imgHeight > 270) {
            doc.addPage();
            yPos = 20;
          }
          try {
            const path = typeof imgDoc === "string" ? imgDoc : imgDoc.file_name;
            const fullUrl = `http://localhost:5000/uploads/${path}`;
            const base64 = await imageUrlToBase64(fullUrl);

            doc.addImage(base64, "JPEG", xPos, yPos, imgWidth, imgHeight);
            doc.setFontSize(7);
            const docName = typeof imgDoc === "string" ? imgDoc : imgDoc.original_name || imgDoc.file_name;
            const truncatedName = docName.length > 25 ? docName.substring(0, 22) + "..." : docName;
            doc.text(truncatedName, xPos, yPos + imgHeight + 4);

            count++;
            if (count % 3 === 0) {
              xPos = startX;
              yPos += imgHeight + 12;
            } else {
              xPos += imgWidth + gap;
            }
          } catch (err) {
            console.error("Failed to load image for PDF", err);
          }
        }
        if (count % 3 !== 0) yPos += imgHeight + 12;
      }

      // FOOTER
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Generated on: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
          105,
          285,
          { align: "center" }
        );
      }

      doc.save(`Complaint_${complaint.complaint_code}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoadingPDF(false);
    }
  };

  /* ---------------- INTEGRATED HANDLERS (UPDATED FOR REVIEW) ---------------- */

  const initiateReview = (action, data = null) => {
    setPendingAction(action);
    setPendingData(data);
    setReviewMode(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const executeAction = async () => {
    setSubmitting(true);
    try {
      switch (pendingAction) {
        case "RECEIVE":
          await api.post("/grievance/warehouse/receive-sample", { complaint_code: code });
          break;
        case "APPROVE":
          await api.post("/grievance/warehouse/approve", { complaint_code: code });
          break;
        case "REJECT":
          await api.post("/grievance/warehouse/reject", { complaint_code: code });
          break;
        case "ASSESS":
          await api.post("/grievance/warehouse/assessment/submit", pendingData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          break;
        case "RESOLVE":
          await api.post("/grievance/warehouse/resolve", pendingData);
          break;
        case "DISPATCH":
          await api.post("/grievance/warehouse/dispatch", pendingData);
          break;
        default:
          break;
      }
      setReviewMode(false);
      setPendingAction(null);
      setPendingData(null);
      loadData();
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiveSample = () => initiateReview("RECEIVE");
  const handleApprove = () => initiateReview("APPROVE");
  const handleReject = () => initiateReview("REJECT");

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const combined = [...files, ...newFiles];
    if (combined.length > 5) {
      alert("Max 5 documents allowed");
      return;
    }
    setFiles(combined);
  };

  const handleAssessmentSubmit = () => {
    if (!sameComplaint) return alert("Please check if same complaint is present");
    if (complaint.complaint_type === "ADR" && (!adrSeverity || !remarks)) return alert("Please fill mandatory ADR fields");
    if (complaint.complaint_type === "QUALITY" && !qualityDescription) return alert("Please provide quality description");

    const formData = new FormData();
    formData.append("complaint_code", code);
    formData.append("assessment_type", complaint.complaint_type);
    formData.append("item_code", complaint.item_code);
    formData.append("batch_no", complaint.batch_no);

    if (complaint.complaint_type === "PHYSICAL") {
      formData.append("tender_no", tenderNo);
      formData.append("po_no", poNo);
      formData.append("stock_warehouse", stockWarehouse);
      formData.append("stock_facility", stockFacility);
      formData.append("total_stock", totalStock);
    } else {
      formData.append("tender_no", tenderNo);
      formData.append("po_no", poNo);
      formData.append("stock_warehouse", "100");
      formData.append("stock_facility", "100");
      formData.append("total_stock", "200");
    }

    formData.append("same_complaint_present", sameComplaint);
    if (remarks) formData.append("remarks", remarks);
    if (adrSeverity) formData.append("adr_severity", adrSeverity);
    if (qualityDescription) formData.append("quality_description", qualityDescription);

    files.forEach((file) => {
      formData.append("documents", file);
    });

    initiateReview("ASSESS", formData);
  };

  const handleResolve = () => {
    if (!resolutionRemark) return alert("Please provide resolution remarks");
    initiateReview("RESOLVE", { complaint_code: code, resolution_remark: resolutionRemark });
  };

  const handleDispatch = () => {
    if (!dispatchRemark) return alert("Please provide dispatch remarks");
    initiateReview("DISPATCH", { complaint_code: code, remarks: dispatchRemark });
  };

  if (!complaint) return null;

  // 🆕 Warehouse Complaint Detection
  const isWarehouseComplaint = complaint.facility_name?.startsWith("WAREHOUSE:");

  /* ---------- SAFE DATES ---------- */
  const createdAtFormatted = complaint.created_at
    ? new Date(complaint.created_at).toLocaleString()
    : "—";

  const rejectedAtFormatted = complaint.rejected_at
    ? new Date(complaint.rejected_at).toLocaleString()
    : null;

  const resolvedAtFormatted = complaint.resolved_at
    ? new Date(complaint.resolved_at).toLocaleString()
    : null;

  /* ---------- FILE HELPERS ---------- */
  const getFileName = (doc) => {
    if (typeof doc === "string") return doc.split("-").slice(1).join("-");
    return doc.original_name;
  };

  const getFilePath = (doc) => {
    if (typeof doc === "string") return doc;
    return doc.path || doc.file_name;
  };

  const isImage = (name) => /\.(jpg|jpeg|png|webp)$/i.test(name);
  const isPDF = (name, url = "") => /\.pdf$/i.test(name) || (url && /\.pdf($|\?|#)/i.test(url));
  const isText = (name) => /\.(txt|csv)$/i.test(name);


  /* ================= CSV DOWNLOAD ================= */
  const downloadCSV = () => {
    setShowDownloadMenu(false);
    const complaintRows = [
      ["COMPLAINT", "Complaint Code", complaint.complaint_code],
      ["COMPLAINT", "Type", complaint.complaint_type],
      ["COMPLAINT", "Category", complaint.category],
      ["COMPLAINT", "Facility", complaint.facility_name],
      ["COMPLAINT", "Item Name", complaint.item_name],
      ["COMPLAINT", "Item Code", complaint.item_code],
      ["COMPLAINT", "Batch No", complaint.batch_no],
      ["COMPLAINT", "Status", complaint.status],
    ];

    const formatDateCSV = (date) => {
      if (!date) return "-";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "-";
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      // ✅ Adding a leading space to force Excel to treat this as text and avoid "########"
      return ` ${day}-${month}-${year} ${hours}:${minutes}`;
    };

    if (complaint.created_at) {
      complaintRows.push([
        "COMPLAINT",
        "Created On",
        formatDateCSV(complaint.created_at)
      ]);
    }

    if (complaint.resolved_at) {
      complaintRows.push([
        "COMPLAINT",
        "Resolved On",
        formatDateCSV(complaint.resolved_at)
      ]);
    }

    /* ComplaintTopSection extra details */
    if (complaint.facility_address) {
      complaintRows.push([
        "COMPLAINT",
        "Facility Address",
        complaint.facility_address
      ]);
    }

    if (complaint.quantity_received) {
      complaintRows.push([
        "COMPLAINT",
        "Quantity Received",
        complaint.quantity_received
      ]);
    }

    if (complaint.affected_quantity) {
      complaintRows.push([
        "COMPLAINT",
        "Affected Quantity",
        complaint.affected_quantity
      ]);
    }

    if (complaint.description) {
      complaintRows.push([
        "COMPLAINT",
        "Description",
        complaint.description
      ]);
    }

    /* Rejected specific */
    if (complaint.status === "REJECTED_WH") {
      complaintRows.push(["COMPLAINT", "Rejected At", "Warehouse"]);

      if (complaint.rejected_at) {
        complaintRows.push([
          "COMPLAINT",
          "Rejected On",
          formatDateCSV(complaint.rejected_at)
        ]);
      }

      if (complaint.resolution_remark) {
        complaintRows.push([
          "COMPLAINT",
          "Rejection Remark",
          complaint.resolution_remark
        ]);
      }
    }

    let assessmentRows = [];

    if (assessment?.same_complaint_present) {
      assessmentRows.push([
        "ASSESSMENT",
        "Same Complaint Present at Warehouse",
        assessment.same_complaint_present
      ]);
    }

    if (assessment?.assessment_type === "PHYSICAL") {
      assessmentRows.push(
        ["ASSESSMENT", "Assessment Type", "PHYSICAL"],
        ["ASSESSMENT", "Tender No", assessment.tender_no],
        ["ASSESSMENT", "PO No", assessment.po_no],
        ["ASSESSMENT", "Stock (Warehouse)", assessment.stock_warehouse],
        ["ASSESSMENT", "Stock (Facility)", assessment.stock_facility],
        ["ASSESSMENT", "Total Stock", assessment.total_stock]
      );
    }

    if (assessment?.assessment_type === "ADR") {
      assessmentRows.push(
        ["ASSESSMENT", "Assessment Type", "ADR"],
        ["ASSESSMENT", "Tender No", assessment.tender_no],
        ["ASSESSMENT", "PO No", assessment.po_no],
        ["ASSESSMENT", "Stock (Warehouse)", assessment.stock_warehouse],
        ["ASSESSMENT", "Stock (Facility)", assessment.stock_facility],
        ["ASSESSMENT", "Total Stock", assessment.total_stock],
        ["ASSESSMENT", "ADR Severity", assessment.adr_severity],
        ["ASSESSMENT", "Remarks", assessment.remarks]
      );
    }

    if (assessment?.assessment_type === "QUALITY") {
      assessmentRows.push(
        ["ASSESSMENT", "Assessment Type", "QUALITY"],
        ["ASSESSMENT", "Tender No", assessment.tender_no],
        ["ASSESSMENT", "PO No", assessment.po_no],
        ["ASSESSMENT", "Stock (Warehouse)", assessment.stock_warehouse],
        ["ASSESSMENT", "Stock (Facility)", assessment.stock_facility],
        ["ASSESSMENT", "Total Stock", assessment.total_stock],
        ["ASSESSMENT", "Quality Description", assessment.quality_description]
      );
    }

    const rows = [
      ["SECTION", "FIELD", "VALUE"],
      ...complaintRows,
      ...assessmentRows,
    ];

    const csvContent = rows
      .map(r =>
        r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `warehouse_assessment_${complaint.complaint_code}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* ================= REVIEW MODE UI ================= */
  if (reviewMode) {
    return (
      <div className="min-h-screen bg-gray-100">
        <GovHeader />
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 border-b pb-4 mb-6">
            <div className="bg-indigo-100 p-3 rounded-full">
              <FaEye className="text-indigo-600 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Review Action: {pendingAction}</h2>
              <p className="text-gray-500 text-sm">Please review the details below before submitting.</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Context Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Complaint Context</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-gray-600">Complaint ID:</span> <span className="text-gray-900">{complaint.complaint_code}</span></div>
                <div><span className="font-semibold text-gray-600">Type:</span> <span className="text-gray-900">{complaint.complaint_type}</span></div>
                <div><span className="font-semibold text-gray-600">Item:</span> <span className="text-gray-900">{complaint.item_name} ({complaint.item_code})</span></div>
                <div><span className="font-semibold text-gray-600">Batch:</span> <span className="text-gray-900">{complaint.batch_no}</span></div>
              </div>
            </div>

            {/* Action Details */}
            <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4">Submission Data</h4>

              <div className="space-y-3">
                {pendingAction === "RECEIVE" && <p className="text-sm text-gray-700">Confirming receipt of physical sample at warehouse.</p>}
                {pendingAction === "APPROVE" && <p className="text-sm text-gray-700">Approving complaint for further assessment.</p>}
                {pendingAction === "REJECT" && <p className="text-sm text-gray-700 transform text-red-600 font-bold">Rejecting this complaint.</p>}

                {pendingAction === "RESOLVE" && (
                  <div>
                    <span className="block text-xs font-bold text-gray-500">Resolution Remarks</span>
                    <p className="text-gray-800 bg-white p-3 rounded border mt-1">{pendingData?.resolution_remark}</p>
                  </div>
                )}

                {pendingAction === "DISPATCH" && (
                  <div>
                    <span className="block text-xs font-bold text-gray-500">Dispatch Remarks</span>
                    <p className="text-gray-800 bg-white p-3 rounded border mt-1">{pendingData?.remarks}</p>
                  </div>
                )}

                {pendingAction === "ASSESS" && pendingData && (
                  <div className="grid grid-cols-1 gap-3">
                    {Array.from(pendingData.entries()).map(([key, value]) => {
                      if (key === 'documents') return null; // Skip file objects in text view
                      return (
                        <div key={key} className="text-sm border-b border-indigo-100 pb-1 last:border-0">
                          <span className="font-semibold text-gray-600 capitalize mr-2">{key.replace(/_/g, ' ')}:</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      )
                    })}
                    {files.length > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="font-semibold text-gray-600">Attached Files:</span> {files.length} document(s)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button
              onClick={() => setReviewMode(false)}
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
              disabled={submitting}
            >
              Back
            </button>
            <button
              onClick={executeAction}
              disabled={submitting}
              className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
            >
              {submitting ? "Processing..." : "Confirm & Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-5xl mx-auto bg-white p-6 mt-6 border rounded">
        {/* TOP BUTTONS */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/warehouse/dashboard")}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
          >
            ← Back to Dashboard
          </button>

          {/* DOWNLOAD BUTTONS */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition shadow-md"
            >
              <FaDownload />
              <span>Download Report</span>
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <button
                  onClick={downloadCSV}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="text-green-600">CSV</span> Download
                </button>
                <div className="h-px bg-gray-100 mx-2"></div>
                <button
                  onClick={downloadPDF}
                  disabled={loadingPDF}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="text-red-500">PDF</span> {loadingPDF ? "Generating..." : "Download"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* COMPLAINT LIFECYCLE */}
        <div className="mb-0">
          <ComplaintLifecycle
            complaint={complaint}
            warehouseAssessment={assessment}
            qcAssessment={qcAssessment}
          />
        </div>

        {/* HEADER */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-orange-500 pb-1 inline-block">
            Complaint Details
          </h2>
        </div>

        {/* DETAILS - Refactored to 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 bg-gray-50/50 p-4 rounded-lg border">
          {Object.entries({
            "Complaint ID": complaint.complaint_code,
            "Type": complaint.complaint_type,
            "Category": complaint.category,
            "Facility": complaint.facility_name,
            "Facility Address": complaint.facility_address || "—",
            "Item": complaint.item_name,
            "Item Code": complaint.item_code,
            "Batch No": complaint.batch_no,
            "Warehouse Batch": (() => {
              const warehouseNames = {
                "WH-001": "Ambikapur Warehouse",
                "WH-002": "Dantewada Warehouse"
              };
              return warehouseNames[complaint.warehouse_code] || complaint.warehouse_code || "—";
            })(),
            "Firm Name": complaint.firm_name || "—",
            "Mfg Date": complaint.mfg_date ? new Date(complaint.mfg_date).toLocaleDateString() : "—",
            "Exp Date": complaint.exp_date ? new Date(complaint.exp_date).toLocaleDateString() : "—",
            "Purchase Date": complaint.purchase_date ? new Date(complaint.purchase_date).toLocaleDateString() : "—",
            "Quantity Received": complaint.quantity_received || "—",
            "Affected Quantity": complaint.affected_quantity || "—",
            "Status": complaint.status,
            "Created On": createdAtFormatted,
            "Description": complaint.description || "—",
            ...(rejectedAtFormatted && { "Rejected On": rejectedAtFormatted }),
            ...(resolvedAtFormatted && { "Resolved On": resolvedAtFormatted }),
          }).map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-gray-200 py-2 text-sm">
              <span className="font-semibold text-gray-500 uppercase text-[10px] tracking-wider">{k}</span>
              <span className="text-gray-800 font-medium text-right ml-2">{v}</span>
            </div>
          ))}
        </div>

        {/* DOCUMENTS SECTION (Unified Header, Split Layout) */}
        {(complaint.documents?.length > 0 || complaint.opd_slip) && (
          <div className="mt-8 border-t pt-6">
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
                      const name = getFileName(doc);
                      const path = getFilePath(doc);
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
                                className="text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 w-full justify-center"
                                title="Download"
                              >
                                <FaDownload size={12} />
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
                  <div className="group border-2 border-indigo-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-indigo-50 flex flex-col">
                    <div
                      onClick={() => setPreviewFile({ name: "OPD Slip.pdf", url: `http://localhost:5000/uploads/${complaint.opd_slip}` })}
                      className="aspect-square bg-indigo-100 flex items-center justify-center overflow-hidden relative cursor-pointer"
                    >
                      <div className="w-full h-full p-2 group-hover:scale-110 transition duration-500">
                        <div className="w-full h-full bg-white border border-indigo-200 rounded-lg shadow-sm overflow-hidden relative">
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
                    <div className="p-3 text-center border-t border-indigo-100 bg-indigo-50">
                      <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-2">OPD Slip.pdf</p>
                      <div className="flex justify-center">
                        <a
                          href={`http://localhost:5000/api/grievance/complaint-user/download/${complaint.opd_slip}`}
                          className="text-indigo-600 hover:text-indigo-800 transition flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white py-1.5 px-3 rounded-lg border border-indigo-100 w-full"
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



        {/* ================= WAREHOUSE ASSESSMENT DISPLAY ================= */}
        {assessment && (
          <div className="mt-8">
            {/* HEADER */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-orange-500 pb-1 inline-block">
                Warehouse Assessment Details
              </h2>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 bg-gray-50/50 p-4 rounded-lg border">
              {[
                // ["Assessment Type", assessment.assessment_type],
                // ["Item Code", assessment.item_code],
                ["Batch No", assessment.batch_no],
                ["Tender No", assessment.tender_no],
                ["PO No", assessment.po_no],
                ["Stock (WH)", assessment.stock_warehouse],
                ["Stock (Facility)", assessment.stock_facility],
                ["Total Stock", assessment.total_stock],
                ["Same Complaint Present", assessment.same_complaint_present === 'YES' ? 'Yes' : 'No'],
                ...(assessment.adr_severity ? [["ADR Severity", assessment.adr_severity]] : []),
                ...((assessment.quality_description || assessment.remarks) ? [["Assessment Remarks", assessment.quality_description || assessment.remarks]] : []),
                ...((complaint.resolution_remark || complaint.dispatch_remark) ? [["Final Outcome Remark", complaint.resolution_remark || complaint.dispatch_remark]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-gray-200 py-2 text-sm">
                  <span className="font-semibold text-gray-500 uppercase text-[10px] tracking-wider">{label}</span>
                  <span className="text-gray-800 font-medium text-right ml-2">{value || "—"}</span>
                </div>
              ))}
            </div>

            {/* ASSESSMENT DOCUMENTS GRID (PREMIUM STYLE) - Separated from grid for better layout */}
            {assessment.documents?.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-indigo-100 p-2 rounded-full"><FaFileAlt className="text-indigo-600 text-sm" /></span>
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
                            className="text-indigo-600 hover:text-indigo-800 transition flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest bg-indigo-50 py-1.5 rounded-lg border border-indigo-100"
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
        )}

        {/* REJECTED STATE DISPLAY */}
        {complaint.status === "REJECTED_WH" && !assessment && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4 mb-8">
            <div className="bg-red-500 p-2 rounded-lg text-white shrink-0">
              <FaExclamationTriangle size={20} />
            </div>
            <div>
              <h4 className="text-red-800 font-bold text-lg mb-1">Complaint Rejected</h4>
              <p className="text-red-700 text-sm mb-3">This complaint has been rejected by the warehouse team and no further processing is required.</p>
              {complaint.resolution_remark && (
                <div className="bg-white/50 p-3 rounded-lg border border-red-100">
                  <span className="text-[10px] font-bold text-red-400 uppercase block mb-1 tracking-widest">Rejection Remark</span>
                  <p className="text-sm font-medium text-red-900 italic">"{complaint.resolution_remark}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= WAREHOUSE ACTION CENTER ================= */}
        {((complaint.status === "SAMPLE_DISPATCHED_FACILITY") ||
          (complaint.status === "SAMPLE_RECEIVED_WH") ||
          (complaint.status === "IN_PROGRESS_WH") ||
          (complaint.status === "SUBMITTED_WH") ||
          (complaint.status === "SUBMITTED" && isWarehouseComplaint)) && (
            <div className="mt-8 pt-8 border-t-2 border-indigo-500">
              <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                <div className="bg-indigo-600 px-6 py-3 flex items-center justify-between">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <FaWarehouse /> Action Center
                  </h3>
                  <span className="text-indigo-100 text-[10px] font-bold bg-indigo-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest border border-indigo-400/30">
                    Stage: {complaint.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="p-6">
                  {/* STEP 1: RECEIVE SAMPLE */}
                  {complaint.status === "SAMPLE_DISPATCHED_FACILITY" && (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-4">
                        <FaBoxOpen size={30} />
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg mb-2">Pending Sample Receipt</h4>
                      <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">The facility has dispatched the physical sample. Please confirm when the sample is received at warehouse to begin verification.</p>
                      <button
                        onClick={handleReceiveSample}
                        disabled={submitting}
                        className="bg-green-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-green-200 disabled:opacity-50"
                      >
                        {submitting ? "Processing..." : "Confirm Sample Receipt"}
                      </button>
                    </div>
                  )}

                  {/* STEP 2: APPROVE / REJECT */}
                  {complaint.status === "SAMPLE_RECEIVED_WH" && (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-4">
                        <FaHeartbeat size={30} />
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg mb-2">Initial Verification Required</h4>
                      <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Sample is received. Please review the documentation and approve for detailed assessment or reject if the complaint is invalid.</p>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={handleApprove}
                          disabled={submitting}
                          className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200 disabled:opacity-50"
                        >
                          {submitting ? "Processing..." : "Approve for Assessment"}
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={submitting}
                          className="bg-red-500 text-white px-10 py-3 rounded-xl font-bold hover:bg-red-600 transition shadow-lg hover:shadow-red-200 disabled:opacity-50"
                        >
                          {submitting ? "Processing..." : "Reject Complaint"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: ASSESSMENT FORM (If Approved but not assessed) */}
                  {complaint.status === "IN_PROGRESS_WH" && !assessment && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b pb-3">
                        <FaExclamationTriangle className="text-orange-500" />
                        <h4 className="font-bold text-gray-800 tracking-tight">Perform {complaint.complaint_type} Assessment</h4>
                      </div>

                      {complaint.complaint_type === "PHYSICAL" ? (
                        /* PHYSICAL ASSESSMENT FORM (FROM IMAGE) */
                        <div className="space-y-6">
                          <h4 className="text-gray-700 font-bold border-l-4 border-orange-500 pl-3">Warehouse Assessment Form – Physical Damage</h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Tender No. (Auto-filled)</label>
                              <input
                                value={tenderNo}
                                readOnly
                                className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg text-gray-600 text-sm font-medium"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">PO No. (Auto-filled)</label>
                              <input
                                value={poNo}
                                readOnly
                                className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg text-gray-600 text-sm font-medium"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Physical Stock at Warehouse</label>
                              <input
                                type="number"
                                value={stockWarehouse}
                                readOnly
                                className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg text-gray-600 text-sm font-medium"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Physical Stock at Complaint Facility</label>
                              <input
                                type="number"
                                value={stockFacility}
                                readOnly
                                className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg text-gray-600 text-sm font-medium"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Total Stock Intended at Facility</label>
                              <input
                                type="number"
                                value={totalStock}
                                readOnly
                                className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg text-gray-600 text-sm font-bold"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Check if same complaint is present at warehouse *</label>
                            <select
                              value={sameComplaint}
                              onChange={(e) => setSameComplaint(e.target.value)}
                              className="w-full border-2 border-gray-100 px-4 py-2.5 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition outline-none text-sm font-medium"
                            >
                              <option value="">Select...</option>
                              <option value="YES">Yes</option>
                              <option value="NO">No</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* AUTO-FILLED FIELDS */}
                          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-2">
                            <div>
                              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Tender No. (Auto)</label>
                              <input disabled value={tenderNo} className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-gray-600 text-sm font-medium" />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">PO No. (Auto)</label>
                              <input disabled value={poNo} className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-gray-600 text-sm font-medium" />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Stock @ Warehouse</label>
                              <input disabled value="100" className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-gray-600 text-sm font-medium" />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Stock @ Facility</label>
                              <input disabled value="100" className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-gray-600 text-sm font-medium" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Stock</label>
                              <input disabled value="200" className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-gray-600 text-sm font-medium" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Same complaint present at warehouse? *</label>
                              <select
                                value={sameComplaint}
                                onChange={(e) => setSameComplaint(e.target.value)}
                                className="w-full border-2 border-gray-100 px-3 py-2.5 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition outline-none text-sm font-medium"
                              >
                                <option value="">Select...</option>
                                <option value="YES">Yes</option>
                                <option value="NO">No</option>
                              </select>
                            </div>

                            {complaint.complaint_type === "ADR" && (
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Severity of Adverse Reaction *</label>
                                <select
                                  value={adrSeverity}
                                  onChange={(e) => setAdrSeverity(e.target.value)}
                                  className="w-full border-2 border-gray-100 px-3 py-2.5 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition outline-none text-sm font-medium"
                                >
                                  <option value="">Select...</option>
                                  <option value="MILD">Mild</option>
                                  <option value="MODERATE">Moderate</option>
                                  <option value="SEVERE">Severe</option>
                                </select>
                              </div>
                            )}
                          </div>

                          {complaint.complaint_type === "ADR" && (
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Detailed Assessment Remarks *</label>
                              <textarea
                                rows="3"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full border-2 border-gray-100 px-3 py-2.5 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition outline-none text-sm font-medium"
                                placeholder="Provide details of the clinical assessment..."
                              />
                            </div>
                          )}

                          {complaint.complaint_type === "QUALITY" && (
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Quality Issue Description *</label>
                              <textarea
                                rows="3"
                                value={qualityDescription}
                                onChange={(e) => setQualityDescription(e.target.value)}
                                className="w-full border-2 border-gray-100 px-3 py-2.5 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition outline-none text-sm font-medium"
                                placeholder="Describe the physical/chemical quality issues observed..."
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Attachment Management */}
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <label className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest block mb-2">Supporting Evidence (Max 5)</label>
                        <div className="flex items-center gap-4 flex-wrap">
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer shadow-sm shadow-indigo-100"
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                          />
                          {files.length > 0 && (
                            <div className="flex gap-2">
                              {files.map((f, i) => (
                                <div key={i} className="bg-white px-2 py-1 rounded-md text-[9px] font-bold border border-indigo-200 text-indigo-600 shadow-sm flex items-center gap-1">
                                  <FaBoxOpen size={10} /> {f.name.length > 12 ? f.name.substring(0, 12) + '...' : f.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          onClick={handleAssessmentSubmit}
                          disabled={submitting}
                          className="bg-indigo-600 text-white px-12 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200 disabled:opacity-50"
                        >
                          {submitting ? (complaint.complaint_type === "PHYSICAL" ? "Processing..." : "Submitting...") : (complaint.complaint_type === "PHYSICAL" ? "Proceed" : "Submit Formal Assessment")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: FINAL DECISION (If assessed but not closed) */}
                  {((complaint.status === "IN_PROGRESS_WH" && assessment) || (complaint.status === "SUBMITTED_WH") || (complaint.status === "SUBMITTED" && isWarehouseComplaint)) && (
                    <div className="space-y-6 bg-orange-50/30 p-6 rounded-xl border border-orange-100">
                      <div className="flex items-center gap-2 border-b border-orange-100 pb-3">
                        <FaWarehouse className="text-orange-600" />
                        <h4 className="font-bold text-orange-900 tracking-tight text-lg">
                          {complaint.complaint_type === "PHYSICAL" ? "Resolve Complaint or Escalate to QC" : "Dispatch Sample to QC Lab"}
                        </h4>
                      </div>

                      {complaint.complaint_type === "PHYSICAL" ? (
                        <div className="space-y-4">
                          <p className="text-orange-800 text-sm font-medium">This is a physical complaint. You can resolve it directly by providing final remarks.</p>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-orange-600 uppercase tracking-widest block">Final Resolution Remarks *</label>
                            <textarea
                              rows="3"
                              value={resolutionRemark}
                              onChange={(e) => setResolutionRemark(e.target.value)}
                              className="w-full border-2 border-orange-200 px-3 py-2.5 rounded-xl bg-white focus:ring-4 focus:ring-orange-100 transition outline-none text-sm font-medium"
                              placeholder="Describe how the complaint was resolved..."
                            />
                          </div>
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={handleResolve}
                              disabled={submitting}
                              className="bg-green-600 text-white px-12 py-3.5 rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-green-100 disabled:opacity-50"
                            >
                              {submitting ? "Processing..." : "Finalize & Resolve"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-orange-800 text-sm font-medium">ADR/Quality complaints require laboratory testing. Dispatch the sample to QC for technical analysis.</p>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-orange-600 uppercase tracking-widest block">Remarks for QC Lab *</label>
                            <textarea
                              rows="3"
                              value={dispatchRemark}
                              onChange={(e) => setDispatchRemark(e.target.value)}
                              className="w-full border-2 border-orange-200 px-3 py-2.5 rounded-xl bg-white focus:ring-4 focus:ring-orange-100 transition outline-none text-sm font-medium"
                              placeholder="Instructions or observations for the QC team..."
                            />
                          </div>
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={handleDispatch}
                              disabled={submitting}
                              className="bg-orange-600 text-white px-12 py-3.5 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg hover:shadow-orange-200 disabled:opacity-50"
                            >
                              {submitting ? "Processing..." : "Dispatch to QC Lab"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        {/* ================= PREVIEW MODAL ================= */}
        {previewFile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="font-bold text-gray-800 truncate pr-4">{previewFile.name}</h4>
                <div className="flex items-center gap-2">
                  <a
                    href={previewFile.url.replace("/uploads/", "/api/grievance/complaint-user/download/")}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition text-sm font-medium"
                    title="Download"
                  >
                    <FaDownload size={14} />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full transition"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center">
                {isImage(previewFile.name) ? (
                  <img
                    src={previewFile.url}
                    className="max-h-full max-w-full object-contain shadow-sm"
                    alt="preview"
                  />
                ) : (isPDF(previewFile.name, previewFile.url) || isText(previewFile.name)) ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-[70vh] rounded border shadow-sm"
                    title="preview"
                  />
                ) : (
                  <div className="p-10 text-center">
                    <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Preview not available for this file type.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="h-20" /> {/* Spacer */}
    </div>
  );
}

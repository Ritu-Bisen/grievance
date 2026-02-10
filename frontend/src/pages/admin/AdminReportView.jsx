import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import ComplaintTopSection from "../../components/ComplaintTopSection";
import {
  FaClipboardList,
  FaWarehouse,
  FaFlask,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaUserCheck,
  FaFileAlt,
  FaArrowLeft
} from "react-icons/fa";

export default function AdminReportView() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [warehouseAssessment, setWarehouseAssessment] = useState(null);
  const [qcAssessment, setQcAssessment] = useState(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  /* 🔍 PREVIEW STATE */
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    api
      .get(`/grievance/admin/report/view/${code}`)
      .then((res) => {
        setComplaint(res.data.complaint);
        setWarehouseAssessment(res.data.warehouseAssessment);
        setQcAssessment(res.data.qcAssessment);
      })
      .catch(() => alert("Failed to load report"));
  }, [code]);

  if (!complaint) return null;

  /* ================= FILE HELPERS ================= */
  const isImage = (name) => /\.(jpg|jpeg|png|webp)$/i.test(name);
  const isPDF = (name) => /\.pdf$/i.test(name);

  /* ================= CSV DOWNLOAD ================= */
  const downloadCSV = () => {
    setShowDownloadMenu(false);
    const rows = [
      ["SECTION", "FIELD", "VALUE"],

      ["COMPLAINT", "Complaint Code", complaint.complaint_code],
      ["COMPLAINT", "Type", complaint.complaint_type],
      ["COMPLAINT", "Category", complaint.category],
      ["COMPLAINT", "Status", complaint.status],
      ["COMPLAINT", "Facility", complaint.facility_name],
      ["COMPLAINT", "Item Name", complaint.item_name],
      ["COMPLAINT", "Item Code", complaint.item_code],
      ["COMPLAINT", "Batch No", complaint.batch_no],
      ["COMPLAINT", "Warehouse Code", complaint.warehouse_code],
    ];

    if (complaint.created_at) {
      rows.push([
        "COMPLAINT",
        "Created On",
        new Date(complaint.created_at).toLocaleString()
      ]);
    }

    if (complaint.resolved_at) {
      rows.push([
        "COMPLAINT",
        "Resolved On",
        new Date(complaint.resolved_at).toLocaleString()
      ]);
    }

    if (complaint.rejected_at) {
      rows.push([
        "COMPLAINT",
        "Rejected On",
        new Date(complaint.rejected_at).toLocaleString()
      ]);
    }

    if (warehouseAssessment) {
      rows.push(
        ["WAREHOUSE", "Assessment Type", warehouseAssessment.assessment_type],
        ["WAREHOUSE", "Item Code", warehouseAssessment.item_code],
        ["WAREHOUSE", "Batch No", warehouseAssessment.batch_no],
        ["WAREHOUSE", "Tender No", warehouseAssessment.tender_no],
        ["WAREHOUSE", "PO No", warehouseAssessment.po_no],
        ["WAREHOUSE", "Stock (Warehouse)", warehouseAssessment.stock_warehouse],
        ["WAREHOUSE", "Stock (Facility)", warehouseAssessment.stock_facility],
        ["WAREHOUSE", "Total Stock", warehouseAssessment.total_stock]
      );
    }

    if (qcAssessment) {
      rows.push(
        ["QC", "Status", qcAssessment.status],
        ["QC", "Result", qcAssessment.result]
      );
    }

    const csvContent = rows
      .map(r =>
        r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin_report_${complaint.complaint_code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================= PDF DOWNLOAD ================= */
  const downloadPDF = async () => {
    setShowDownloadMenu(false);
    const doc = new jsPDF();

    // Helper to load image
    const getDataUrl = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          try {
            resolve(canvas.toDataURL('image/jpeg'));
          } catch (e) {
            resolve(null); // Handle tainted canvas
          }
        };
        img.onerror = () => resolve(null); // Resolve null on error to continue
        img.src = url;
      });
    };

    // Helper to add image to PDF with auto-scaling and paging
    let currentY = 0; // Will be set after tables

    const addImageToPdf = async (url, label) => {
      try {
        const base64 = await getDataUrl(url);
        if (!base64) return;

        const imgProps = doc.getImageProperties(base64);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const maxWidth = pdfWidth - (margin * 2);
        // Max height for image on a page (accounting for label and margin)
        const maxHeight = pdfHeight - (margin * 2) - 20;

        // Calculate dimensions
        let imgWidth = imgProps.width;
        let imgHeight = imgProps.height;
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1); // scale down if needed, don't scale up aggressively

        imgWidth *= ratio;
        imgHeight *= ratio;

        // Check if we need a new page
        if (currentY + imgHeight + 20 > pdfHeight - margin) {
          doc.addPage();
          currentY = 20;
        }

        // Add Label
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(label, margin, currentY);
        currentY += 5;

        // Add Image
        doc.addImage(base64, 'JPEG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15; // Space after image

      } catch (err) {
        console.error("Error adding image to PDF:", err);
      }
    };

    // Title
    doc.setFontSize(18);
    doc.text(`Complaint Report: ${complaint.complaint_code}`, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Complaint Details Table
    const complaintData = [
      ["Type", complaint.complaint_type],
      ["Category", complaint.category],
      ["Status", complaint.status],
      ["Facility", complaint.facility_name],
      ["Item Name", complaint.item_name],
      ["Item Code", complaint.item_code],
      ["Batch No", complaint.batch_no],
      ["Warehouse Code", complaint.warehouse_code],
      ["Created On", new Date(complaint.created_at).toLocaleString()],
    ];

    if (complaint.resolved_at) {
      complaintData.push(["Resolved On", new Date(complaint.resolved_at).toLocaleString()]);
    }
    if (complaint.rejected_at) {
      complaintData.push(["Rejected On", new Date(complaint.rejected_at).toLocaleString()]);
    }

    autoTable(doc, {
      startY: 40,
      head: [['Field', 'Value']],
      body: complaintData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Indigo
      styles: { fontSize: 10 },
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // Warehouse Assessment Table
    if (warehouseAssessment) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Warehouse Assessment", 14, currentY);

      const warehouseData = [
        ["Assessment Type", warehouseAssessment.assessment_type],
        ["Item Code", warehouseAssessment.item_code],
        ["Batch No", warehouseAssessment.batch_no],
        ["Tender No", warehouseAssessment.tender_no],
        ["PO No", warehouseAssessment.po_no],
        ["Stock (Warehouse)", warehouseAssessment.stock_warehouse],
        ["Stock (Facility)", warehouseAssessment.stock_facility],
        ["Total Stock", warehouseAssessment.total_stock],
      ];

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Field', 'Value']],
        body: warehouseData,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74] }, // Green
        styles: { fontSize: 10 },
      });

      currentY = doc.lastAutoTable.finalY + 15;

      // Warehouse Images
      if (warehouseAssessment.documents && warehouseAssessment.documents.length > 0) {
        // Add a header for images if there are any
        if (currentY + 20 > doc.internal.pageSize.getHeight()) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFontSize(12);
        doc.setTextColor(50);
        doc.text("Attached Documents (Warehouse)", 14, currentY);
        currentY += 10;

        for (let i = 0; i < warehouseAssessment.documents.length; i++) {
          const docItem = warehouseAssessment.documents[i];
          const name = typeof docItem === "string" ? docItem : (docItem.original_name || docItem.file_name);
          const path = typeof docItem === "string" ? docItem : docItem.file_name;

          if (isImage(name)) {
            const fullUrl = `http://localhost:5000/uploads/assessment/${path}`;
            await addImageToPdf(fullUrl, `Document: ${name}`);
          }
        }
      }
    }

    // QC Assessment Table
    if (qcAssessment) {
      // Check page break before QC section
      if (currentY + 40 > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("QC Assessment", 14, currentY);

      const qcData = [
        ["Status", qcAssessment.status],
        ["Result", qcAssessment.result || "N/A"],
        ["Resolution Date", qcAssessment.complaint_close_date ? new Date(qcAssessment.complaint_close_date).toLocaleString() : "N/A"],
        ["Remarks", qcAssessment.remarks || "N/A"]
      ];

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Field', 'Value']],
        body: qcData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }, // Blue
        styles: { fontSize: 10 },
      });

      currentY = doc.lastAutoTable.finalY + 15;

      // QC Image
      if (qcAssessment.document && isImage(qcAssessment.document)) {
        // Check page break
        if (currentY + 20 > doc.internal.pageSize.getHeight()) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFontSize(12);
        doc.setTextColor(50);
        doc.text("Resolution Document (QC)", 14, currentY);
        currentY += 10;

        const fullUrl = `http://localhost:5000/uploads/assessment/${qcAssessment.document}`;
        await addImageToPdf(fullUrl, "QC Resolution Attachment");
      }
    }

    doc.save(`admin_report_${complaint.complaint_code}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <GovHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors mb-2"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        {/* ================= REPORT HEADER ================= */}
        <div className="bg-white rounded-xl shadow border-l-8 border-indigo-600 p-6 flex justify-between items-center relative">
          <div className="flex items-center gap-4">
            <FaClipboardList className="text-indigo-600 text-3xl" />
            <div>
              <h2 className="text-xl font-bold">Admin Complaint Report</h2>
              <p className="text-sm text-gray-500">
                End-to-end lifecycle report
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <FaDownload /> Download
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={downloadCSV}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                >
                  <span className="text-green-600 font-black">CSV</span> Export Data
                </button>
                <div className="h-px bg-gray-100 mx-2"></div>
                <button
                  onClick={downloadPDF}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                >
                  <span className="text-red-500 font-black">PDF</span> Export Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= COMPLAINT ================= */}
        <ComplaintTopSection complaint={complaint} />

        {/* ================= RESOLVED INFO ================= */}
        {complaint.resolved_at && (
          <div className="bg-green-50 border border-green-300 rounded p-4 text-sm">
            <b>Complaint Resolved On:</b>{" "}
            {new Date(complaint.resolved_at).toLocaleString()}
          </div>
        )}

        {/* ================= REJECTED INFO (NEW) ================= */}
        {complaint.rejected_at && (
          <div className="bg-red-50 border border-red-300 rounded p-4 text-sm">
            <b>Complaint Rejected On:</b>{" "}
            {new Date(complaint.rejected_at).toLocaleString()}
            <p className="mt-1 text-red-700">
              This complaint was found <b>invalid</b> during warehouse review.
            </p>
          </div>
        )}

        {/* ================= WAREHOUSE SECTION ================= */}
        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-green-600">
          <div className="flex items-center gap-3 mb-4">
            <FaWarehouse className="text-green-700 text-2xl" />
            <h3 className="text-lg font-semibold">Warehouse Assessment</h3>
          </div>

          {warehouseAssessment ? (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div><b>Assessment Type:</b> {warehouseAssessment.assessment_type}</div>
                <div><b>Item Code:</b> {warehouseAssessment.item_code}</div>
                <div><b>Batch No:</b> {warehouseAssessment.batch_no}</div>
                <div><b>Tender No:</b> {warehouseAssessment.tender_no}</div>
                <div><b>PO No:</b> {warehouseAssessment.po_no}</div>
                <div><b>Stock (Warehouse):</b> {warehouseAssessment.stock_warehouse}</div>
                <div><b>Stock (Facility):</b> {warehouseAssessment.stock_facility}</div>
                <div><b>Total Stock:</b> {warehouseAssessment.total_stock}</div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Assessment Documents</h4>

                {warehouseAssessment.documents?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {warehouseAssessment.documents.map((doc, i) => {
                      const name = typeof doc === "string" ? doc : (doc.original_name || doc.file_name || `Doc ${i + 1}`);
                      const path = typeof doc === "string" ? doc : doc.file_name;
                      const fullUrl = `http://localhost:5000/uploads/assessment/${path}`;
                      const isImg = isImage(name);
                      const isPdf = isPDF(name);

                      return (
                        <div
                          key={`admin-wh-doc-${i}`}
                          className="group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col"
                        >
                          <div
                            onClick={() => setPreviewFile({ name, url: fullUrl })}
                            className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden relative cursor-pointer"
                          >
                            {isImg ? (
                              <img src={fullUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="thumb" />
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <FaFileAlt className={`text-4xl ${isPdf ? 'text-red-400' : 'text-gray-400'}`} />
                                {isPdf && <span className="text-[10px] font-bold text-red-700">PDF</span>}
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[9px] font-bold py-1 translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-center gap-1 backdrop-blur-sm">
                              <FaEye size={10} /> TAP TO PREVIEW
                            </div>
                          </div>
                          <div className="p-2 text-center border-t bg-white">
                            <p className="text-[10px] font-medium text-gray-700 truncate mb-1" title={name}>{name}</p>
                            <a
                              href={`http://localhost:5000/api/grievance/warehouse/assessment/download/${path}`}
                              className="text-green-600 hover:text-green-800 transition flex items-center justify-center gap-1 text-[9px] font-bold"
                            >
                              <FaDownload size={10} />
                              DOWNLOAD
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No warehouse documents uploaded
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Warehouse assessment not available</p>
          )}
        </div>

        {/* ================= QC SECTION ================= */}
        {(complaint.complaint_type === "ADR" ||
          complaint.complaint_type === "QUALITY") && (
            <div className="bg-white rounded-xl shadow p-6 border-t-4 border-blue-600">
              <div className="flex items-center gap-3 mb-4">
                <FaFlask className="text-blue-700 text-2xl" />
                <h3 className="text-lg font-semibold">QC Assessment</h3>
              </div>

              {qcAssessment ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Status</p>
                      <p className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                        <FaCheckCircle className="text-green-500" />
                        {qcAssessment.status}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Resolution Date</p>
                      <p className="font-bold text-gray-800 text-sm">
                        {qcAssessment.complaint_close_date ? new Date(qcAssessment.complaint_close_date).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {qcAssessment.remarks && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Final Closing Remarks</p>
                      <p className="text-sm text-gray-700 italic">"{qcAssessment.remarks}"</p>
                    </div>
                  )}

                  {/* QC Resolution Document */}
                  {qcAssessment.document && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FaFileAlt />
                        Resolution Document
                      </p>
                      <div className="w-40">
                        <div className="group border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col">
                          <div
                            onClick={() => setPreviewFile({ name: "Resolution Document", url: `http://localhost:5000/uploads/assessment/${qcAssessment.document}` })}
                            className="aspect-square bg-blue-50 flex items-center justify-center overflow-hidden relative cursor-pointer"
                          >
                            <img
                              src={`http://localhost:5000/uploads/assessment/${qcAssessment.document}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                              alt="Resolution Doc"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[8px] font-bold py-1 translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-center gap-1 backdrop-blur-sm">
                              <FaEye size={8} /> TAP TO PREVIEW
                            </div>
                          </div>
                          <div className="p-2 text-center border-t border-gray-100">
                            <a
                              href={`http://localhost:5000/api/grievance/warehouse/assessment/download/${qcAssessment.document}`}
                              className="text-blue-600 hover:text-blue-800 transition flex items-center justify-center gap-1 text-[9px] font-bold"
                            >
                              <FaDownload size={10} />
                              DOWNLOAD
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <FaFlask className="mx-auto text-gray-300 text-4xl mb-3" />
                  <p className="text-gray-500 font-medium">QC assessment pending / not submitted yet</p>
                </div>
              )}
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

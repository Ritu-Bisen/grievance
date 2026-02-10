import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import ComplaintLifecycle from "../../components/ComplaintLifecycle";
import { FaEye, FaDownload, FaFileAlt, FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ComplaintView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [warehouseAssessment, setWarehouseAssessment] = useState(null);
  const [qcAssessment, setQcAssessment] = useState(null);

  /* ---------- PREVIEW STATE ---------- */
  const [previewFile, setPreviewFile] = useState(null);
  const [loadingDispatch, setLoadingDispatch] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const handleDispatch = async () => {
    try {
      setLoadingDispatch(true);
      await api.post("/grievance/complaint-user/dispatch-facility", {
        complaint_code: code,
      });
      // Refresh data
      const res = await api.get(`/grievance/complaint-user/view/${code}`);
      setComplaint(res.data);
      setWarehouseAssessment(res.data.warehouseAssessment);
      setQcAssessment(res.data.qcAssessment);
    } catch (err) {
      alert("Failed to dispatch sample");
    } finally {
      setLoadingDispatch(false);
    }
  };

  useEffect(() => {
    api
      .get(`/grievance/complaint-user/view/${code}`)
      .then((res) => {
        setComplaint(res.data);
        setWarehouseAssessment(res.data.warehouseAssessment);
        setQcAssessment(res.data.qcAssessment);
      })
      .catch(() => alert("Failed to load complaint"));
  }, [code]);

  if (!complaint) return null;

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
    return doc.file_name;
  };

  const isImage = (name) => /\.(jpg|jpeg|png|webp)$/i.test(name);
  const isPDF = (name, url = "") => /\.pdf$/i.test(name) || (url && /\.pdf($|\?|#)/i.test(url));
  const isText = (name) => /\.(txt|csv)$/i.test(name);
  const isDoc = (name) => /\.(doc|docx)$/i.test(name);

  // Helper to convert Image URL to Base64 for jsPDF using fetch (more robust for absolute URLs)
  const imageUrlToBase64 = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
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

  /* ---------- PDF DOWNLOAD ---------- */
  const downloadPDF = async () => {
    try {
      setLoadingPDF(true);
      console.log("Starting PDF generation...");

      const doc = new jsPDF();

      // BRANDING & HEADER
      doc.setFillColor(234, 88, 12); // orange-600
      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("Grievance Management System", 105, 18, { align: "center" });

      doc.setFontSize(12);
      doc.text("Complaint Details Report", 105, 28, { align: "center" });

      // BODY CONTENT
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

      // SPLIT FIELDS INTO TWO COLUMNS (HALF & HALF)
      const allFields = [
        ["Complaint ID", complaint.complaint_code],
        ["Complaint Type", complaint.complaint_type],
        ["Category", complaint.category],
        ["Facility Name", complaint.facility_name],
        ["Facility Address", complaint.facility_address || "—"],
        ["Item Name", complaint.item_name],
        ["Item Code", complaint.item_code],
        ["Batch Number", complaint.batch_no],
        ["Warehouse Batch", complaint.warehouse_code || "—"],
        ["Mfg Date", complaint.mfg_date ? new Date(complaint.mfg_date).toLocaleDateString() : "—"],
        ["Exp Date", complaint.exp_date ? new Date(complaint.exp_date).toLocaleDateString() : "—"],
        ["Purchase Date", complaint.purchase_date ? new Date(complaint.purchase_date).toLocaleDateString() : "—"],
        ["Quantity Received", complaint.quantity_received || "—"],
        ["Affected Quantity", complaint.affected_quantity || "—"],
        ["Created On", createdAtFormatted],
        ["OPD Slip", complaint.opd_slip ? "View/Download" : "—"],
      ];

      if (rejectedAtFormatted) allFields.push(["Rejected On", rejectedAtFormatted]);
      if (resolvedAtFormatted) allFields.push(["Resolved On", resolvedAtFormatted]);

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

      // IMAGES SECTION (Embed in the report in a grid)
      const images = complaint.documents?.filter(doc => isImage(getFileName(doc))) || [];
      if (images.length > 0) {
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
            const path = getFilePath(imgDoc);
            const fullUrl = `http://localhost:5000/uploads/${path}`;
            const base64 = await imageUrlToBase64(fullUrl);

            doc.addImage(base64, "JPEG", xPos, yPos, imgWidth, imgHeight);
            doc.setFontSize(7);
            const truncatedName = getFileName(imgDoc).length > 25 ? getFileName(imgDoc).substring(0, 22) + "..." : getFileName(imgDoc);
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

      // (Removed separate PDF page as per request)


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
      console.log("PDF generated successfully.");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-5xl mx-auto bg-white p-6 mt-6 border rounded">
        {/* BACK BUTTON */}
        {/* TOP BUTTONS */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/facility/dashboard")}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={downloadPDF}
            disabled={loadingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loadingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FaDownload />
                <span>Download Details (PDF)</span>
              </>
            )}
          </button>
        </div>

        {/* COMPLAINT LIFECYCLE */}
        <ComplaintLifecycle
          complaint={complaint}
          warehouseAssessment={warehouseAssessment}
          qcAssessment={qcAssessment}
        />

        {/* HEADER */}
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
            "Warehouse Batch": complaint.warehouse_code,
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {complaint.documents.map((doc, index) => {
                      const name = getFileName(doc);
                      const path = getFilePath(doc);
                      const fullUrl = `http://localhost:5000/uploads/${path}`;
                      const isImg = isImage(name);
                      const isPdf = isPDF(name);

                      return (
                        <div
                          key={`doc-${index}`}
                          className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col"
                        >
                          <div
                            onClick={() => setPreviewFile({ name, url: fullUrl })}
                            className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden relative cursor-pointer"
                          >
                            {isImg ? (
                              <img src={fullUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="thumb" />
                            ) : isPdf ? (
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-12 h-16 bg-red-100 border border-red-200 rounded relative flex items-center justify-center shadow-sm">
                                  <span className="text-[10px] font-bold text-red-700 bg-white px-1 rounded shadow-sm">PDF</span>
                                </div>
                              </div>
                            ) : (
                              <FaFileAlt className="text-4xl text-gray-400" />
                            )}
                          </div>
                          <div className="p-2 text-center border-t bg-white">
                            <p className="text-[11px] font-medium text-gray-700 truncate mb-1" title={name}>{name}</p>
                            <div className="flex justify-center">
                              <a
                                href={`http://localhost:5000/api/grievance/complaint-user/download/${path}`}
                                className="text-green-600 hover:text-green-800 transition flex items-center gap-1 text-[10px] font-bold"
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
                  <div className="group border-2 border-blue-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-blue-50 flex flex-col">
                    <div
                      onClick={() => setPreviewFile({ name: "OPD Slip.pdf", url: `http://localhost:5000/uploads/${complaint.opd_slip}` })}
                      className="aspect-square bg-blue-100 flex items-center justify-center overflow-hidden relative cursor-pointer"
                    >
                      <div className="w-full h-full p-2">
                        <div className="w-full h-full bg-white border border-blue-200 rounded shadow-sm overflow-hidden relative group-hover:scale-105 transition duration-300">
                          <iframe
                            src={`http://localhost:5000/uploads/${complaint.opd_slip}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none"
                            title="OPD Slip Preview"
                          />
                          <div className="absolute top-1 right-1 bg-red-600 text-white text-[8px] px-1 rounded font-bold">PDF</div>
                          <div className="absolute inset-x-0 bottom-0 bg-blue-600/10 py-0.5 text-center">
                            <span className="text-[8px] font-bold text-blue-700">FRONT PAGE PREVIEW</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 text-center border-t border-blue-100 bg-blue-50/50">
                      <p className="text-[11px] font-bold text-blue-700">OPD Slip.pdf</p>
                      <div className="flex justify-center mt-1">
                        <a
                          href={`http://localhost:5000/api/grievance/complaint-user/download/${complaint.opd_slip}`}
                          className="text-green-600 hover:text-green-800 transition flex items-center gap-1 text-[10px] font-bold"
                        >
                          <FaDownload size={12} />
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

        {/* QC ASSESSMENT SECTION (IF RESOLVED OR REPORT RECEIVED) */}
        {qcAssessment && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-purple-100 p-2 rounded-full"><FaFileAlt className="text-purple-600 text-sm" /></span>
              Final QC Resolution
            </h3>
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest block mb-1">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${qcAssessment.status === 'Approve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {qcAssessment.status === 'Approve' ? 'RESOLUTION APPROVED' : 'RESOLUTION REJECTED'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest block mb-1">Closing Remarks</span>
                    <p className="text-sm text-gray-700 italic bg-white p-3 rounded-lg border border-purple-100 shadow-sm leading-relaxed">
                      "{qcAssessment.remarks || "No specific remarks provided."}"
                    </p>
                  </div>
                </div>

                {qcAssessment.document && (
                  <div>
                    <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest block mb-2">Resolution Document</span>
                    <div className="w-40">
                      <div className="group border-2 border-purple-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col">
                        <div
                          onClick={() => setPreviewFile({ name: "Resolution Document", url: `http://localhost:5000/uploads/assessment/${qcAssessment.document}` })}
                          className="aspect-square bg-purple-50 flex items-center justify-center overflow-hidden relative cursor-pointer"
                        >
                          <img
                            src={`http://localhost:5000/uploads/assessment/${qcAssessment.document}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            alt="Resolution"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[8px] font-bold py-1 translate-y-full group-hover:translate-y-0 transition duration-300 flex items-center justify-center gap-1 backdrop-blur-sm">
                            <FaEye size={8} /> TAP TO PREVIEW
                          </div>
                        </div>
                        <div className="p-2 text-center border-t border-purple-100">
                          <a
                            href={`http://localhost:5000/api/grievance/warehouse/assessment/download/${qcAssessment.document}`}
                            className="text-purple-600 hover:text-purple-800 transition flex items-center justify-center gap-1 text-[9px] font-bold"
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
            </div>
          </div>
        )}
        <div className="mt-8 border-t pt-6 bg-gradient-to-r from-orange-50 to-white p-6 rounded-xl border border-orange-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-orange-800 uppercase tracking-tight">Action Required</h3>
              <p className="text-sm text-gray-600">Please dispatch the physical sample to the warehouse for inspection.</p>
            </div>

            <div>
              {complaint.status === "SUBMITTED" && (
                <button
                  onClick={handleDispatch}
                  disabled={loadingDispatch}
                  className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 shadow-lg hover:shadow-orange-200 transition transform hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingDispatch ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Dispatching...</span>
                  ) : (
                    "Dispatch Sample"
                  )}
                </button>
              )}

              {[
                "SAMPLE_DISPATCHED_FACILITY",
                "SAMPLE_RECEIVED_WH",
                "IN_PROGRESS_WH",
                "SAMPLE_DISPATCHED_WH",
                "SAMPLE_RECEIVED_QC",
                "IN_PROGRESS_QC",
                "RESOLVED",
                "REJECTED_WH",
              ].includes(complaint.status) && (
                  <div className="flex items-center gap-3 text-green-700 bg-green-50 px-6 py-3 rounded-full border border-green-200 shadow-sm">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    <span className="font-bold tracking-wide">SAMPLE DISPATCHED SUCCESSFULLY</span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
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
  );
}

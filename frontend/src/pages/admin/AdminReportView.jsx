import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import ComplaintTopSection from "../../components/ComplaintTopSection";
import {
  FaClipboardList,
  FaWarehouse,
  FaFlask,
  FaDownload
} from "react-icons/fa";

export default function AdminReportView() {
  const { code } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [warehouseAssessment, setWarehouseAssessment] = useState(null);
  const [qcAssessment, setQcAssessment] = useState(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <GovHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* ================= REPORT HEADER ================= */}
        <div className="bg-white rounded-xl shadow border-l-8 border-indigo-600 p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <FaClipboardList className="text-indigo-600 text-3xl" />
            <div>
              <h2 className="text-xl font-bold">Admin Complaint Report</h2>
              <p className="text-sm text-gray-500">
                End-to-end lifecycle report
              </p>
            </div>
          </div>

          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <FaDownload /> Download CSV
          </button>
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
                  warehouseAssessment.documents.map((doc, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border px-4 py-2 rounded mb-2"
                    >
                      <span className="text-sm">{doc.original_name}</span>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setPreviewFile({
                              name: doc.file_name,
                              url: `http://localhost:5000/uploads/assessment/${doc.file_name}`,
                            })
                          }
                          className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                        >
                          View
                        </button>

                        <a
                          href={`http://localhost:5000/api/grievance/warehouse/assessment/download/${doc.file_name}`}
                          className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))
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
              <pre className="text-sm bg-gray-50 p-4 rounded">
                {JSON.stringify(qcAssessment, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">
                QC assessment pending / not submitted yet
              </p>
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

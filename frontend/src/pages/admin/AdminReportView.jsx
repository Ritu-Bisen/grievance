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

  /* ================= CSV DOWNLOAD ================= */
  const downloadCSV = () => {
    const rows = [
      ["SECTION", "FIELD", "VALUE"],
      ["COMPLAINT", "Complaint Code", complaint.complaint_code],
      ["COMPLAINT", "Type", complaint.complaint_type],
      ["COMPLAINT", "Status", complaint.status],
      ["COMPLAINT", "Facility", complaint.facility_name],
    ];

    if (warehouseAssessment) {
      rows.push(
        ["WAREHOUSE", "Assessment Type", warehouseAssessment.assessment_type],
        ["WAREHOUSE", "Item Code", warehouseAssessment.item_code],
        ["WAREHOUSE", "Batch No", warehouseAssessment.batch_no],
        ["WAREHOUSE", "Tender No", warehouseAssessment.tender_no],
        ["WAREHOUSE", "PO No", warehouseAssessment.po_no]
      );
    }

    if (qcAssessment) {
      rows.push(
        ["QC", "Status", qcAssessment.status],
        ["QC", "Result", qcAssessment.result]
      );
    }

    const csv = rows.map(r =>
      r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
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

          {/* 🔥 CSV BUTTON (AS YOU ASKED) */}
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <FaDownload /> Download CSV
          </button>
        </div>

        {/* ================= COMPLAINT ================= */}
        <ComplaintTopSection complaint={complaint} />

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
              </div>

              {/* 🔥 DOCUMENTS (MAIN FIX) */}
              <div>
                <h4 className="font-semibold mb-2">Documents</h4>
                {warehouseAssessment.documents?.length > 0 ? (
                  warehouseAssessment.documents.map((doc, i) => (
                    <div
                      key={i}
                      className="flex justify-between border px-3 py-2 rounded mb-2"
                    >
                      <span>{doc.original_name}</span>
                      <a
                        href={`http://localhost:5000/api/grievance/warehouse/assessment/download/${doc.file_name}`}
                        className="text-orange-600 font-medium"
                      >
                        Download
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No warehouse documents
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
              <pre>{JSON.stringify(qcAssessment, null, 2)}</pre>
            ) : (
              <p className="text-gray-500">
                QC assessment pending / not submitted yet
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

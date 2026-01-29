import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import ComplaintTopSection from "../../components/ComplaintTopSection";

export default function WarehouseAssessmentView() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [assessment, setAssessment] = useState(null);

  /* 🖼 PREVIEW STATE (image / pdf / doc) */
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    api
  .get(`/grievance/warehouse/assessment/view/${code}`)
  .then(res => {
    setComplaint(res.data.complaint);
    setAssessment(res.data.assessment);
  })
  .catch(() => alert("Failed to load warehouse assessment"));
  }, [code]);

  if (!complaint) return null;

  /* ---------- FILE TYPE CHECK ---------- */
  const isImage = (name) => /\.(jpg|jpeg|png|webp)$/i.test(name);
  const isPDF = (name) => /\.pdf$/i.test(name);
  

  /* ================= CSV DOWNLOAD ================= */
  const downloadCSV = () => {

    // ✅ allow CSV for rejected also
    if (!assessment && complaint.status !== "REJECTED_WH") return;

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
   

    /* ✅ Created & Resolved dates (CSV FIX) */
    if (complaint.created_at) {
      complaintRows.push([
        "COMPLAINT",
        "Created On",
        new Date(complaint.created_at).toLocaleString()
      ]);
    }

    if (complaint.resolved_at) {
      complaintRows.push([
        "COMPLAINT",
        "Resolved On",
        new Date(complaint.resolved_at).toLocaleString()
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
          new Date(complaint.rejected_at).toLocaleString()
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

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-6xl mx-auto bg-white mt-6 p-6 rounded shadow">

        <ComplaintTopSection complaint={complaint} />

        {/* ✅ CSV button for REJECTED case */}
        {complaint.status === "REJECTED_WH" && (
          <div className="flex justify-end mb-4">
            <button
              onClick={downloadCSV}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Download CSV
            </button>
          </div>
        )}

        {assessment ? (
          <div className="border rounded p-6">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Warehouse Assessment Details
              </h3>

              <button
                onClick={downloadCSV}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Download CSV
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><b>Assessment Type:</b> {assessment.assessment_type}</div>
              <div><b>Item Code:</b> {assessment.item_code}</div>
              <div><b>Batch No:</b> {assessment.batch_no}</div>
              <div><b>Tender No:</b> {assessment.tender_no}</div>
              <div><b>PO No:</b> {assessment.po_no}</div>
              <div><b>Stock (Warehouse):</b> {assessment.stock_warehouse}</div>
              <div><b>Stock (Facility):</b> {assessment.stock_facility}</div>
              <div><b>Total Stock:</b> {assessment.total_stock}</div>

              {assessment.same_complaint_present && (
                <div className="col-span-2">
                  <b>Same Complaint Present at Warehouse:</b>{" "}
                  {assessment.same_complaint_present}
                </div>
              )}

              {assessment.adr_severity && (
                <div><b>ADR Severity:</b> {assessment.adr_severity}</div>
              )}

              {assessment.quality_description && (
                <div className="col-span-2">
                  <b>Quality Description:</b><br />
                  {assessment.quality_description}
                </div>
              )}

              {assessment.assessment_type === "ADR" && assessment.remarks && (
                <div className="col-span-2">
                  <b>Assessment Remarks:</b><br />
                  {assessment.remarks}
                </div>
              )}

              {complaint.resolution_remark && (
                <div className="col-span-2">
                  <b>Resolution Remark:</b><br />
                  {complaint.resolution_remark}
                </div>
              )}

              {complaint.resolved_at && (
                <div className="col-span-2">
                  <b>Resolved On:</b><br />
                  {new Date(complaint.resolved_at).toLocaleString()}
                </div>
              )}

              {complaint.dispatch_remark && (
                <div className="col-span-2">
                  <b>Dispatch Remark:</b><br />
                  {complaint.dispatch_remark}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-3">Assessment Documents</h4>

              {assessment.documents?.length > 0 ? (
                <div className="space-y-2">
                  {assessment.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border px-4 py-2 rounded"
                    >
                      <span className="text-sm text-gray-700">
                        {doc.original_name}
                      </span>

                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            setPreviewFile({
                              url: `http://localhost:5000/uploads/assessment/${doc.file_name}`,
                              name: doc.file_name,
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
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No assessment documents uploaded
                </p>
              )}
            </div>
          </div>

        ) : complaint.status === "REJECTED_WH" ? (
          <div className="border rounded p-6 bg-red-50">
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              ❌ Complaint Rejected at Warehouse
            </h3>

            <p className="text-sm mb-2">
              This complaint was reviewed by the warehouse team and was found to
              be invalid. Hence, warehouse assessment was not required.
            </p>

            {complaint.rejected_at && (
              <p className="text-sm">
                <b>Rejected On:</b>{" "}
                {new Date(complaint.rejected_at).toLocaleString()}
              </p>
            )}

            {complaint.resolution_remark && (
              <p className="text-sm mt-2">
                <b>Remark:</b> {complaint.resolution_remark}
              </p>
            )}
          </div>

        ) : (
          <p className="text-gray-500">Assessment not submitted yet</p>
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

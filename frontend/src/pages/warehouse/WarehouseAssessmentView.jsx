import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import GovHeader from "../../components/GovHeader";
import ComplaintTopSection from "../../components/ComplaintTopSection";

export default function WarehouseAssessmentView() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    axios
      .get(
        `http://localhost:5000/api/grievance/warehouse/assessment/view/${code}`
      )
      .then(res => {
        setComplaint(res.data.complaint);
        setAssessment(res.data.assessment);
      });
  }, [code]);

  if (!complaint) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-6xl mx-auto bg-white mt-6 p-6 rounded shadow">

        

        {/* 🔝 COMPLAINT DETAILS + DOCUMENTS */}
        <ComplaintTopSection complaint={complaint} />

        {/* ================= ASSESSMENT DETAILS ================= */}
        {assessment ? (
          <div className="border rounded p-6">
            <h3 className="text-lg font-semibold mb-4">
              Warehouse Assessment Details
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><b>Assessment Type:</b> {assessment.assessment_type}</div>
              <div><b>Item Code:</b> {assessment.item_code}</div>
              <div><b>Batch No:</b> {assessment.batch_no}</div>
              <div><b>Tender No:</b> {assessment.tender_no}</div>
              <div><b>PO No:</b> {assessment.po_no}</div>
              <div><b>Stock (Warehouse):</b> {assessment.stock_warehouse}</div>
              <div><b>Stock (Facility):</b> {assessment.stock_facility}</div>
              <div><b>Total Stock:</b> {assessment.total_stock}</div>

              {assessment.adr_severity && (
                <div><b>ADR Severity:</b> {assessment.adr_severity}</div>
              )}

              {assessment.quality_description && (
                <div className="col-span-2">
                  <b>Quality Description:</b><br />
                  {assessment.quality_description}
                </div>
              )}

              {assessment.remarks && (
                <div className="col-span-2">
                  <b>Remarks:</b><br />
                  {assessment.remarks}
                </div>
              )}
            </div>

            {/* 📄 ASSESSMENT DOCUMENTS */}
            <div>
              <h4 className="font-semibold mb-2">
                Assessment Documents
              </h4>

              {assessment.documents?.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {assessment.documents.map((doc, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center border-b pb-1"
                    >
                      <span>{doc.original_name}</span>
                      <a
                        href={`http://localhost:5000/uploads/assessment/${doc.file_name}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No assessment documents uploaded
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">
            Assessment not submitted yet
          </p>
        )}

      </div>
    </div>
  );
}

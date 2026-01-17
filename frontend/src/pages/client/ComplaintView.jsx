import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import GovHeader from "../../components/GovHeader";

export default function ComplaintView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/grievance/complaint-user/view/${code}`)
      .then((res) => setComplaint(res.data))
      .catch(() => alert("Failed to load complaint"));
  }, [code]);

  if (!complaint) return null;

  /* ---------------- DOWNLOAD DETAILS AS CSV ---------------- */

  const downloadCSV = () => {
    const rows = [
      ["Field", "Value"],
      ["Complaint Code", complaint.complaint_code],
      ["Type", complaint.complaint_type],
      ["Category", complaint.category],
      ["Facility", complaint.facility_name],
      ["Facility Address", complaint.facility_address],
      ["Item", complaint.item_name],
      ["Item Code", complaint.item_code],
      ["Batch No", complaint.batch_no],
      ["Warehouse Batch", complaint.warehouse_batch],
      ["Affected Quantity", complaint.affected_quantity],
      ["Description", complaint.description],
      ["Status", complaint.status],
    ];

    const csvContent = rows
      .map((row) =>
        row.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `complaint_${complaint.complaint_code}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-5xl mx-auto bg-white p-6 mt-6 border rounded">
        {/* ---------------- HEADER ---------------- */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Complaint Details</h2>

          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Download Details
            </button>

            <button
              onClick={() => navigate(-1)}
              className="border px-4 py-2 rounded"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* ---------------- COMPLAINT DETAILS ---------------- */}
        {Object.entries({
          "Complaint Code": complaint.complaint_code,
          "Type": complaint.complaint_type,
          "Category": complaint.category,
          "Facility": complaint.facility_name,
          "Facility Address": complaint.facility_address,
          "Item": complaint.item_name,
          "Item Code": complaint.item_code,
          "Batch No": complaint.batch_no,
          "Warehouse Batch": complaint.warehouse_batch,
          "Affected Quantity": complaint.affected_quantity,
          "Description": complaint.description,
          "Status": complaint.status,
        }).map(([k, v]) => (
          <div key={k} className="grid grid-cols-3 border-b py-2">
            <div className="font-medium">{k}</div>
            <div className="col-span-2">{v}</div>
          </div>
        ))}

        {/* ---------------- DOCUMENTS SECTION ---------------- */}
        {complaint.documents && complaint.documents.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">
              Supporting Documents
            </h3>

            <div className="space-y-2">
              {complaint.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border px-4 py-2 rounded"
                >
                  <span className="text-sm text-gray-700">
                    {doc.split("-").slice(1).join("-")}
                  </span>

                  <a
                    href={`http://localhost:5000/api/grievance/complaint-user/download/${doc}`}
                    className="text-blue-600 underline"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

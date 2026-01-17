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

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-5xl mx-auto bg-white p-6 mt-6 border rounded">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Complaint Details</h2>
          <button onClick={() => navigate(-1)} className="border px-4 py-2 rounded">
            ← Back
          </button>
        </div>

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
      </div>
    </div>
  );
}

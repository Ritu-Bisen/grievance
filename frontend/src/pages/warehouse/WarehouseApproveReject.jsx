import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import GovHeader from "../../components/GovHeader";

export default function WarehouseApproveReject() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [isRejected, setIsRejected] = useState(false);
  const [showApproveSuccess, setShowApproveSuccess] = useState(false);

  /* ---------------- LOAD COMPLAINT ---------------- */
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/grievance/complaint-user/view/${code}`)
      .then((res) => setComplaint(res.data))
      .catch(() => alert("Failed to load complaint"));
  }, [code]);

  /* ---------------- APPROVE ---------------- */
  const handleApprove = async () => {
    await axios.post(
      "http://localhost:5000/api/grievance/warehouse/approve",
      { complaint_code: code }
    );

    // update UI instantly
    setComplaint((prev) => ({
      ...prev,
      status: "IN_PROGRESS_WH"
    }));

    // show success page (same like sample receive)
    setShowApproveSuccess(true);
  };

  /* ---------------- REJECT ---------------- */
  const handleReject = async () => {
    await axios.post(
      "http://localhost:5000/api/grievance/warehouse/reject",
      { complaint_code: code }
    );

    // update UI instantly
    setComplaint((prev) => ({
      ...prev,
      status: "REJECTED_WH"
    }));

    setIsRejected(true);
  };

  if (!complaint) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-4xl mx-auto bg-white mt-6 p-6 rounded shadow">

        <h2 className="text-xl font-semibold mb-4">
          Warehouse Approval – {complaint.complaint_code}
        </h2>

        {/* COMPLAINT DETAILS */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div><b>Type:</b> {complaint.complaint_type}</div>
          <div><b>Category:</b> {complaint.category}</div>
          <div><b>Facility:</b> {complaint.facility_name}</div>
          <div><b>Item:</b> {complaint.item_name}</div>
          <div><b>Batch:</b> {complaint.batch_no}</div>
          <div>
            <b>Status:</b>{" "}
            <span
              className={
                complaint.status === "REJECTED_WH"
                  ? "text-red-600 font-semibold"
                  : complaint.status === "IN_PROGRESS_WH"
                  ? "text-green-700 font-semibold"
                  : ""
              }
            >
              {complaint.status}
            </span>
          </div>
        </div>

        {/* ---------------- ACTION AREA ---------------- */}

        {/* NORMAL STATE */}
        {!isRejected && !showApproveSuccess && (
          <div className="flex gap-6">
            <button
              onClick={handleApprove}
              className="bg-green-700 text-white px-8 py-3 rounded font-semibold"
            >
              Approve
            </button>

            <button
              onClick={handleReject}
              className="bg-red-600 text-white px-8 py-3 rounded font-semibold"
            >
              Reject
            </button>
          </div>
        )}

        {/* REJECTED STATE */}
        {isRejected && (
          <div className="text-center">
            <h3 className="text-red-600 font-semibold text-lg mb-4">
              ❌ Complaint Rejected
            </h3>

            <button
              onClick={() => navigate("/warehouse")}
              className="px-6 py-2 bg-gray-600 text-white rounded"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/* APPROVE SUCCESS STATE (SAME AS SAMPLE RECEIVE) */}
        {showApproveSuccess && (
          <div className="text-center">
            <h3 className="text-green-700 font-semibold text-lg mb-4">
              ✅ Complaint Approved Successfully
            </h3>

            <p className="text-sm mb-6">
              Status moved to <b>IN_PROGRESS_WH</b>
            </p>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => navigate("/warehouse")}
                className="px-6 py-2 bg-gray-500 text-white rounded"
              >
                Back to Dashboard
              </button>

             <button
  onClick={() => {
    if (complaint.complaint_type === "PHYSICAL") {
      navigate(`/warehouse/action/physical/${code}`);
    } else if (complaint.complaint_type === "ADR") {
      navigate(`/warehouse/action/adr/${code}`);
    } else {
      navigate(`/warehouse/action/quality/${code}`);
    }
  }}
  className="px-6 py-2 bg-green-600 text-white rounded"
>
  Next Stage
</button>


            </div>
          </div>
        )}
      </div>
    </div>
  );
}

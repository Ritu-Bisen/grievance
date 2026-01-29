import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import ComplaintTopSection from "../../components/ComplaintTopSection";

export default function WarehouseResolveAction() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [resolutionRemark, setResolutionRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ================= LOAD COMPLAINT ================= */
  useEffect(() => {
    api
  .get(`/grievance/complaint-user/view/${code}`)
  .then((res) => setComplaint(res.data))
      .catch(() => alert("Failed to load complaint"));
  }, [code]);

  /* ================= SUBMIT RESOLUTION ================= */
  const handleResolve = async () => {
    try {
      if (!resolutionRemark) {
        alert("Please enter resolution remarks");
        return;
      }

      setSubmitting(true);

      await api.post(
  "/grievance/warehouse/resolve",
        {
          complaint_code: code,
          resolution_remark: resolutionRemark
        }
      );

      alert("Complaint resolved successfully");
      navigate("/warehouse");

    } catch (err) {
      alert(err.response?.data?.message || "Resolve failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!complaint) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-6xl mx-auto bg-white mt-6 p-6 rounded shadow">
        {/* COMPLAINT DETAILS */}
        <ComplaintTopSection complaint={complaint} />

        {/* RESOLVE FORM */}
        <div className="bg-white border rounded p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-green-700">
            Resolve Action – Physical Complaint
          </h3>

          <div className="mb-4">
            <label className="text-sm font-medium">
              Resolution Remarks *
            </label>
            <textarea
              rows="4"
              value={resolutionRemark}
              onChange={(e) => setResolutionRemark(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded"
              placeholder="Enter resolution details..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleResolve}
              disabled={submitting}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              {submitting ? "Submitting..." : "Resolve Complaint"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

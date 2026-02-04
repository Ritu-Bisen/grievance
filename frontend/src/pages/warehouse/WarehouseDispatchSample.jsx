import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";
import ComplaintTopSection from "../../components/ComplaintTopSection";

export default function WarehouseDispatchSample() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [dispatchRemark, setDispatchRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ================= LOAD COMPLAINT ================= */
  useEffect(() => {
    api
  .get(`/grievance/complaint-user/view/${code}`)
  .then((res) => setComplaint(res.data))

      .catch(() => alert("Failed to load complaint"));
  }, [code]);

  /* ================= SUBMIT DISPATCH ================= */
  const handleDispatch = async () => {
    try {
      if (!dispatchRemark) {
        alert("Please enter dispatch remarks");
        return;
      }

      setSubmitting(true);

      await api.post(
  "/grievance/warehouse/dispatch",
        {
          complaint_code: code,
          remarks: dispatchRemark
        }
      );

      alert("Sample dispatched successfully");
      navigate("/warehouse");

    } catch (err) {
      alert(err.response?.data?.message || "Dispatch failed");
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

        {/* DISPATCH FORM */}
        <div className="bg-white border rounded p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">
            Dispatch Sample – ADR / Quality
          </h3>

          <div className="mb-4">
            <label className="text-sm font-medium">
              Dispatch Remarks *
            </label>
            <textarea
              rows="4"
              value={dispatchRemark}
              onChange={(e) => setDispatchRemark(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded"
              placeholder="Enter dispatch remarks..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleDispatch}
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              {submitting ? "Submitting..." : "Dispatch Sample"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

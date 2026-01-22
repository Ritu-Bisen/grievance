import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import GovHeader from "../../components/GovHeader";

export default function DispatchSample() {
  const { complaintCode } = useParams();
  const navigate = useNavigate();
  const [dispatched, setDispatched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDispatch = async () => {
    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/grievance/complaint-user/dispatch-facility",
        { complaint_code: complaintCode }
      );

      setDispatched(true);
    } catch (err) {
      alert("Failed to dispatch sample");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white border rounded p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-green-600">
              Dispatch Sample
            </h2>

            {/* ✅ ONLY BACK BUTTON (FORM STYLE) */}
            <button
              onClick={() => navigate("/complaint/dashboard")}
              className="bg-blue-50 text-blue-700 px-4 py-1 rounded hover:bg-blue-100"
            >
              Back
            </button>
          </div>

          <div className="text-center">
            <p className="mb-4">
              <strong>Complaint ID:</strong> {complaintCode}
            </p>

            {/* BEFORE DISPATCH */}
            {!dispatched && (
              <button
                onClick={handleDispatch}
                disabled={loading}
                className="bg-orange-500 text-white px-6 py-2 rounded disabled:opacity-60"
              >
                {loading ? "Dispatching..." : "Dispatch Sample"}
              </button>
            )}

            {/* AFTER DISPATCH */}
            {dispatched && (
              <p className="text-green-700 font-medium mt-4">
                ✅ Sample Dispatched Successfully
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

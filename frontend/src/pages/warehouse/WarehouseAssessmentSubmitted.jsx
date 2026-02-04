import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";

export default function WarehouseAssessmentSubmitted() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    api
  .get(`/grievance/complaint-user/view/${code}`)
  .then((res) => setComplaint(res.data))

      .catch(() => alert("Failed to load complaint"));
  }, [code]);

  if (!complaint) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-md mx-auto bg-white mt-24 p-6 rounded shadow text-center">
        <h2 className="text-green-700 text-lg font-semibold mb-4">
          ✅ Assessment Submitted Successfully
        </h2>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => navigate("/warehouse")}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Back to Dashboard
          </button>

          {/* 🔥 FINAL & SIMPLE NEXT STAGE */}
          <button
            onClick={() => {
              if (complaint.complaint_type === "PHYSICAL") {
                navigate(`/warehouse/action/resolve/${code}`);
              } else {
                navigate(`/warehouse/action/dispatch/${code}`);
              }
            }}
            className="px-6 py-2 bg-green-600 text-white rounded"
          >
            Next Stage
          </button>
        </div>
      </div>
    </div>
  );
}

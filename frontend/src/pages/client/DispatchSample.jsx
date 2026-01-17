import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import GovHeader from "../../components/GovHeader";

export default function DispatchSample() {
  const { complaintCode } = useParams();
  const navigate = useNavigate();
  const [dispatched, setDispatched] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white border rounded p-6 text-center">

          <h2 className="text-xl font-semibold text-green-600 mb-4">
            Complaint Submitted Successfully
          </h2>

          <p className="mb-4">
            <strong>Complaint ID:</strong> {complaintCode}
          </p>

          {/* 👇 IF SAMPLE NOT DISPATCHED */}
          {!dispatched && (
            <button
              onClick={() => setDispatched(true)}
              className="bg-orange-500 text-white px-6 py-2 rounded"
            >
              Dispatch Sample
            </button>
          )}

          {/* 👇 AFTER DISPATCH */}
          {dispatched && (
            <>
              <p className="text-green-700 font-medium mt-4">
                ✅ Sample Dispatched Successfully
              </p>

              <button
                onClick={() => navigate("/complaint/dashboard")}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
              >
                Go to Dashboard
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

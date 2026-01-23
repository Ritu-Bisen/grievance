import { useNavigate } from "react-router-dom";

export default function ComplaintTopSection({ complaint }) {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 border rounded p-6 mb-6">

      {/* 🔙 BACK BUTTON (TOP) */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/warehouse")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* ===== BASIC DETAILS (EXACT SAME AS COMPLAINT VIEW) ===== */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div><b>Complaint ID:</b> {complaint.complaint_code}</div>
        <div><b>Type:</b> {complaint.complaint_type}</div>
        <div><b>Category:</b> {complaint.category}</div>
        <div><b>Facility:</b> {complaint.facility_name}</div>
        <div><b>Item Name:</b> {complaint.item_name}</div>
        <div><b>Item Code:</b> {complaint.item_code}</div>
        <div><b>Batch No:</b> {complaint.batch_no}</div>
        <div><b>Status:</b> {complaint.status}</div>
      </div>

      {/* ===== DOCUMENTS (EXACT SAME AS COMPLAINT VIEW) ===== */}
      <div>
        <h4 className="font-semibold mb-2">Uploaded Documents</h4>

        {complaint.documents?.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {complaint.documents.map((doc, i) => (
              <li
                key={i}
                className="flex justify-between items-center border-b pb-1"
              >
                <span>{doc.original_name}</span>
                <a
                  href={`http://localhost:5000/uploads/${doc.file_name}`}
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
            No documents uploaded
          </p>
        )}
      </div>

    </div>
  );
}

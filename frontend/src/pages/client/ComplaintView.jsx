import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";

export default function ComplaintView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);

  /* ---------- PREVIEW STATE ---------- */
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    api
      .get(`/grievance/complaint-user/view/${code}`)
      .then((res) => setComplaint(res.data))
      .catch(() => alert("Failed to load complaint"));
  }, [code]);

  if (!complaint) return null;

  /* ---------- SAFE DATES ---------- */
  const createdAtFormatted = complaint.created_at
    ? new Date(complaint.created_at).toLocaleString()
    : "—";

  const rejectedAtFormatted = complaint.rejected_at
    ? new Date(complaint.rejected_at).toLocaleString()
    : null;

  const resolvedAtFormatted = complaint.resolved_at
    ? new Date(complaint.resolved_at).toLocaleString()
    : null;

  /* ---------- FILE HELPERS ---------- */
  const getFileName = (doc) => {
    if (typeof doc === "string") return doc.split("-").slice(1).join("-");
    return doc.original_name;
  };

  const getFilePath = (doc) => {
    if (typeof doc === "string") return doc;
    return doc.file_name;
  };

  const isImage = (name) => /\.(jpg|jpeg|png|webp)$/i.test(name);
  const isPDF = (name) => /\.pdf$/i.test(name);
  const isText = (name) => /\.(txt|csv)$/i.test(name);
  const isDoc = (name) => /\.(doc|docx)$/i.test(name);

  /* ---------- CSV DOWNLOAD ---------- */
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
      ["Warehouse Batch", complaint.warehouse_code],
      ["Affected Quantity", complaint.affected_quantity],
      ["Description", complaint.description],
      ["Status", complaint.status],
      ["Complaint Created On", createdAtFormatted],
    ];

    if (rejectedAtFormatted) {
      rows.push(["Complaint Rejected On", rejectedAtFormatted]);
    }

    if (resolvedAtFormatted) {
      rows.push(["Complaint Resolved On", resolvedAtFormatted]);
    }

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
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Complaint Details</h2>

          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="bg-green-600 text-white px-4 py-2 rounded"
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

        {/* DETAILS */}
        {Object.entries({
          "Complaint Code": complaint.complaint_code,
          "Type": complaint.complaint_type,
          "Category": complaint.category,
          "Facility": complaint.facility_name,
          "Facility Address": complaint.facility_address,
          "Item": complaint.item_name,
          "Item Code": complaint.item_code,
          "Batch No": complaint.batch_no,
          "Warehouse Batch": complaint.warehouse_code,
          "Affected Quantity": complaint.affected_quantity,
          "Description": complaint.description,
          "Status": complaint.status,
          "Complaint Created On": createdAtFormatted,
          ...(rejectedAtFormatted && {
            "Complaint Rejected On": rejectedAtFormatted,
          }),
          ...(resolvedAtFormatted && {
            "Complaint Resolved On": resolvedAtFormatted,
          }),
        }).map(([k, v]) => (
          <div key={k} className="grid grid-cols-3 border-b py-2">
            <div className="font-medium">{k}</div>
            <div className="col-span-2">{v}</div>
          </div>
        ))}

        {/* DOCUMENTS */}
        {complaint.documents?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">
              Supporting Documents
            </h3>

            <div className="space-y-2">
              {complaint.documents.map((doc, index) => {
                const name = getFileName(doc);
                const path = getFilePath(doc);
                const fullUrl = `http://localhost:5000/uploads/${path}`;

                return (
                  <div
                    key={index}
                    className="flex justify-between items-center border px-4 py-2 rounded"
                  >
                    <span className="text-sm">{name}</span>

                    <div className="flex gap-2">
                      {(isImage(name) || isPDF(name) || isText(name)) && (
                        <button
                          onClick={() =>
                            setPreviewFile({ name, url: fullUrl })
                          }
                          className="bg-orange-500 text-white px-3 py-1 rounded"
                        >
                          View
                        </button>
                      )}

                      <a
                        href={`http://localhost:5000/api/grievance/complaint-user/download/${path}`}
                        className="bg-orange-500 text-white px-3 py-1 rounded"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded max-w-4xl w-full">
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setPreviewFile(null)}
                className="bg-red-500 text-white px-4 py-1 rounded"
              >
                Cancel
              </button>
            </div>

            {isImage(previewFile.name) && (
              <img
                src={previewFile.url}
                className="max-h-[75vh] mx-auto"
                alt="preview"
              />
            )}

            {(isPDF(previewFile.name) || isText(previewFile.name)) && (
              <iframe
                src={previewFile.url}
                className="w-full h-[75vh]"
                title="preview"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

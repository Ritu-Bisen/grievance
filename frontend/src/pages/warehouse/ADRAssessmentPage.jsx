import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import GovHeader from "../../components/GovHeader";
import ComplaintTopSection from "../../components/ComplaintTopSection";

export default function ADRAssessmentPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sameComplaint, setSameComplaint] = useState("");
  const [adrSeverity, setAdrSeverity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [files, setFiles] = useState([]);

  /* 🔹 AUTO-FILLED (dummy for now) */
  const autoFilledData = {
    tender_no: "TN-ADR-002",
    po_no: "PO-445566",
    stock_warehouse: "500",
    stock_facility: "480",
    total_stock: "980"
  };

  /* ================= LOAD COMPLAINT ================= */
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/grievance/complaint-user/view/${code}`)
      .then((res) => setComplaint(res.data))
      .catch(() => alert("Failed to load complaint"));
  }, [code]);

  /* ================= FILE HANDLER (🔥 SAME AS PHYSICAL) ================= */
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const combined = [...files, ...newFiles];

    if (combined.length > 5) {
      alert("You can upload a maximum of 5 documents only");
      e.target.value = "";
      return;
    }

    setFiles(combined);
    e.target.value = "";
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      if (!sameComplaint || !adrSeverity || !remarks) {
        alert("Please fill all mandatory fields");
        return;
      }

      setSubmitting(true);

      const formData = new FormData();

      formData.append("complaint_code", complaint.complaint_code);
      formData.append("assessment_type", "ADR");
      formData.append("item_code", complaint.item_code);
      formData.append("batch_no", complaint.batch_no);

      formData.append("tender_no", autoFilledData.tender_no);
      formData.append("po_no", autoFilledData.po_no);
      formData.append("stock_warehouse", autoFilledData.stock_warehouse);
      formData.append("stock_facility", autoFilledData.stock_facility);
      formData.append("total_stock", autoFilledData.total_stock);

      formData.append("same_complaint_present", sameComplaint);
      formData.append("adr_severity", adrSeverity);
      formData.append("remarks", remarks);

      files.forEach((file) => {
        formData.append("documents", file);
      });

      await axios.post(
        "http://localhost:5000/api/grievance/warehouse/assessment/submit",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("ADR assessment submitted successfully");

      /* 🔥 FIRST TIME POPUP FLAG */
    
      /* 🔥 POPUP PAGE */
      navigate(`/warehouse/assessment/submitted/${code}`);

    } catch (err) {
      alert(err.response?.data?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!complaint) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-6xl mx-auto bg-white mt-6 p-6 rounded shadow">

        {/* 🔝 COMPLAINT DETAILS */}
        <ComplaintTopSection complaint={complaint} />

        {/* ================= ADR ASSESSMENT FORM ================= */}
        <div className="bg-white border rounded p-6">

          <h3 className="text-lg font-semibold mb-6">
            Warehouse Assessment Form – ADR Reaction
          </h3>

          {/* ROW 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="text-sm font-medium">
                Tender No. (Auto-filled)
              </label>
              <input
                disabled
                value={autoFilledData.tender_no}
                className="w-full mt-1 px-3 py-2 bg-gray-100 rounded border"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                PO No. (Auto-filled)
              </label>
              <input
                disabled
                value={autoFilledData.po_no}
                className="w-full mt-1 px-3 py-2 bg-gray-100 rounded border"
              />
            </div>
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label className="text-sm font-medium">
                Physical Stock at Warehouse (Auto-filled)
              </label>
              <input
                disabled
                value={autoFilledData.stock_warehouse}
                className="w-full mt-1 px-3 py-2 bg-gray-100 rounded border"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Physical Stock at Complaint Facility (Auto-filled)
              </label>
              <input
                disabled
                value={autoFilledData.stock_facility}
                className="w-full mt-1 px-3 py-2 bg-gray-100 rounded border"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Total Stock Intended at Facility (Auto-filled)
              </label>
              <input
                disabled
                value={autoFilledData.total_stock}
                className="w-full mt-1 px-3 py-2 bg-gray-100 rounded border"
              />
            </div>
          </div>

          {/* SAME COMPLAINT */}
          <div className="mb-4">
            <label className="text-sm font-medium">
              Check if same complaint is present at warehouse *
            </label>
            <select
              value={sameComplaint}
              onChange={(e) => setSameComplaint(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded bg-white"
            >
              <option value="">Select...</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </select>
          </div>

          {/* ADR SEVERITY */}
          <div className="mb-4">
            <label className="text-sm font-medium">
              Duly Filled Adverse Reaction for Patient *
            </label>
            <select
              value={adrSeverity}
              onChange={(e) => setAdrSeverity(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded bg-white"
            >
              <option value="">Select...</option>
              <option value="MILD">Mild</option>
              <option value="MODERATE">Moderate</option>
              <option value="SEVERE">Severe</option>
            </select>
          </div>

          {/* REMARKS */}
          <div className="mb-4">
            <label className="text-sm font-medium">
              Remarks *
            </label>
            <textarea
              rows="4"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded"
              placeholder="Enter remarks..."
            />
          </div>

          {/* 🔥 UPLOAD DOCUMENTS (EXACT SAME AS PHYSICAL) */}
          <div>
            <label className="text-sm font-medium">
              Upload Documents (Max 5)
            </label>

            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="
                  file:bg-orange-500
                  file:text-white
                  file:px-3
                  file:py-1
                  file:rounded
                  file:border-0
                  hover:file:bg-orange-600
                  cursor-pointer
                "
              />

              {files.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {files.map((file, i) => {
                    const isImage = file.type.startsWith("image/");
                    return (
                      <div
                        key={i}
                        className="w-12 border rounded p-0.5 bg-gray-50 text-center"
                      >
                        {isImage ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="h-10 flex items-center justify-center text-lg">
                            📄
                          </div>
                        )}
                        <p
                          className="text-[9px] truncate mt-1"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

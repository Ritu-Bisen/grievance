import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

import GovHeader from "../../components/GovHeader";

/* 🔹 ICONS */
import { FaBoxOpen, FaHeartbeat, FaExclamationTriangle } from "react-icons/fa";

/* ---------------- MOCK DATA (TEMP) ---------------- */

const facilities = [
  { id: 1, name: "District Hospital Raipur", address: "Raipur, Chhattisgarh" },
  { id: 2, name: "CHC Bilaspur", address: "Bilaspur, Chhattisgarh" },
];

const items = [
  { code: "ITEM001", name: "Paracetamol 500mg Tablets" },
  { code: "ITEM002", name: "Amoxicillin 250mg Capsules" },
];

const batches = [
  {
    batchNo: "BATCH001",
    warehouse_code: "WH-001",
    firm_name: "Generic Pharma Corp",
    mfg: "2024-01-10",
    exp: "2026-01-09",
    purchase: "2024-02-01",
    quantity: 500,
  },
  {
    batchNo: "BATCH002",
    warehouse_code: "WH-002",
    firm_name: "LifeCare Solutions Ltd",
    mfg: "2023-12-15",
    exp: "2025-12-14",
    purchase: "2024-01-20",
    quantity: 300,
  },
];

/* ---------------- CATEGORY OPTIONS ---------------- */

const PHYSICAL_DAMAGE_TYPES = [
  "Carton Damage",
  "Bottle Damage",
  "Cap Damage",
  "Label Damage",
  "Seal Damage",
  "Container Damage",
  "Packaging Damage",
  "Transport Damage",
];

const ADR_CATEGORIES = [
  "Allergic Reaction",
  "Side Effects",
  "Drug Interaction",
  "Overdose Effect",
  "Injection Site Reaction",
  "Gastrointestinal Issues",
  "Skin Reaction",
  "Other Adverse Event",
];

const POOR_QUALITY_CATEGORIES = [
  "Color Change",
  "Odor Change",
  "Consistency Change",
  "Contamination",
  "Particulate Matter",
  "Crystallization",
  "Moisture Damage",
  "Potency Issues",
];

/* ---------------- MAIN COMPONENT ---------------- */

export default function ComplaintTypeSelection() {
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Raise New Complaint</h2>
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <TypeCard
            title="Physical Damage"
            description="Damage to packaging, bottle, label, seal, or container"
            icon={FaBoxOpen}
            onClick={() => setSelectedType("PHYSICAL")}
          />
          {(!JSON.parse(localStorage.getItem("user"))?.role || JSON.parse(localStorage.getItem("user"))?.role !== "WAREHOUSE") && (
            <TypeCard
              title="ADR Reaction"
              description="Adverse drug reactions or side effects"
              icon={FaHeartbeat}
              onClick={() => setSelectedType("ADR")}
            />
          )}
          <TypeCard
            title="Poor Quality"
            description="Quality issues like contamination or potency"
            icon={FaExclamationTriangle}
            onClick={() => setSelectedType("QUALITY")}
          />
        </div>

        {selectedType === "PHYSICAL" && (
          <ComplaintBaseForm
            complaintType="PHYSICAL"
            title="Physical Damage Complaint Form"
            categoryLabel="Physical Damage Type"
            categoryOptions={PHYSICAL_DAMAGE_TYPES}
          />
        )}

        {selectedType === "ADR" && (
          <ComplaintBaseForm
            complaintType="ADR"
            title="ADR Reaction Complaint Form"
            categoryLabel="ADR Reaction Type"
            categoryOptions={ADR_CATEGORIES}
          />
        )}

        {selectedType === "QUALITY" && (
          <ComplaintBaseForm
            complaintType="QUALITY"
            title="Poor Quality Complaint Form"
            categoryLabel="Quality Issue Type"
            categoryOptions={POOR_QUALITY_CATEGORIES}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- TYPE CARD (COLOR + ICONS) ---------------- */

function TypeCard({ title, description, onClick, icon: Icon }) {
  return (
    <div
      onClick={onClick}
      className="
        bg-green-700
        border border-green-800
        rounded
        p-5
        cursor-pointer
        hover:bg-green-800
        hover:shadow-md
        transition
        text-white
        flex gap-4
      "
    >
      <div className="text-3xl mt-1">
        <Icon />
      </div>

      <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-green-100">{description}</p>
      </div>
    </div>
  );
}

/* ---------------- BASE FORM (ORIGINAL UI) ---------------- */

function ComplaintBaseForm({ title, categoryLabel, categoryOptions, complaintType }) {
  const navigate = useNavigate();

  const [facility, setFacility] = useState(null);

  const [itemCodeQuery, setItemCodeQuery] = useState("");
  const [item, setItem] = useState(null);

  const [batchQuery, setBatchQuery] = useState("");
  const [batch, setBatch] = useState(null);

  /* 🔹 AUTO-FILLED DUMMY DATA FOR ASSESSMENT */
  const autoFilledData = {
    tender_no: "TN-2024-001",
    po_no: "PO-889977",
    stock_warehouse: "1200",
    stock_facility: "1000",
    total_stock: "2200"
  };

  const [category, setCategory] = useState("");
  const [qty, setQty] = useState("");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState([]);
  const [opdSlip, setOpdSlip] = useState(null);

  /* 🔹 WAREHOUSE ASSESSMENT STATE */
  const [sameComplaint, setSameComplaint] = useState("");
  const [qualityDescription, setQualityDescription] = useState("");
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.facility_name && user?.facility_address) {
      setFacility({
        name: user.facility_name,
        address: user.facility_address,
      });
    } else if (user?.role === "WAREHOUSE" && user?.warehouse_code) {
      setFacility({
        name: `WAREHOUSE: ${user.warehouse_code}`,
        address: "Warehouse Initiated",
      });
    }
  }, []);

  const itemResults = items.filter(i =>
    i.code.toLowerCase().includes(itemCodeQuery.toLowerCase())
  );

  /* 🔹 BATCH FILTERING */
  const user = JSON.parse(localStorage.getItem("user"));
  const warehouseCode = user?.role === "WAREHOUSE" ? user.warehouse_code : null;

  const filteredBatches = batches.filter(b => {
    // If user is WAREHOUSE, only show their batches
    if (warehouseCode && b.warehouse_code !== warehouseCode) return false;
    return true;
  });

  const batchResults = filteredBatches.filter(b =>
    b.batchNo.toLowerCase().includes(batchQuery.toLowerCase())
  );

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    // combine old + new files
    const combinedFiles = [...documents, ...newFiles];

    if (combinedFiles.length > 5) {
      alert("You can upload a maximum of 5 documents only");
      e.target.value = "";
      return;
    }

    setDocuments(combinedFiles);
    e.target.value = ""; // allow re-selecting same file again
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      if (
        (!facility && JSON.parse(localStorage.getItem("user"))?.role !== "WAREHOUSE") ||
        !item ||
        !batch ||
        !category ||
        !qty ||
        !description.trim() ||
        documents.length === 0 ||
        (complaintType === "ADR" && !opdSlip)
      ) {
        alert(complaintType === "ADR" ? "Please fill all mandatory fields including OPD Slip" : "Please fill all mandatory fields");
        return;
      }

      if (Number(qty) > batch.quantity) {
        alert("Quantity cannot exceed received quantity");
        return;
      }

      const formData = new FormData();
      formData.append("complaint_type", complaintType);
      formData.append("category", category);
      formData.append("affected_quantity", qty);
      formData.append("description", description);
      formData.append("facility", JSON.stringify(facility));
      formData.append("item", JSON.stringify(item));
      formData.append("batch", JSON.stringify(batch));

      documents.forEach(file => {
        formData.append("documents", file);
      });

      if (opdSlip) {
        formData.append("opd_slip", opdSlip);
      }

      // 🔥 WAREHOUSE INTEGRATED ASSESSMENT DATA
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "WAREHOUSE") {
        formData.append("tender_no", autoFilledData.tender_no);
        formData.append("po_no", autoFilledData.po_no);
        formData.append("stock_warehouse", autoFilledData.stock_warehouse);
        formData.append("stock_facility", autoFilledData.stock_facility);
        formData.append("total_stock", autoFilledData.total_stock);
        formData.append("same_complaint_present", sameComplaint);

        if (complaintType === "QUALITY") {
          formData.append("quality_description", qualityDescription);
        }
      }

      const res = await api.post(
        "/grievance/complaint-user/create",
        formData
      );



      const complaintCode = res.data.complaint_code;
      alert("Complaint submitted successfully");

      // ✅ ONLY CHANGE
      if (JSON.parse(localStorage.getItem("user"))?.role === "WAREHOUSE") {
        navigate("/warehouse");
      } else {
        navigate("/complaint/dashboard");
      }

    } catch (err) {
      console.error(err);
      alert("Failed to submit complaint");
    }
  };

  return (
    <div className="bg-white border rounded">
      <div className="bg-blue-50 px-4 py-3 font-medium">{title}</div>

      <div className="p-6 space-y-6">

        {JSON.parse(localStorage.getItem("user"))?.role !== "WAREHOUSE" && (
          <Section title="Facility Details">
            <ReadOnlyInput
              label="Facility Name *"
              value={facility?.name || ""}
            />

            <ReadOnlyInput
              label="Facility Address *"
              value={facility?.address || ""}
            />
          </Section>
        )}


        <Section title="Item Details">
          <DropdownInput
            label="Item Code *"
            value={itemCodeQuery}
            onChange={(v) => {
              setItemCodeQuery(v);
              setItem(null);
            }}
            results={itemResults.map(i => i.code)}
            onSelect={(code) => {
              const i = items.find(x => x.code === code);
              setItem(i);
              setItemCodeQuery(i.code);
            }}
          />
          <ReadOnlyInput label="Item Name *" value={item?.name || ""} />
        </Section>

        <Section title="Batch Information">
          <DropdownInput
            label="Batch No *"
            value={batchQuery}
            onChange={(v) => {
              setBatchQuery(v);
              setBatch(null);
            }}
            results={batchResults.map(b => b.batchNo)}
            onSelect={(no) => {
              const b = batches.find(x => x.batchNo === no);
              setBatch(b);
              setBatchQuery(b.batchNo);
            }}
          />
          <ReadOnlyInput label="Warehouse Batch No" value={batch?.warehouse_code || ""} />
          <ReadOnlyInput label="Supplying Firm Name" value={batch?.firm_name || ""} />
        </Section>

        <Section title="Date Information">
          <ReadOnlyInput label="Manufacturing Date" value={batch?.mfg || ""} />
          <ReadOnlyInput label="Expiry Date" value={batch?.exp || ""} />
          <ReadOnlyInput label="Purchase Date" value={batch?.purchase || ""} />
        </Section>

        <Section title="Complaint Category">
          <div>
            <label className="block text-sm mb-1">{categoryLabel} *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border px-3 py-2 w-full rounded"
            >
              <option value="">Select Category</option>
              {categoryOptions.map(opt => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </Section>

        <Section title="Quantity Details">
          <ReadOnlyInput label="Quantity Received" value={batch?.quantity || ""} />
          <div>
            <label className="block text-sm mb-1">Affected Quantity *</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="border px-3 py-2 w-full rounded"
            />
          </div>
        </Section>

        <Section title="Complaint Description">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1 font-semibold text-gray-700">Details of complaint *</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border px-3 py-2 w-full rounded resize-none"
            />
          </div>
        </Section>

        {/* 🔥 WAREHOUSE INTEGRATED ASSESSMENT FORM */}
        {
          JSON.parse(localStorage.getItem("user"))?.role === "WAREHOUSE" && (
            <div className="border border-green-200 rounded p-4 bg-green-50 mb-6">
              <h3 className="text-lg font-bold text-green-900 mb-4 border-b border-green-200 pb-2">
                Perform Assessment
              </h3>

              {/* AUTO-FILLED ROW 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Tender No. (Auto)</label>
                  <input disabled value={autoFilledData.tender_no} className="w-full px-3 py-2 bg-white rounded border border-green-300 text-gray-500" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">PO No. (Auto)</label>
                  <input disabled value={autoFilledData.po_no} className="w-full px-3 py-2 bg-white rounded border border-green-300 text-gray-500" />
                </div>
              </div>

              {/* AUTO-FILLED ROW 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Stock @ Warehouse</label>
                  <input disabled value={autoFilledData.stock_warehouse} className="w-full px-3 py-2 bg-white rounded border border-green-300 text-gray-500" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Stock @ Facility</label>
                  <input disabled value={autoFilledData.stock_facility} className="w-full px-3 py-2 bg-white rounded border border-green-300 text-gray-500" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Total Stock</label>
                  <input disabled value={autoFilledData.total_stock} className="w-full px-3 py-2 bg-white rounded border border-green-300 text-gray-500" />
                </div>
              </div>

              {/* SAME COMPLAINT PRESENT */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Is the same complaint present at warehouse? *
                </label>
                <select
                  value={sameComplaint}
                  onChange={(e) => setSameComplaint(e.target.value)}
                  className="w-full px-3 py-2 border rounded border-green-500 focus:ring-2 focus:ring-green-300 outline-none"
                >
                  <option value="">Select Option</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                </select>
              </div>

              {/* QUALITY DESCRIPTION (ONLY FOR QUALITY) */}
              {complaintType === "QUALITY" && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Description of Poor Quality *
                  </label>
                  <textarea
                    rows="3"
                    value={qualityDescription}
                    onChange={(e) => setQualityDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded border-green-500 focus:ring-2 focus:ring-green-300 outline-none"
                    placeholder="Describe the quality issue observed..."
                  />
                </div>
              )}

              <p className="text-xs text-green-700 italic">
                * Assessment data will be submitted along with the complaint.
              </p>
            </div>
          )
        }

        <Section title="Upload Supporting Documents">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
                <span>Upload Documents</span>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-gray-500 italic">Max 5 files (Images, PDF, Doc)</span>
            </div>

            {/* ✅ SMALL FILE THUMBNAILS (NEAR BUTTON) */}
            {documents.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {documents.map((file, index) => {
                  const isImage = file.type.startsWith("image/");

                  return (
                    <div
                      key={index}
                      className="w-16 border rounded p-1 bg-gray-50 text-center relative group"
                    >
                      {/* Removal Button */}
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md hover:bg-red-600 transition-colors z-10"
                        title="Remove file"
                      >
                        ✕
                      </button>

                      {isImage ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 flex items-center justify-center text-xl">
                          📄
                        </div>
                      )}

                      <p
                        className="text-[9px] truncate mt-1 text-gray-600 font-medium"
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
        </Section>

        {
          complaintType === "ADR" && (
            <Section title="ADR Specific Documents">
              <div className="space-y-3 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                <label className="block text-sm font-bold text-orange-800 mb-1">
                  Upload Patient OPD Slip (PDF) *
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
                    <span>{opdSlip ? "Change OPD Slip" : "Upload OPD Slip"}</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setOpdSlip(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {opdSlip && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-xl">📄</span>
                      <span className="font-medium truncate max-w-[200px]">{opdSlip.name}</span>
                      <button
                        onClick={() => setOpdSlip(null)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-orange-600">This document is mandatory for Adverse Drug Reaction complaints.</p>
              </div>
            </Section>
          )
        }


        <div className="text-right">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Submit Complaint
          </button>
        </div>
      </div >
    </div >
  );
}

/* ---------------- REUSABLE UI ---------------- */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-medium mb-3">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function ReadOnlyInput({ label, value }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight">{label}</label>
      <div className="border border-blue-100 px-4 py-2.5 w-full rounded-lg bg-blue-50/50 text-blue-900 font-medium italic shadow-sm">
        {value || <span className="text-gray-400 font-normal">N/A</span>}
      </div>
    </div>
  );
}

function DropdownInput({ label, value, results, onChange, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="border px-3 py-2 w-full rounded"
      />
      {open && results.length > 0 && (
        <div className="absolute bg-white border w-full mt-1 rounded shadow z-10">
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => {
                onSelect(r);
                setOpen(false);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

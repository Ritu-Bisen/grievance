import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
    warehouseBatch: "WH-001",
    mfg: "2024-01-10",
    exp: "2026-01-09",
    purchase: "2024-02-01",
    quantity: 500,
  },
  {
    batchNo: "BATCH002",
    warehouseBatch: "WH-002",
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
          <TypeCard
            title="ADR Reaction"
            description="Adverse drug reactions or side effects"
            icon={FaHeartbeat}
            onClick={() => setSelectedType("ADR")}
          />
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
      <div className="text-3xl  mt-1">
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

  const [facilityQuery, setFacilityQuery] = useState("");
  const [facility, setFacility] = useState(null);

  const [itemCodeQuery, setItemCodeQuery] = useState("");
  const [item, setItem] = useState(null);

  const [batchQuery, setBatchQuery] = useState("");
  const [batch, setBatch] = useState(null);

  const [category, setCategory] = useState("");
  const [qty, setQty] = useState("");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState([]);

  const facilityResults = facilities.filter(f =>
    f.name.toLowerCase().includes(facilityQuery.toLowerCase())
  );

  const itemResults = items.filter(i =>
    i.code.toLowerCase().includes(itemCodeQuery.toLowerCase())
  );

  const batchResults = batches.filter(b =>
    b.batchNo.toLowerCase().includes(batchQuery.toLowerCase())
  );

  const handleFileChange = (e) => {
    setDocuments(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    try {
      if (
        !facility ||
        !item ||
        !batch ||
        !category ||
        !qty ||
        !description.trim() ||
        documents.length === 0
      ) {
        alert("Please fill all mandatory fields");
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

      const res = await axios.post(
        "http://localhost:5000/api/grievance/complaint-user/create",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const complaintCode = res.data.complaint_code;
      alert("Complaint submitted successfully");
      navigate(`/complaint/dispatch/${complaintCode}`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit complaint");
    }
  };

  return (
    <div className="bg-white border rounded">
      <div className="bg-blue-50 px-4 py-3 font-medium">{title}</div>

      <div className="p-6 space-y-6">

        <Section title="Facility Details">
          <DropdownInput
            label="Facility Name *"
            value={facilityQuery}
            onChange={(v) => {
              setFacilityQuery(v);
              setFacility(null);
            }}
            results={facilityResults.map(f => f.name)}
            onSelect={(name) => {
              const f = facilities.find(x => x.name === name);
              setFacility(f);
              setFacilityQuery(f.name);
            }}
          />
          <ReadOnlyInput label="Facility Address *" value={facility?.address || ""} />
        </Section>

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
          <ReadOnlyInput label="Warehouse Batch No" value={batch?.warehouseBatch || ""} />
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
            <label className="block text-sm mb-1">Description / Remarks *</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border px-3 py-2 w-full rounded resize-none"
            />
          </div>
        </Section>

        <Section title="Upload Supporting Documents">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="
              file:bg-orange-500
              file:text-white
              file:px-4
              file:py-2
              file:rounded
              file:border-0
              hover:file:bg-orange-600
              cursor-pointer
            "
          />
        </Section>

        <div className="text-right">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Submit Complaint
          </button>
        </div>
      </div>
    </div>
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
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        disabled
        value={value}
        className="border px-3 py-2 w-full rounded bg-gray-100"
      />
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

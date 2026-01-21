import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GovHeader from "../../components/GovHeader";
import {
  FaWarehouse,
  FaBoxOpen,
  FaExclamationTriangle,
  FaFlask
} from "react-icons/fa";

export default function WarehouseDashboard() {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */

  const [complaints, setComplaints] = useState([]);

  const [complaintCode, setComplaintCode] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredIds, setFilteredIds] = useState([]);

  /* ---------------- LOAD DASHBOARD ---------------- */

  const loadDashboard = async (complaintType = "") => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/grievance/warehouse/dashboard",
        {
          params: {
            complaintCode,
            status,
            fromDate,
            toDate,
            complaintType,
            _t: Date.now()
          },
          headers: {
            "Cache-Control": "no-cache"
          }
        }
      );

      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load warehouse dashboard");
    }
  };

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ---------------- CLEAR FILTERS ---------------- */

  const clearFilters = () => {
    setComplaintCode("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setShowDropdown(false);
    setFilteredIds([]);
    loadDashboard();
  };

  /* ---------------- COMPLAINT ID SEARCH ---------------- */

  const handleComplaintSearchChange = (value) => {
    setComplaintCode(value);
    setShowDropdown(true);

    if (!value) {
      setFilteredIds(complaints);
      return;
    }

    const matches = complaints.filter((c) =>
      c.complaint_code?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredIds(matches);
  };

  /* ---------------- STATUS CONFIG (🔥 IMPORTANT) ---------------- */

  const SAMPLE_RECEIVED_ALLOWED = [
    "SAMPLE_DISPATCHED_FACILITY",
    "SAMPLE_DISPATCHED",
    "SAMPLE_DISPATCHED_BY_FACILITY"
  ];

  const DISABLE_WAREHOUSE_ACTION = [
    "SUBMITTED",
    "RESOLVED",
    "SAMPLE_DISPATCHED_WH",
    "REJECTED_WH"
  ];

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-100">
      <GovHeader />

      <div className="max-w-7xl mx-auto p-6">

        {/* WELCOME */}
        <div className="bg-green-50 border border-green-200 rounded px-6 py-4 mb-6 flex items-center gap-3">
          <FaWarehouse className="text-green-800 text-2xl" />
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome to Warehouse Dashboard
          </h2>
        </div>

        {/* QUICK FILTERS */}
        <div className="bg-green-50 border border-green-200 rounded p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <button
              onClick={() => loadDashboard("PHYSICAL")}
              className="flex items-center justify-center gap-3 bg-green-800 text-white font-bold py-4 rounded hover:bg-green-900"
            >
              <FaBoxOpen />
              Physical
            </button>

            <button
              onClick={() => loadDashboard("ADR")}
              className="flex items-center justify-center gap-3 bg-green-800 text-white font-bold py-4 rounded hover:bg-green-900"
            >
              <FaExclamationTriangle />
              ADR
            </button>

            <button
              onClick={() => loadDashboard("QUALITY")}
              className="flex items-center justify-center gap-3 bg-green-800 text-white font-bold py-4 rounded hover:bg-green-900"
            >
              <FaFlask />
              Poor Quality
            </button>

          </div>
        </div>

        {/* FILTER CARD */}
        <div className="bg-green-50 border border-green-200 rounded p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div className="relative">
              <label className="text-sm font-medium">Complaint ID</label>
              <input
                value={complaintCode}
                onChange={(e) => handleComplaintSearchChange(e.target.value)}
                onFocus={() => {
                  setShowDropdown(true);
                  setFilteredIds(complaints);
                }}
                className="border px-3 py-2 w-full rounded bg-white"
                placeholder="Enter Complaint ID"
              />

              {showDropdown && filteredIds.length > 0 && (
                <div className="absolute bg-white border w-full mt-1 rounded shadow z-10 max-h-40 overflow-y-auto">
                  {filteredIds.map((c) => (
                    <div
                      key={c.complaint_code}
                      onClick={() => {
                        setComplaintCode(c.complaint_code);
                        setShowDropdown(false);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {c.complaint_code}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border px-3 py-2 w-full rounded bg-white"
              >
                <option value="">All</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="SAMPLE_DISPATCHED_FACILITY">
                  Sample Dispatched (Facility)
                </option>
                <option value="SAMPLE_RECEIVED_WH">
                  Sample Received (Warehouse)
                </option>
                <option value="IN_PROGRESS_WH">
                  In Progress (Warehouse)
                </option>
                <option value="REJECTED_WH">
                  Rejected (Warehouse)
                </option>
                <option value="SAMPLE_DISPATCHED_WH">
                  Sample Dispatched (Warehouse)
                </option>
                <option value="SAMPLE_RECEIVED_QC">
                  Sample Received (QC)
                </option>
                <option value="IN_PROGRESS_QC">
                  In Progress (QC)
                </option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border px-3 py-2 w-full rounded bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border px-3 py-2 w-full rounded bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={clearFilters}
              className="bg-orange-500 text-white px-6 py-2 rounded"
            >
              Clear Filters
            </button>

            <button
              onClick={() => loadDashboard()}
              className="bg-orange-500 text-white px-6 py-2 rounded"
            >
              Apply
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="p-3">Complaint ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3">Facility</th>
                <th className="p-3">Item</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Warehouse</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">View</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {complaints.length === 0 && (
                <tr>
                  <td colSpan="11" className="p-6 text-center text-gray-500">
                    No complaints found
                  </td>
                </tr>
              )}

              {complaints.map((c) => {
                const disableAction = DISABLE_WAREHOUSE_ACTION.includes(c.status);

                return (
                  <tr key={c.complaint_code} className="border-t">
                    <td className="p-3">{c.complaint_code}</td>
                    <td className="p-3">{c.complaint_type}</td>
                    <td className="p-3">{c.category}</td>
                    <td className="p-3">{c.facility_name}</td>
                    <td className="p-3">{c.item_name}</td>
                    <td className="p-3">{c.batch_no}</td>
                    <td className="p-3">{c.warehouse_code}</td>
                    <td className="p-3">{c.status}</td>
                    <td className="p-3">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-3 space-y-1">
                      <button
                        onClick={() =>
                          navigate(`/complaint/view/${c.complaint_code}`)
                        }
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs w-full"
                      >
                        View (Facility)
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/warehouse/view/${c.complaint_code}`)
                        }
                        className="bg-indigo-600 text-white px-3 py-1 rounded text-xs w-full"
                      >
                        View (Warehouse)
                      </button>
                    </td>

                    <td className="p-3">
                      <button
                        disabled={disableAction}
                        onClick={() => {
                          console.log("STATUS:", c.status);

                          if (SAMPLE_RECEIVED_ALLOWED.includes(c.status)) {
                            navigate(
                              `/warehouse/sample-received/${c.complaint_code}`
                            );
                          } else {
                            navigate(
                              `/warehouse/action/${c.complaint_code}`
                            );
                          }
                        }}
                        className={`px-3 py-1 rounded text-xs text-white w-full ${
                          disableAction
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-500"
                        }`}
                      >
                        Warehouse Action
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

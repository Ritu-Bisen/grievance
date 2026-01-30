/* ============================================================= */
/*                  WAREHOUSE DASHBOARD                          */
/* ============================================================= */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import GovHeader from "../../components/GovHeader";

import {
  FaWarehouse,
  FaBoxOpen,
  FaHeartbeat,
  FaExclamationTriangle
} from "react-icons/fa";

/* ============================================================= */
/*                       COMPONENT                               */
/* ============================================================= */

export default function WarehouseDashboard() {
  const navigate = useNavigate();

  /* ======================= STATE ============================== */

  const [complaints, setComplaints] = useState([]);

  const [complaintCode, setComplaintCode] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredIds, setFilteredIds] = useState([]);

  /* =================== LOAD DASHBOARD ========================= */

  const loadDashboard = async (complaintType = "") => {
    try {
      const res = await api.get("/grievance/warehouse/dashboard", {
        params: {
          complaintCode,
          status,
          fromDate,
          toDate,
          complaintType,
          _t: Date.now()
        }
      });

      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error("WAREHOUSE DASHBOARD ERROR:", err);
      alert("Failed to load warehouse dashboard");
    }
  };

  /* =================== INITIAL LOAD =========================== */

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =================== CLEAR FILTERS ========================== */

  const clearFilters = () => {
    setComplaintCode("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setShowDropdown(false);
    setFilteredIds([]);
    loadDashboard();
  };

  /* ================= COMPLAINT SEARCH ========================= */

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

  /* ================= STATUS CONFIG ============================ */

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

  /* =========================== UI ============================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-orange-50">
      <GovHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* ================= WELCOME ================= */}
        <div className="flex items-center gap-4 bg-white shadow-lg border-l-8 border-green-700 rounded-lg px-6 py-4">
          <FaWarehouse className="text-green-800 text-3xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Warehouse Dashboard
            </h2>
            <p className="text-sm text-gray-500">
              Manage & process warehouse complaints
            </p>
          </div>
        </div>

        {/* ================= QUICK FILTERS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => loadDashboard("PHYSICAL")}
            className="bg-gradient-to-r from-green-700 to-green-900 text-white py-5 rounded-xl shadow-lg hover:scale-105 transition"
          >
            <FaBoxOpen className="mx-auto text-2xl mb-2" />
            <span className="font-bold">Physical</span>
          </button>

          <button
            onClick={() => loadDashboard("ADR")}
            className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-5 rounded-xl shadow-lg hover:scale-105 transition"
          >
            <FaHeartbeat className="mx-auto text-2xl mb-2" />
            <span className="font-bold">ADR</span>
          </button>

          <button
            onClick={() => loadDashboard("QUALITY")}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-5 rounded-xl shadow-lg hover:scale-105 transition"
          >
            <FaExclamationTriangle className="mx-auto text-2xl mb-2" />
            <span className="font-bold">Poor Quality</span>
          </button>
        </div>

        {/* ================= FILTER CARD ================= */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 border-b pb-2">
            Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Complaint ID */}
            <div className="relative">
              <label className="text-sm font-medium">Complaint ID</label>
              <input
                value={complaintCode}
                onChange={(e) => handleComplaintSearchChange(e.target.value)}
                onFocus={() => {
                  setShowDropdown(true);
                  setFilteredIds(complaints);
                }}
                className="border px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-green-600"
                placeholder="Enter Complaint ID"
              />

              {showDropdown && filteredIds.length > 0 && (
                <div className="absolute bg-white border w-full mt-1 rounded-lg shadow-xl z-20 max-h-40 overflow-y-auto">
                  {filteredIds.map((c) => (
                    <div
                      key={c.complaint_code}
                      onClick={() => {
                        setComplaintCode(c.complaint_code);
                        setShowDropdown(false);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-green-50"
                    >
                      {c.complaint_code}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border px-3 py-2 w-full rounded-lg"
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

            {/* Dates */}
            <div>
              <label className="text-sm font-medium">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border px-3 py-2 w-full rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border px-3 py-2 w-full rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={clearFilters}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg"
            >
              Clear
            </button>
            <button
              onClick={() => loadDashboard()}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg shadow"
            >
              Apply
            </button>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-orange-500 text-white">
              <tr>
                {[
                  "Complaint ID","Type","Category","Facility","Item",
                  "Batch","Warehouse","Status","Date","View","Action"
                ].map(h => (
                  <th key={h} className="p-3 text-left">{h}</th>
                ))}
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

              {complaints.map((c, i) => (
                <tr
                  key={c.complaint_code}
                  className={`border-t hover:bg-orange-50 ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="p-3 font-medium">{c.complaint_code}</td>
                  <td className="p-3">{c.complaint_type}</td>
                  <td className="p-3">{c.category}</td>
                  <td className="p-3">{c.facility_name}</td>
                  <td className="p-3">{c.item_name}</td>
                  <td className="p-3">{c.batch_no}</td>
                  <td className="p-3">{c.warehouse_code}</td>
                  <td className="p-3">
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>

                  {/* VIEW */}
                  <td className="p-3">
                    <button
                      onClick={() =>
                        navigate(`/warehouse/assessment/view/${c.complaint_code}`)
                      }
                      className="bg-indigo-600 text-white px-3 py-1 rounded text-xs w-full"
                    >
                      View
                    </button>
                  </td>

                  {/* ACTION (PURE LOGIC SAME) */}
                  <td className="p-3">
                    <button
                      disabled={DISABLE_WAREHOUSE_ACTION.includes(c.status)}
                      onClick={() => {

                        if (SAMPLE_RECEIVED_ALLOWED.includes(c.status)) {
                          navigate(`/warehouse/sample-received/${c.complaint_code}`);
                          return;
                        }

                        if (c.status === "SAMPLE_RECEIVED_WH") {
                          navigate(`/warehouse/approve-reject/${c.complaint_code}`);
                          return;
                        }

                        if (c.status === "IN_PROGRESS_WH") {
                          api
                            .get(`/grievance/warehouse/assessment/view/${c.complaint_code}`)
                            .then((res) => {
                              const assessment = res.data.assessment;

                              if (!assessment) {
                                if (c.complaint_type === "PHYSICAL") {
                                  navigate(`/warehouse/action/physical/${c.complaint_code}`);
                                } else if (c.complaint_type === "ADR") {
                                  navigate(`/warehouse/action/adr/${c.complaint_code}`);
                                } else {
                                  navigate(`/warehouse/action/quality/${c.complaint_code}`);
                                }
                                return;
                              }

                              if (c.complaint_type === "PHYSICAL") {
                                navigate(`/warehouse/action/resolve/${c.complaint_code}`);
                              } else {
                                navigate(`/warehouse/action/dispatch/${c.complaint_code}`);
                              }
                            })
                            .catch(() =>
                              alert("Unable to check warehouse assessment")
                            );
                        }
                      }}
                      className={`px-3 py-1 rounded text-xs text-white w-full ${
                        DISABLE_WAREHOUSE_ACTION.includes(c.status)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-600"
                      }`}
                    >
                      Warehouse Action
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

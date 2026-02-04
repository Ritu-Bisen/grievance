import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

import GovHeader from "../../components/GovHeader";
import { FaPlusCircle, FaHospital } from "react-icons/fa";

export default function ComplaintUserDashboard() {
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

  const loadDashboard = () => {
    const token = localStorage.getItem("token");

    api
      .get("/grievance/complaint-user/dashboard", {
        params: {
          complaintCode,
          status,
          fromDate,
          toDate,
        },
      })
      .then((res) => {
        setComplaints(res.data.complaints || []);
      })
      .catch(() => {
        alert("Failed to load dashboard");
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ---------------- CLEAR FILTERS ---------------- */

  const clearFilters = () => {
    const token = localStorage.getItem("token");

    setComplaintCode("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setShowDropdown(false);
    setFilteredIds([]);

    api
      .get("/grievance/complaint-user/dashboard")
      .then((res) => {
        setComplaints(res.data.complaints || []);
      })
      .catch(() => {
        alert("Failed to load dashboard");
      });
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

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-orange-50">
      <GovHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* WELCOME + RAISE */}
        <div className="flex items-center justify-between bg-white shadow-lg border-l-8 border-green-700 rounded-lg px-6 py-4">
          <div className="flex items-center gap-3">
            <FaHospital className="text-green-800 text-3xl" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Facility Dashboard
              </h2>
              <p className="text-sm text-gray-500">
                Track & manage your complaints
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/complaint/select-type")}
            className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-8 py-3 rounded-lg flex items-center gap-2 shadow hover:scale-105 transition"
          >
            <FaPlusCircle />
            Raise New Complaint
          </button>
        </div>

        {/* FILTER CARD */}
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
                      className="px-3 py-2 cursor-pointer hover:bg-green-50 text-sm"
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
                className="border px-3 py-2 w-full rounded-lg bg-white"
              >
                <option value="">All</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="SAMPLE_DISPATCHED_FACILITY">Sample Dispatched (Facility)</option>
                <option value="SAMPLE_RECEIVED_WH">Sample Received (Warehouse)</option>
                <option value="IN_PROGRESS_WH">In Progress (Warehouse)</option>
                <option value="REJECTED_WH">Rejected (Warehouse)</option>
                <option value="SAMPLE_DISPATCHED_WH">Sample Dispatched (Warehouse)</option>
                <option value="SAMPLE_RECEIVED_QC">Sample Received (QC)</option>
                <option value="IN_PROGRESS_QC">In Progress (QC)</option>
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
                className="border px-3 py-2 w-full rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border px-3 py-2 w-full rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={clearFilters}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg"
            >
              Clear Filters
            </button>
            <button
              onClick={loadDashboard}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg shadow hover:bg-orange-600"
            >
              Apply
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <tr>
                <th className="p-3">Complaint ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3">Facility</th>
                <th className="p-3">Item</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">View</th>
                <th className="p-3">Sample Dispatch</th>
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
                  className={`border-t hover:bg-orange-50 transition ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="p-3 font-medium">{c.complaint_code}</td>
                  <td className="p-3">{c.complaint_type}</td>
                  <td className="p-3">{c.category}</td>
                  <td className="p-3">{c.facility_name}</td>
                  <td className="p-3">{c.item_name}</td>
                  <td className="p-3">{c.batch_no}</td>
                  <td className="p-3">{c.affected_quantity}</td>
                  <td className="p-3">
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() =>
                        navigate(`/complaint/view/${c.complaint_code}`)
                      }
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                    >
                      View
                    </button>
                  </td>

                  <td className="p-3">
                    {c.status === "SUBMITTED" && (
                      <button
                        onClick={() =>
                          navigate(`/complaint/dispatch/${c.complaint_code}`)
                        }
                        className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600"
                      >
                        Dispatch Sample
                      </button>
                    )}

                    {[
                      "SAMPLE_DISPATCHED_FACILITY",
                      "SAMPLE_RECEIVED_WH",
                      "IN_PROGRESS_WH",
                      "SAMPLE_DISPATCHED_WH",
                      "SAMPLE_RECEIVED_QC",
                      "IN_PROGRESS_QC",
                      "RESOLVED",
                      "REJECTED_WH",
                    ].includes(c.status) && (
                      <span className="text-green-700 text-xs font-semibold">
                        Sample Dispatched
                      </span>
                    )}
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

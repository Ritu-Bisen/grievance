import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GovHeader from "../../components/GovHeader";

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
    axios
      .get("http://localhost:5000/api/grievance/complaint-user/dashboard", {
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
    setComplaintCode("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setShowDropdown(false);
    setFilteredIds([]);

    axios
      .get("http://localhost:5000/api/grievance/complaint-user/dashboard")
      .then((res) => {
        setComplaints(res.data.complaints || []);
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
    <div className="min-h-screen bg-gray-100">
      <GovHeader>
        <button
          onClick={() => navigate("/complaint/select-type")}
          className="bg-orange-500 text-white px-5 py-2 rounded"
        >
          Raise New Complaint
        </button>
      </GovHeader>

      <div className="max-w-7xl mx-auto p-6">

        {/* FILTER CARD */}
        <div className="bg-green-50 border border-green-200 rounded p-6 mb-6">
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

            {/* STATUS FILTER */}
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border px-3 py-2 w-full rounded bg-white"
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
              onClick={loadDashboard}
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

              {complaints.map((c) => (
                <tr key={c.complaint_code} className="border-t">
                  <td className="p-3">{c.complaint_code}</td>
                  <td className="p-3">{c.complaint_type}</td>
                  <td className="p-3">{c.category}</td>
                  <td className="p-3">{c.facility_name}</td>
                  <td className="p-3">{c.item_name}</td>
                  <td className="p-3">{c.batch_no}</td>
                  <td className="p-3">{c.affected_quantity}</td>
                  <td className="p-3">{c.status}</td>
                  <td className="p-3">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>

                  {/* VIEW */}
                  <td className="p-3">
                    <button
                      onClick={() =>
                        navigate(`/complaint/view/${c.complaint_code}`)
                      }
                      className="!bg-blue-600 !text-white px-3 py-1 rounded text-xs hover:!bg-blue-700"
                    >
                      View
                    </button>
                  </td>

                  {/* SAMPLE DISPATCH */}
                  <td className="p-3">
                    {c.status === "SUBMITTED" && (
                      <button
                        onClick={() =>
                          navigate(`/complaint/dispatch/${c.complaint_code}`)
                        }
                        className="bg-orange-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Dispatch Sample
                      </button>
                    )}

                    {c.status === "SAMPLE_DISPATCHED_FACILITY" && (
                      <span className=" text-green-700 px-3 py-1 rounded text-xs font-medium">
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComplaints } from '../../api/complaintsApi';
import GovHeader from "../../components/GovHeader";

export default function ComplaintUserDashboard() {
  const navigate = useNavigate();

  // Data
  const [complaints, setComplaints] = useState([]);

  // Filters
  const [complaintCode, setComplaintCode] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Search dropdown
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line
  }, []);

  const loadDashboard = async () => {
    try {
      const filters = {
        complaintCode,
        status,
        category,
        fromDate,
        toDate
      };
      const res = await fetchComplaints(filters);
      setComplaints(res.complaints || []);
    } catch (err) {
      alert("Failed to load dashboard");
    }
  };

  // 🔍 Complaint ID dropdown logic
  const handleSearchChange = (value) => {
    setComplaintCode(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const matches = complaints.filter((c) =>
      c.complaint_code
        ?.toLowerCase()
        .includes(value.toLowerCase())
    );

    setSuggestions(matches);
  };

  const handleSelectSuggestion = (code) => {
    setComplaintCode(code);
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <GovHeader/>
      


      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/complaint/select-type")}
            className="bg-orange-500 text-white px-5 rounded hover:opacity-90"
          >
            Raise New Complaint
          </button>
        </div>

        {/* FILTER CARD */}
        <div className="bg-white rounded-2xl   p-6 mb-6 shadow-sm">

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">

            {/* Complaint ID Search */}
            <div className="relative">
              <label className="block text-xs font-medium mb-1">Complaint ID</label>
              <input
                value={complaintCode}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="border px-2 py-1 w-full rounded text-xs"
                placeholder="Search Complaint ID"
              />
              {complaintCode && (
                <div className="absolute bg-white border w-full mt-1 z-10 max-h-32 overflow-y-auto rounded shadow">
                  {suggestions.length > 0 ? (
                    suggestions.map((c) => (
                      <div
                        key={c.complaint_code}
                        onClick={() => handleSelectSuggestion(c.complaint_code)}
                        className="px-2 py-1 cursor-pointer hover:bg-gray-100 text-xs"
                      >
                        {c.complaint_code}
                      </div>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-gray-500 text-xs">
                      Complaint ID not available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border px-2 py-1 w-full rounded text-xs"
              >
                <option value="">All</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border px-2 py-1 w-full rounded text-xs"
              >
                <option value="">All</option>
                <option value="Side Effects">Side Effects</option>
                <option value="Packaging Damage">Packaging Damage</option>
                <option value="Cap Damage">Cap Damage</option>
                <option value="Quality Issues">Quality Issues</option>
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-xs font-medium mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border px-2 py-1 w-full rounded text-xs"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs font-medium mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border px-2 py-1 w-full rounded text-xs"
              />
            </div>
          </div>

          <div className="text-right mt-3">
            <button
              onClick={loadDashboard}
              className="bg-orange-500 text-white px-4 py-1 rounded text-xs"
            >
              Apply
            </button>
          </div>
        </div>

        {/* COMPLAINTS TITLE */}
        <h3 className="text-orange-600 font-semibold mb-3 text-lg">
          Complaints
        </h3>

        {/* TABLE */}
        <div className="bg-white border rounded shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="p-2 text-left">Complaint ID</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Item</th>
                <th className="p-2 text-left">Facility</th>
                <th className="p-2 text-left">Affected Qty</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="p-4 text-center text-gray-500"
                  >
                    No complaints found
                  </td>
                </tr>
              )}
              {complaints.map((c) => (
                <tr
                  key={c.complaint_code}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-2 font-medium">{c.complaint_code}</td>
                  <td className="p-2">{c.complaint_type}</td>
                  <td className="p-2">{c.category}</td>
                  <td className="p-2">{c.item_name}</td>
                  <td className="p-2">{c.facility_name}</td>
                  <td className="p-2">{c.affected_quantity}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      c.status === 'SUBMITTED' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : c.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {new Date(c.created_at).toLocaleDateString()}
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
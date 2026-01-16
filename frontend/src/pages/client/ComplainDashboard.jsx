import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GovHeader from "../../components/GovHeader";

export default function ComplaintUserDashboard() {
  const navigate = useNavigate();

  // Data
  const [complaints, setComplaints] = useState([]);

  // Filters
  const [complaintCode, setComplaintCode] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Search dropdown
  const [suggestions, setSuggestions] = useState([]);

  // useEffect(() => {
  //   loadDashboard();
  // }, []);

  // const loadDashboard = () => {
  //   axios
  //     .get("https://stnjr6z8-5000.euw.devtunnels.ms/", {
  //       params: {
  //         complaintCode,
  //         status,
  //         fromDate,
  //         toDate
  //       }
  //     })
  //     .then((res) => {
  //       setComplaints(res.data.complaints || []);
  //     })
  //     .catch(() => {
  //       alert("Failed to load dashboard");
  //     });
  // };

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
          <button
          onClick={() => navigate("/complaint/select-type")}
          className="bg-orange-500 text-white px-5  rounded hover:opacity-90"
        >
          Raise New Complaint
        </button>

        {/* FILTER CARD */}
        <div className="bg-white border rounded p-6 mb-6 shadow-sm">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Complaint ID Search */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Complaint ID
              </label>

              <input
                value={complaintCode}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="border px-3 py-2 w-full rounded"
                placeholder="Search Complaint ID"
              />

              {complaintCode && (
                <div className="absolute bg-white border w-full mt-1 z-10 max-h-40 overflow-y-auto rounded">
                  {suggestions.length > 0 ? (
                    suggestions.map((c) => (
                      <div
                        key={c.complaint_code}
                        onClick={() =>
                          handleSelectSuggestion(c.complaint_code)
                        }
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        {c.complaint_code}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">
                      Complaint ID not available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border px-3 py-2 w-full rounded"
              >
                <option value="">All</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border px-3 py-2 w-full rounded"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border px-3 py-2 w-full rounded"
              />
            </div>
          </div>

          <div className="text-right mt-5">
            <button
              // onClick={loadDashboard}
              className="bg-orange-500 text-white px-6 py-2 rounded"
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
        <div className="bg-white border rounded shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="p-3 text-left">Complaint ID</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {complaints.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="p-6 text-center text-gray-500"
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
                  <td className="p-3">{c.complaint_code}</td>
                  <td className="p-3">{c.complaint_type}</td>
                  <td className="p-3">{c.status}</td>
                  <td className="p-3">
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
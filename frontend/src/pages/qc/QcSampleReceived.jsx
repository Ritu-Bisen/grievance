import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import GovHeader from "../../components/GovHeader";

export default function QcSampleReceived() {
    const { code } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);

    /* ---------------- LOAD COMPLAINT ---------------- */

    const loadComplaint = async () => {
        const res = await api.get(`/grievance/complaint-user/view/${code}`);
        setComplaint(res.data);
    };

    useEffect(() => {
        loadComplaint();
    }, []);

    /* ---------------- RECEIVE SAMPLE ---------------- */

    const handleReceiveSample = async () => {
        setLoading(true);

        try {
            await api.post("/grievance/qc/receive-sample", {
                complaint_code: code
            });

            setLoading(false);
            setShowPopup(true);
            loadComplaint();
        } catch (err) {
            setLoading(false);
            alert("Failed to receive sample");
        }
    };

    if (!complaint) return null;

    /* ---------------- TIMELINE LOGIC ---------------- */

    const TOTAL_DAYS = 7;

    const getTimelineData = () => {
        const startDate = new Date(complaint.created_at);
        const today = new Date();

        const diffTime = today - startDate;
        const passedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const remainingDays = Math.max(TOTAL_DAYS - passedDays, 0);

        const progressPercent = Math.max(
            (remainingDays / TOTAL_DAYS) * 100,
            0
        );

        let barColor = "bg-green-600";

        if (remainingDays <= 3) {
            barColor = "bg-red-600";
        } else if (remainingDays <= 5) {
            barColor = "bg-orange-500";
        }

        return {
            remainingDays,
            progressPercent,
            barColor,
            startDate
        };
    };

    const timeline = getTimelineData();

    /* ---------------- UI ---------------- */

    return (
        <div className="min-h-screen bg-gray-100">
            <GovHeader />

            <div className="max-w-4xl mx-auto bg-white mt-6 p-6 rounded shadow">
                <div className="mb-4">
                    <button
                        onClick={() => navigate("/qc/dashboard")}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <h2 className="text-xl font-semibold mb-2">
                    Receive Sample – {complaint.complaint_code}
                </h2>

                {/* -------- SAMPLE RECEIPT TIMELINE -------- */}
                <div className="border rounded-lg p-4 mb-6 bg-white">
                    <div className="flex items-center gap-2 mb-3 text-gray-700 font-medium">
                        🕒 Sample Receipt Timeline
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
                        <div
                            className={`h-3 ${timeline.barColor}`}
                            style={{ width: `${timeline.progressPercent}%` }}
                        />
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                        <div>
                            Started: {timeline.startDate.toLocaleDateString()}
                        </div>
                        <div className="font-semibold">
                            {timeline.remainingDays} days remaining
                        </div>
                    </div>
                </div>

                {/* Complaint details */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div><b>Type:</b> {complaint.complaint_type}</div>
                    <div><b>Category:</b> {complaint.category}</div>
                    <div><b>Facility:</b> {complaint.facility_name}</div>
                    <div><b>Item:</b> {complaint.item_name}</div>
                    <div><b>Batch:</b> {complaint.batch_no}</div>
                    <div><b>Status:</b> {complaint.status}</div>
                </div>

                {/* Receive Sample button */}
                {complaint.status === "SAMPLE_DISPATCHED_WH" && (
                    <button
                        onClick={handleReceiveSample}
                        disabled={loading}
                        className="bg-purple-600 text-white px-6 py-3 rounded font-semibold hover:bg-purple-700"
                    >
                        {loading ? "Processing..." : "Receive Sample"}
                    </button>
                )}

                {/* Popup */}
                {showPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="bg-white p-6 rounded w-96 text-center">
                            <h3 className="font-semibold mb-4">
                                ✅ Sample received successfully
                            </h3>

                            <p className="text-sm mb-6">
                                Status moved to <b>SAMPLE_RECEIVED_QC</b>
                            </p>

                            <div className="flex justify-center">
                                <button
                                    onClick={() => navigate(`/qc/assessment-view/${code}`)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                >
                                    Proceed to View Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

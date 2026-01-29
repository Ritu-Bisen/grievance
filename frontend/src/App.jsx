import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

/* 🔐 AUTH */
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReportView from "./pages/admin/AdminReportView";


/* ================= WAREHOUSE ================= */
import WarehouseDashboard from "./pages/warehouse/WarehouseDashboard";
import WarehouseSampleReceived from "./pages/warehouse/WarehouseSampleReceived";
import WarehouseApproveReject from "./pages/warehouse/WarehouseApproveReject";
import WarehouseActionRedirect from "./pages/warehouse/WarehouseActionRedirect";
import PhysicalAssessmentPage from "./pages/warehouse/PhysicalAssessmentPage";
import ADRAssessmentPage from "./pages/warehouse/ADRAssessmentPage";
import QualityAssessmentPage from "./pages/warehouse/QualityAssessmentPage";
import WarehouseAssessmentView from "./pages/warehouse/WarehouseAssessmentView";
import WarehouseAssessmentSubmitted from "./pages/warehouse/WarehouseAssessmentSubmitted";
import WarehouseResolveAction from "./pages/warehouse/WarehouseResolveAction";
import WarehouseDispatchSample from "./pages/warehouse/WarehouseDispatchSample";

/* ================= FACILITY ================= */
import ComplaintUserDashboard from "./pages/client/ComplaintUserDashboard";
import ComplaintTypeSelection from "./pages/client/ComplaintTypeSelection";
import ComplaintView from "./pages/client/ComplaintView";
import DispatchSample from "./pages/client/DispatchSample";

import "./App.css";


function App() {
  return (
    <>
      <Toaster position="top-right" richColors />

      <BrowserRouter>
        <Routes>

          {/* 🔐 LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* DEFAULT */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ================= WAREHOUSE ================= */}
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE"]}>
                <WarehouseDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/view/:code"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE"]}>
                <ComplaintView mode="WAREHOUSE_VIEW" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/action/:code"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE"]}>
                <WarehouseActionRedirect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/sample-received/:code"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE"]}>
                <WarehouseSampleReceived />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/approve-reject/:code"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE"]}>
                <WarehouseApproveReject />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/action/physical/:code"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE"]}>
                <PhysicalAssessmentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/action/adr/:code"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE"]}>
                <ADRAssessmentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/action/quality/:code"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE"]}>
                <QualityAssessmentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/assessment/submitted/:code"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE"]}>
                <WarehouseAssessmentSubmitted />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/action/resolve/:code"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE"]}>
                <WarehouseResolveAction />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/action/dispatch/:code"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE"]}>
                <WarehouseDispatchSample />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/assessment/view/:code"
            element={
              <ProtectedRoute allowedRoles={["WAREHOUSE"]}>
                <WarehouseAssessmentView />
              </ProtectedRoute>
            }
          />

          {/* ================= FACILITY ================= */}
          <Route
            path="/complaint/dashboard"
            element={
              <ProtectedRoute allowedRoles={["FACILITY"]}>
                <ComplaintUserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaint/select-type"
            element={
              <ProtectedRoute allowedRoles={["FACILITY"]}>
                <ComplaintTypeSelection />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaint/view/:code"
            element={
              <ProtectedRoute allowedRoles={["FACILITY"]}>
                <ComplaintView mode="FACILITY" />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/report/view/:code" element={<AdminReportView />} />


          <Route
            path="/complaint/dispatch/:complaintCode"
            element={
              <ProtectedRoute allowedRoles={["FACILITY"]}>
                <DispatchSample />
              </ProtectedRoute>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

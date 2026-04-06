import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../../LoginPage/LoginPage";
import ReportPage from "../../ReportPage/ReportPage";
import AdminDashboardPage from "../../AdminDashboardPage/AdminDashboardPage";
import ProtectedRoute from "../../ProtectedRoute/ProtectedRoute";
import Layout from "../../LayoutArea/Layout/Layout";
import MashkashDashboardPage from "../../MashkashDashboardPage/MashkashDashboardPage";
import ImportDevicesPage from "../../ImportDevicePage/ImportDevicePage";
import InventorySheetDetailsPage from "../../InventoryShhetDetailsPage/InventoryShhetDetailsPage";
import InventorySheetsPage from "../../InventorySheetsPage/InventorySheetsPage";

function Routing(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute allowedRoles={["regular", "mashkash", "admin"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/report" element={<ReportPage />} />

        <Route
          path="/mashkash-dashboard"
          element={
            <ProtectedRoute allowedRoles={["mashkash", "admin"]}>
              <MashkashDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/import-devices"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ImportDevicesPage />
          </ProtectedRoute>
        }
      />

      <Route path="/inventory-sheets" element={<InventorySheetsPage />} />

      <Route
        path="/inventory-sheets/:id"
        element={<InventorySheetDetailsPage />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default Routing;

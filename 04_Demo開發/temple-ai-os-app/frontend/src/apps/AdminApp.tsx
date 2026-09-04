import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminGate } from "../components/AdminGate";

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard").then((module) => ({ default: module.AdminDashboard })));
const AdminAccounts = lazy(() => import("../pages/admin/AdminAccounts").then((module) => ({ default: module.AdminAccounts })));
const AdminDeities = lazy(() => import("../pages/admin/AdminDeities").then((module) => ({ default: module.AdminDeities })));
const AdminEvents = lazy(() => import("../pages/admin/AdminEvents").then((module) => ({ default: module.AdminEvents })));
const AdminKnowledge = lazy(() => import("../pages/admin/AdminKnowledge").then((module) => ({ default: module.AdminKnowledge })));
const AdminNotifications = lazy(() => import("../pages/admin/AdminNotifications").then((module) => ({ default: module.AdminNotifications })));
const AdminRelease = lazy(() => import("../pages/admin/AdminRelease").then((module) => ({ default: module.AdminRelease })));
const AdminSupport = lazy(() => import("../pages/admin/AdminSupport").then((module) => ({ default: module.AdminSupport })));

export default function AdminApp() {
  return (
    <Suspense fallback={<div className="route-loading">載入中</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminGate><AdminDashboard /></AdminGate>} />
        <Route path="/admin/events" element={<AdminGate><AdminEvents /></AdminGate>} />
        <Route path="/admin/deities" element={<AdminGate><AdminDeities /></AdminGate>} />
        <Route path="/admin/knowledge" element={<AdminGate><AdminKnowledge /></AdminGate>} />
        <Route path="/admin/support" element={<AdminGate><AdminSupport /></AdminGate>} />
        <Route path="/admin/notifications" element={<AdminGate><AdminNotifications /></AdminGate>} />
        <Route path="/admin/accounts" element={<AdminGate><AdminAccounts /></AdminGate>} />
        <Route path="/admin/release" element={<AdminGate><AdminRelease /></AdminGate>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  );
}

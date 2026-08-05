import { Navigate, Route, Routes } from "react-router-dom";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminEvents } from "./pages/admin/AdminEvents";
import { AdminKnowledge } from "./pages/admin/AdminKnowledge";
import { AdminNotifications } from "./pages/admin/AdminNotifications";
import { AdminSupport } from "./pages/admin/AdminSupport";
import { EventDetailPage } from "./pages/liff/EventDetailPage";
import { EventsPage } from "./pages/liff/EventsPage";
import { FortunePage } from "./pages/liff/FortunePage";
import { HomePage } from "./pages/liff/HomePage";
import { MemberPage } from "./pages/liff/MemberPage";
import { RegistrationPage } from "./pages/liff/RegistrationPage";
import { SupportPage } from "./pages/liff/SupportPage";
import { TourSpotPage } from "./pages/liff/TourSpotPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:eventId" element={<EventDetailPage />} />
      <Route path="/register/:eventId" element={<RegistrationPage />} />
      <Route path="/fortune" element={<FortunePage />} />
      <Route path="/tour/:code" element={<TourSpotPage />} />
      <Route path="/member" element={<MemberPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/events" element={<AdminEvents />} />
      <Route path="/admin/knowledge" element={<AdminKnowledge />} />
      <Route path="/admin/support" element={<AdminSupport />} />
      <Route path="/admin/notifications" element={<AdminNotifications />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const CommunityPage = lazy(() => import("../pages/public/CommunityPage").then((module) => ({ default: module.CommunityPage })));
const DeitiesPage = lazy(() => import("../pages/liff/DeitiesPage").then((module) => ({ default: module.DeitiesPage })));
const EventDetailPage = lazy(() => import("../pages/liff/EventDetailPage").then((module) => ({ default: module.EventDetailPage })));
const EventsPage = lazy(() => import("../pages/liff/EventsPage").then((module) => ({ default: module.EventsPage })));
const FortunePage = lazy(() => import("../pages/liff/FortunePage").then((module) => ({ default: module.FortunePage })));
const HomePage = lazy(() => import("../pages/liff/HomePage").then((module) => ({ default: module.HomePage })));
const LegalPage = lazy(() => import("../pages/public/LegalPage").then((module) => ({ default: module.LegalPage })));
const PublicSitePage = lazy(() => import("../pages/public/PublicSitePage").then((module) => ({ default: module.PublicSitePage })));
const RegistrationPage = lazy(() => import("../pages/liff/RegistrationPage").then((module) => ({ default: module.RegistrationPage })));
const StickerShopPage = lazy(() => import("../pages/liff/StickerShopPage").then((module) => ({ default: module.StickerShopPage })));
const SupportPage = lazy(() => import("../pages/liff/SupportPage").then((module) => ({ default: module.SupportPage })));
const TourSpotPage = lazy(() => import("../pages/liff/TourSpotPage").then((module) => ({ default: module.TourSpotPage })));

export default function PublicApp() {
  return (
    <Suspense fallback={<div className="route-loading">載入中</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/site" element={<PublicSitePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/privacy" element={<LegalPage kind="privacy" />} />
        <Route path="/terms" element={<LegalPage kind="terms" />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/deities" element={<DeitiesPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/register/:eventId" element={<RegistrationPage />} />
        <Route path="/fortune" element={<FortunePage />} />
        <Route path="/tour/:code" element={<TourSpotPage />} />
        <Route path="/member" element={<Navigate to="/events?lookup=1" replace />} />
        <Route path="/stickers" element={<StickerShopPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

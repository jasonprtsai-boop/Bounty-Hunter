import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  RotateCcw,
  Save,
  Sparkles
} from "lucide-react";
import { Shell } from "../../components/AdminShell";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import {
  defaultTempleSettings,
  getTempleSettings,
  resetTempleSettings,
  saveTempleSettings,
  type TempleSettings
} from "../../lib/templeSettings";

export function AdminSettings() {
  const [settings, setSettings] = useState<TempleSettings>(defaultTempleSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "hours" | "announcement" | "transit" | "services">("general");
  const { requestConfirmation, confirmDialog } = useConfirmDialog();

  useEffect(() => {
    setSettings(getTempleSettings());
  }, []);

  function handleChange<K extends keyof TempleSettings>(key: K, value: TempleSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSavedSuccess(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveTempleSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  }

  async function handleReset() {
    const ok = await requestConfirmation({
      title: "確認還原預設資訊？",
      body: "所有手動修改之廟務資訊、時間、公告與交通指南將還原為系統預設值。",
      confirmLabel: "確認還原",
      tone: "danger"
    });
    if (ok) {
      const reset = resetTempleSettings();
      setSettings(reset);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  }

  return (
    <Shell title="廟務基本設定">
      <div className="admin-page-header">
        <div>
          <span className="section-kicker">全域配置</span>
          <h2>廟務基本資訊與公告管理</h2>
          <p>在此維護前台首頁顯示之宮廟全銜、主神、開放時間、置頂公告、交通資訊與服務指引。</p>
        </div>
        <div className="admin-header-actions">
          <Link to="/" target="_blank" className="button">
            <ExternalLink size={16} /> 查看前台首頁
          </Link>
        </div>
      </div>

      {savedSuccess && (
        <div className="admin-alert-banner success" role="alert">
          <CheckCircle2 size={20} />
          <span>廟務資訊已成功儲存！前台首頁與各分頁已即時套用最新設定。</span>
        </div>
      )}

      {/* Settings Category Navigation */}
      <nav className="admin-settings-tabs" aria-label="設定分類">
        <button
          type="button"
          className={`settings-tab-btn${activeTab === "general" ? " is-active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          <Building2 size={17} /> 基本資料
        </button>
        <button
          type="button"
          className={`settings-tab-btn${activeTab === "hours" ? " is-active" : ""}`}
          onClick={() => setActiveTab("hours")}
        >
          <Clock size={17} /> 參拜開放時段
        </button>
        <button
          type="button"
          className={`settings-tab-btn${activeTab === "announcement" ? " is-active" : ""}`}
          onClick={() => setActiveTab("announcement")}
        >
          <Bell size={17} /> 即時公告跑馬燈
        </button>
        <button
          type="button"
          className={`settings-tab-btn${activeTab === "transit" ? " is-active" : ""}`}
          onClick={() => setActiveTab("transit")}
        >
          <MapPin size={17} /> 交通與停車指引
        </button>
        <button
          type="button"
          className={`settings-tab-btn${activeTab === "services" ? " is-active" : ""}`}
          onClick={() => setActiveTab("services")}
        >
          <Sparkles size={17} /> 服務說明與叮嚀
        </button>
      </nav>

      <form onSubmit={handleSave} className="admin-settings-form">
        {/* Tab 1: General Info */}
        {activeTab === "general" && (
          <section className="detail-panel admin-settings-card">
            <h3>宮廟全銜與基本資料</h3>
            <div className="form-grid">
              <label>
                廟宇全名
                <input
                  type="text"
                  required
                  value={settings.temple_name}
                  onChange={(e) => handleChange("temple_name", e.target.value)}
                  placeholder="例如：臺中萬春宮"
                />
              </label>
              <label>
                副標題 / 歷史稱號
                <input
                  type="text"
                  value={settings.sub_name}
                  onChange={(e) => handleChange("sub_name", e.target.value)}
                  placeholder="例如：藍興媽祖 ‧ 開基三百年"
                />
              </label>
              <label>
                主祀神尊稱全銜
                <input
                  type="text"
                  required
                  value={settings.main_deity}
                  onChange={(e) => handleChange("main_deity", e.target.value)}
                  placeholder="例如：天上聖母（開基藍興媽祖）"
                />
              </label>
              <label>
                服務諮詢電話
                <input
                  type="text"
                  required
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="例如：04-22245964"
                />
              </label>
              <label className="full-width">
                宮廟地址
                <input
                  type="text"
                  required
                  value={settings.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="例如：臺中市中區成功路212號"
                />
              </label>
              <label className="full-width">
                首頁簡介與歷史立基標語
                <textarea
                  rows={3}
                  value={settings.intro_summary}
                  onChange={(e) => handleChange("intro_summary", e.target.value)}
                  placeholder="顯示於前台首頁之核心建廟歷史與文化簡介"
                />
              </label>
            </div>
          </section>
        )}

        {/* Tab 2: Hours */}
        {activeTab === "hours" && (
          <section className="detail-panel admin-settings-card">
            <h3>參拜開放時段配置</h3>
            <div className="form-grid">
              <label>
                平日參拜時間
                <input
                  type="text"
                  value={settings.open_hours_weekday}
                  onChange={(e) => handleChange("open_hours_weekday", e.target.value)}
                  placeholder="例如：每日 06:30 - 20:30"
                />
              </label>
              <label>
                週末與例假日開放時間
                <input
                  type="text"
                  value={settings.open_hours_weekend}
                  onChange={(e) => handleChange("open_hours_weekend", e.target.value)}
                  placeholder="例如：週末與例假日 06:00 - 21:00"
                />
              </label>
              <label className="full-width">
                重大法會或特殊節日開放說明
                <input
                  type="text"
                  value={settings.open_hours_special}
                  onChange={(e) => handleChange("open_hours_special", e.target.value)}
                  placeholder="例如：逢初一、十五、媽祖聖誕或重大法會延長至 22:00"
                />
              </label>
            </div>
          </section>
        )}

        {/* Tab 3: Announcement */}
        {activeTab === "announcement" && (
          <section className="detail-panel admin-settings-card">
            <h3>首頁置頂即時公告</h3>
            <div className="form-grid">
              <label className="full-width admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.announcement_enabled}
                  onChange={(e) => handleChange("announcement_enabled", e.target.checked)}
                />
                <span>在前台首頁頂端啟用最新公告跑馬條</span>
              </label>
              <label>
                公告標籤
                <input
                  type="text"
                  value={settings.announcement_tag}
                  onChange={(e) => handleChange("announcement_tag", e.target.value)}
                  placeholder="例如：即時公告 / 法會提醒"
                />
              </label>
              <label>
                點擊跳轉連結
                <input
                  type="text"
                  value={settings.announcement_link}
                  onChange={(e) => handleChange("announcement_link", e.target.value)}
                  placeholder="例如：/events 或 /deities"
                />
              </label>
              <label className="full-width">
                公告內容文字
                <textarea
                  rows={3}
                  value={settings.announcement_text}
                  onChange={(e) => handleChange("announcement_text", e.target.value)}
                  placeholder="輸入要在首頁置頂顯示之重要通知或法會提醒"
                />
              </label>
            </div>
          </section>
        )}

        {/* Tab 4: Transit */}
        {activeTab === "transit" && (
          <section className="detail-panel admin-settings-card">
            <h3>交通路線與停車指引</h3>
            <div className="form-grid">
              <label className="full-width">
                大眾運輸交通指引（公車/火車/捷運）
                <textarea
                  rows={2}
                  value={settings.transit_bus}
                  onChange={(e) => handleChange("transit_bus", e.target.value)}
                  placeholder="搭乘公車或大眾運輸前來萬春宮之指引"
                />
              </label>
              <label className="full-width">
                自行開車停車指引
                <textarea
                  rows={2}
                  value={settings.transit_parking}
                  onChange={(e) => handleChange("transit_parking", e.target.value)}
                  placeholder="附近特約或公共停車場說明"
                />
              </label>
            </div>
          </section>
        )}

        {/* Tab 5: Service Notes */}
        {activeTab === "services" && (
          <section className="detail-panel admin-settings-card">
            <h3>線上服務說明與溫馨叮嚀</h3>
            <div className="form-grid">
              <label className="full-width">
                線上抽籤叮嚀與文化聲明
                <textarea
                  rows={2}
                  value={settings.service_notes_fortune}
                  onChange={(e) => handleChange("service_notes_fortune", e.target.value)}
                  placeholder="顯示於線上求籤頁之溫馨提醒"
                />
              </label>
              <label className="full-width">
                法會活動報名說明
                <textarea
                  rows={2}
                  value={settings.service_notes_events}
                  onChange={(e) => handleChange("service_notes_events", e.target.value)}
                  placeholder="顯示於活動報名頁之登記注意事項"
                />
              </label>
            </div>
          </section>
        )}

        {/* Form Actions */}
        <div className="admin-form-actions-bar">
          <button type="submit" className="button primary">
            <Save size={18} /> 儲存最新廟務設定
          </button>
          <button type="button" className="button danger-text" onClick={handleReset}>
            <RotateCcw size={16} /> 還原預設值
          </button>
        </div>
      </form>

      {confirmDialog}
    </Shell>
  );
}

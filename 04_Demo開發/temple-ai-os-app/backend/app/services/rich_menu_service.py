from typing import Any

from app.core.config import get_settings


class RichMenuService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def main_menu_payload(self) -> dict[str, Any]:
        base = self.settings.frontend_base_url.rstrip("/")
        return {
            "size": {"width": 2500, "height": 1686},
            "selected": True,
            "name": "Temple AI OS 主選單",
            "chatBarText": "Temple AI OS",
            "areas": [
                {
                    "bounds": {"x": 0, "y": 260, "width": 833, "height": 713},
                    "action": {"type": "message", "label": "AI 助手", "text": "我第一次來萬春宮，怎麼參拜？"},
                },
                {
                    "bounds": {"x": 833, "y": 260, "width": 834, "height": 713},
                    "action": {"type": "uri", "label": "活動中心", "uri": f"{base}/events"},
                },
                {
                    "bounds": {"x": 1667, "y": 260, "width": 833, "height": 713},
                    "action": {"type": "uri", "label": "文化抽籤", "uri": f"{base}/fortune"},
                },
                {
                    "bounds": {"x": 0, "y": 973, "width": 833, "height": 713},
                    "action": {"type": "uri", "label": "宮廟導覽", "uri": f"{base}/tour/main-hall"},
                },
                {
                    "bounds": {"x": 833, "y": 973, "width": 834, "height": 713},
                    "action": {"type": "uri", "label": "會員中心", "uri": f"{base}/member"},
                },
                {
                    "bounds": {"x": 1667, "y": 973, "width": 833, "height": 713},
                    "action": {"type": "uri", "label": "客服中心", "uri": f"{base}/support"},
                },
            ],
        }

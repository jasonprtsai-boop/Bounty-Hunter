export const templeExteriorImage =
  "https://travel.taichung.gov.tw/content/images/attractions/60331/640x480_attractions-image-reeo_rka6kg04vfs2xyzmw.jpg";

export const templePhotoGallery = [
  {
    src: templeExteriorImage,
    title: "萬春宮入口",
    label: "臺中觀旅",
    source: "臺中市政府觀光旅遊局 / 觀光多媒體開放資料",
    sourceUrl: "https://media.taiwan.net.tw/en-us/portal/travel/details/attraction_387000000a_000165"
  },
  {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Wanchun%20Temple%2C%20Taichung%2C%20Aug%202024.jpg?width=1600",
    title: "廟埕外觀",
    label: "Wikimedia",
    source: "Ralff Nestor Nacor / CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Wanchun_Temple,_Taichung,_Aug_2024.jpg"
  },
  {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/%E5%8F%B0%E4%B8%AD%E8%90%AC%E6%98%A5%E5%AE%AE.jpg?width=1600",
    title: "老城廟景",
    label: "Wikimedia",
    source: "Fcuk1203 / CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:%E5%8F%B0%E4%B8%AD%E8%90%AC%E6%98%A5%E5%AE%AE.jpg"
  },
  {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/%E8%90%AC%E6%98%A5%E5%AE%AE%E7%9F%B3%E7%8D%85.jpg?width=1200",
    title: "石獅細節",
    label: "Wikimedia",
    source: "Wikimedia Commons / CC BY-SA",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:%E8%90%AC%E6%98%A5%E5%AE%AE%E7%9F%B3%E7%8D%85.jpg"
  }
];

const assetVersion = "20260909-design8";
const asset = (path: string) => `${path}?v=${assetVersion}`;

export const visualAssets = {
  banners: {
    home: asset("/assets/banners/home.png"),
    events: asset("/assets/banners/events.png"),
    fortune: asset("/assets/banners/fortune.png"),
    jiao: asset("/assets/banners/jiao.png"),
    support: asset("/assets/banners/support.png"),
    tour: asset("/assets/banners/tour.png")
  },
  flex: {
    event: asset("/assets/flex/event-card.png"),
    festival: asset("/assets/flex/event-card-festival.png"),
    ritual: asset("/assets/flex/event-card-ritual.png"),
    guide: asset("/assets/flex/event-card-guide.png"),
    culture: asset("/assets/flex/event-card-culture.png"),
    calligraphy: asset("/assets/flex/event-card-calligraphy.png"),
    support: asset("/assets/flex/support-card.png"),
    fortune: asset("/assets/flex/fortune-card.png"),
    jiao: asset("/assets/flex/jiao-card.png")
  },
  richMenu: asset("/assets/rich-menu/main-2500x1686.png"),
  stickerMain: asset("/assets/stickers/spring-fortune-messenger/main.png")
};

export function eventVisualForText(text: string) {
  if (/法會|普度|祈福|服務|關聖|聖誕|佳辰/.test(text)) return visualAssets.flex.ritual;
  if (/導覽|第一次|參拜流程|動線/.test(text)) return visualAssets.flex.guide;
  if (/書法|筆墨/.test(text)) return visualAssets.flex.calligraphy;
  if (/文化|講堂|書法|教育|體驗/.test(text)) return visualAssets.flex.culture;
  if (/宮慶|週年|祭典/.test(text)) return visualAssets.flex.festival;
  return visualAssets.flex.festival;
}

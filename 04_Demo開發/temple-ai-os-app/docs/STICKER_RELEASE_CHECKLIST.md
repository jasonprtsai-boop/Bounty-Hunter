# Sticker release checklist

Last updated: 2026-08-14

## Current pack

- Pack name: `春福小使日常貼圖`
- Asset folder: `assets/stickers/spring-fortune-messenger/`
- Public preview folder: `frontend/public/assets/stickers/spring-fortune-messenger/`
- Sticker count: 8
- Main image: `main.png`, 240 x 240 PNG
- Chat tab image: `tab.png`, 96 x 74 PNG
- Sticker images: `sticker_*.png`, 370 x 320 PNG, transparent background
- LINE OA profile image: `assets/brand/line-oa-profile-v2.png`, 640 x 640 PNG
- LINE OA profile background: `assets/brand/line-oa-profile-background-v1.png`, 1080 x 720 PNG

## Submission order

1. Review ownership and wording.
   Confirm the mascot is treated as original project artwork. Do not claim this is an official Wan Chun Gong sticker set unless written authorization exists.

2. Create a new submission in LINE Creators Market.
   Choose static stickers and set the quantity to 8 before requesting review.

3. Upload images.
   Upload `main.png`, `tab.png`, and the 8 `sticker_*.png` files. Do not upload `preview-sheet.png`.

4. Use metadata draft.
   - Creator: `Temple AI OS Demo`
   - Sticker Title: `春福小使日常貼圖`
   - Description: `原創春福小使帶來日常問候、回覆與平安祝福，適合宮廟文化服務 Demo 的聊天情境。`
   - Copyright: `TempleAIOSDemo`

5. Request review.
   After review is requested, LINE may prevent changing the sticker count. Recheck all images before submission.

6. Publish after approval.
   Copy the LINE STORE / Sticker Shop sales URL.

7. Enable purchase button.
   Set frontend env var:

   ```text
   VITE_LINE_STICKER_STORE_URL=<approved LINE sticker sales URL>
   ```

   Rebuild and redeploy the frontend. The `/stickers` button will change from `審核後開放購買` to `前往購買`.

8. Change LINE OA profile image.
   In LINE Official Account Manager, upload `assets/brand/line-oa-profile-v2.png` as the profile image.
   Upload `assets/brand/line-oa-profile-background-v1.png` as the profile page background image.

9. Edit LINE business profile.
   Use `docs/LINE_BUSINESS_PROFILE_SETUP.md` or `/admin/release` for the exact business profile copy, public links, and release checklist. Keep the Demo disclaimer visible unless the temple has provided written authorization for official use.

## Official spec notes

- Static sticker packs can contain 8, 16, 24, 32, or 40 stickers.
- Main image: 240 x 240 PNG.
- Sticker image: up to 370 x 320 PNG, transparent background.
- Chat tab image: 96 x 74 PNG.
- Use RGB color, at least 72 dpi, even-numbered width/height, and keep each image under 1 MB.
- LINE recommends about 10 px margin around trimmed sticker content.
- LINE OA profile image commonly uses JPG/JPEG/PNG, up to 3 MB, recommended 640 x 640 px.

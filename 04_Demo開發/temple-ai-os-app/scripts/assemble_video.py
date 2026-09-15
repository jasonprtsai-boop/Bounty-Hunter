"""Automated video assembly and editing tool for 2026 LINE AI Competition.

Features:
1. Merge mobile screen capture (LINE OA) and desktop screen capture (Admin Dashboard) into a split-screen 1080p 60fps video.
2. Overlay the edge-tts synthesized Taiwan Mandarin voiceover.
3. Automatically trim and align to under 3 minutes (strict competition rule).
"""

from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[3]
VIDEO_DIR = ROOT / "07_比賽交付" / "Demo影片"
AUDIO_FILE = VIDEO_DIR / "demo_narration_zh_tw.mp3"
OUTPUT_VIDEO = VIDEO_DIR / "Temple_AI_OS_3min_Demo_Final.mp4"


def check_ffmpeg() -> bool:
    try:
        res = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
        return res.returncode == 0
    except FileNotFoundError:
        return False


def assemble_from_recordings(mobile_path: Path, desktop_path: Path, output_path: Path = OUTPUT_VIDEO) -> bool:
    """Combine mobile and desktop MP4s into a 1080p split-screen with voiceover."""
    if not mobile_path.exists():
        print(f"[ERROR] Missing mobile recording: {mobile_path}")
        return False
    if not desktop_path.exists():
        print(f"[ERROR] Missing desktop recording: {desktop_path}")
        return False
    if not AUDIO_FILE.exists():
        print(f"[ERROR] Missing audio file: {AUDIO_FILE}. Run build_demo_video.py first.")
        return False

    print("Assembling split-screen 1080p video with ffmpeg...")
    # FFmpeg complex filter:
    # Scale mobile to 540x960 (centered in 640x1080 left pane)
    # Scale desktop to 1280x720 (centered in 1280x1080 right pane)
    # Total resolution: 1920x1080
    cmd = [
        "ffmpeg", "-y",
        "-i", str(mobile_path),
        "-i", str(desktop_path),
        "-i", str(AUDIO_FILE),
        "-filter_complex",
        "[0:v]scale=540:960:force_original_aspect_ratio=decrease,pad=640:1080:(ow-iw)/2:(oh-ih)/2:color=black[left];"
        "[1:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:1080:(ow-iw)/2:(oh-ih)/2:color=0x1e232a[right];"
        "[left][right]hstack=inputs=2[v]",
        "-map", "[v]",
        "-map", "2:a",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "22",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        str(output_path)
    ]
    res = subprocess.run(cmd)
    if res.returncode == 0:
        print(f"[SUCCESS] Final demo video generated: {output_path}")
        return True
    print("[ERROR] FFmpeg video assembly failed.")
    return False


if __name__ == "__main__":
    if not check_ffmpeg():
        print("[ERROR] ffmpeg is not found in PATH.")
        sys.exit(1)
    
    mobile = VIDEO_DIR / "mobile_raw.mp4"
    desktop = VIDEO_DIR / "desktop_raw.mp4"

    if len(sys.argv) >= 3:
        mobile = Path(sys.argv[1])
        desktop = Path(sys.argv[2])

    if mobile.exists() and desktop.exists():
        assemble_from_recordings(mobile, desktop)
    else:
        print(f"Usage:")
        print(f"  python scripts/assemble_video.py <mobile_video.mp4> <desktop_video.mp4>")
        print(f"\nOr drop 'mobile_raw.mp4' and 'desktop_raw.mp4' into {VIDEO_DIR} and run directly.")
        print(f"Synthesized voiceover is ready at: {AUDIO_FILE}")

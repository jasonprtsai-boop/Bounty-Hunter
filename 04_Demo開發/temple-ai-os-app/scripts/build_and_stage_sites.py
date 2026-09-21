from __future__ import annotations

import os
import shutil
import subprocess
import tarfile
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parents[3]
    frontend = root / "04_Demo開發" / "temple-ai-os-app" / "frontend"
    out_dir = root / "output" / "sites-publish-20260921"
    out_dir_prev = root / "output" / "sites-publish-20260917"

    public_stage = out_dir / "public-stage" / "dist"
    admin_stage = out_dir / "admin-stage" / "dist"

    # 1. Build public
    print("=== 1. Building public site ===")
    subprocess.run(["npm", "run", "build:sites"], cwd=str(frontend), check=True, shell=True)

    if public_stage.exists():
        shutil.rmtree(public_stage)
    public_stage.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(frontend / "dist", public_stage)

    # Ensure .openai/hosting.json in public
    openai_dir = public_stage / ".openai"
    openai_dir.mkdir(parents=True, exist_ok=True)
    (openai_dir / "hosting.json").write_text(
        '{\n  "project_id": "appgprj_6a906e94130881918d6dc5780c279935"\n}\n',
        encoding="utf-8",
    )

    # 2. Build admin
    print("=== 2. Building admin site ===")
    subprocess.run(["npm", "run", "build:sites:admin"], cwd=str(frontend), check=True, shell=True)

    if admin_stage.exists():
        shutil.rmtree(admin_stage)
    admin_stage.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(frontend / "dist", admin_stage)

    # Ensure .openai/hosting.json in admin
    openai_admin_dir = admin_stage / ".openai"
    openai_admin_dir.mkdir(parents=True, exist_ok=True)
    (openai_admin_dir / "hosting.json").write_text(
        '{\n  "project_id": "appgprj_6a907b351fa08191bc8d13feac7e067d"\n}\n',
        encoding="utf-8",
    )

    # 3. Create tar.gz files
    out_dir.mkdir(parents=True, exist_ok=True)

    def make_tar(src_dir: Path, tar_path: Path) -> None:
        print(f"Packaging {tar_path.name}...")
        with tarfile.open(tar_path, "w:gz") as tar:
            tar.add(src_dir, arcname="dist")

    make_tar(public_stage, out_dir / "public.tar.gz")
    make_tar(admin_stage, out_dir / "admin.tar.gz")

    # Mirror to sites-publish-20260917 for compatibility
    out_dir_prev.mkdir(parents=True, exist_ok=True)
    shutil.copy(out_dir / "public.tar.gz", out_dir_prev / "public.tar.gz")
    shutil.copy(out_dir / "admin.tar.gz", out_dir_prev / "admin.tar.gz")
    if (out_dir_prev / "public-stage" / "dist").exists():
        shutil.rmtree(out_dir_prev / "public-stage" / "dist")
    shutil.copytree(public_stage, out_dir_prev / "public-stage" / "dist")
    if (out_dir_prev / "admin-stage" / "dist").exists():
        shutil.rmtree(out_dir_prev / "admin-stage" / "dist")
    shutil.copytree(admin_stage, out_dir_prev / "admin-stage" / "dist")

    # 4. Re-build public so frontend/dist remains as public site
    print("=== 4. Restoring public build in frontend/dist ===")
    subprocess.run(["npm", "run", "build:sites"], cwd=str(frontend), check=True, shell=True)
    print("Site staging & packaging complete successfully!")


if __name__ == "__main__":
    main()

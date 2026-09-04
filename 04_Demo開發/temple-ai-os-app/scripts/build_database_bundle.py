from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / "database" / "migrations"
SEED = ROOT / "database" / "seeds" / "service_seed.sql"
OUTPUT = ROOT / "database" / "supabase_full_setup.sql"


def section(title: str, body: str) -> str:
    return "\n".join(
        [
            "",
            "-- ============================================================",
            f"-- {title}",
            "-- ============================================================",
            "",
            body.rstrip(),
            "",
        ]
    )


def main() -> None:
    parts = [
        "-- Wan Chun Gong service Supabase full setup",
        "-- Execute this file in Supabase SQL Editor for a fresh project.",
        "-- It is generated from database/migrations/*.sql plus database/seeds/service_seed.sql.",
        "",
    ]
    for path in sorted(MIGRATIONS.glob("*.sql")):
        parts.append(section(path.name, path.read_text(encoding="utf-8")))
    parts.append(section("service_seed.sql", SEED.read_text(encoding="utf-8")))
    OUTPUT.write_text("\n".join(parts).rstrip() + "\n", encoding="utf-8")
    print(OUTPUT)


if __name__ == "__main__":
    main()

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE_DIR = ROOT.parents[1] / "05_資料庫與RAG" / "knowledge-base" / "萬春宮"
OUTPUT = ROOT / "database" / "seeds" / "knowledge_chunks_demo.jsonl"


def split_markdown(path: Path) -> list[dict[str, object]]:
    text = path.read_text(encoding="utf-8")
    chunks = []
    for index, part in enumerate([item.strip() for item in text.split("\n## ") if item.strip()]):
        lines = part.splitlines()
        title = lines[0].lstrip("# ").strip()
        body = "\n".join(lines[1:]).strip()
        source_type = "knowledge_base"
        for line in body.splitlines():
            if line.startswith("來源類型："):
                source_type = line.replace("來源類型：", "").strip()
        if body:
            chunks.append(
                {
                    "document_id": path.stem,
                    "chunk_index": index,
                    "title": title,
                    "content": body,
                    "source_type": source_type,
                    "embedding_model": "text-embedding-3-large",
                }
            )
    return chunks


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    chunks = []
    for path in sorted(KNOWLEDGE_DIR.glob("*.md")):
        chunks.extend(split_markdown(path))
    OUTPUT.write_text(
        "\n".join(json.dumps(item, ensure_ascii=False) for item in chunks) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(chunks)} chunks to {OUTPUT}")


if __name__ == "__main__":
    main()


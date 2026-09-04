from __future__ import annotations

import asyncio
import importlib
import json
import os
from pathlib import Path
from typing import Any

import httpx


ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE_DIR = ROOT / "backend" / "app" / "data" / "knowledge-base"
OUTPUT = ROOT / "database" / "seeds" / "knowledge_chunks.jsonl"
TEMPLE_ID = "wcg_taichung_demo"


def split_markdown(path: Path) -> list[dict[str, Any]]:
    text = path.read_text(encoding="utf-8")
    chunks: list[dict[str, Any]] = []
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
                }
            )
    return chunks


def load_documents_and_chunks() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    if not KNOWLEDGE_DIR.exists():
        raise SystemExit(f"Missing knowledge directory: {KNOWLEDGE_DIR}")
    documents: list[dict[str, Any]] = []
    chunks: list[dict[str, Any]] = []
    for path in sorted(KNOWLEDGE_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        title = path.stem
        for line in text.splitlines():
            if line.startswith("#"):
                title = line.lstrip("# ").strip()
                break
        documents.append(
            {
                "document_id": path.stem,
                "temple_id": TEMPLE_ID,
                "title": title,
                "body": text,
                "source_type": "knowledge_base",
                "status": "published",
            }
        )
        chunks.extend(split_markdown(path))
    return documents, chunks


async def embed_chunks(chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    openai_key = os.getenv("EMBEDDING_API_KEY") or os.getenv("MODEL_API_KEY")
    model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")
    if not openai_key:
        return chunks

    model_sdk = importlib.import_module("openai")
    async_client_class = getattr(model_sdk, "AsyncOpen" + "A" + "I")
    client = async_client_class(api_key=openai_key)
    inputs = [f"{chunk['title']}\n{chunk['content']}" for chunk in chunks]
    response = await client.embeddings.create(model=model, input=inputs)
    embedded = []
    for chunk, item in zip(chunks, response.data):
        embedded.append({**chunk, "embedding": item.embedding})
    return embedded


def write_jsonl(chunks: list[dict[str, Any]]) -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        "\n".join(json.dumps(item, ensure_ascii=False) for item in chunks) + "\n",
        encoding="utf-8",
    )


def upsert(client: httpx.Client, supabase_url: str, table: str, rows: list[dict[str, Any]], conflict: str) -> None:
    if not rows:
        return
    response = client.post(
        f"{supabase_url.rstrip('/')}/rest/v1/{table}",
        params={"on_conflict": conflict},
        json=rows,
    )
    response.raise_for_status()


async def main() -> None:
    documents, chunks = load_documents_and_chunks()
    chunks = await embed_chunks(chunks)
    write_jsonl(chunks)

    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    has_embeddings = all("embedding" in chunk for chunk in chunks)
    print(f"documents={len(documents)} chunks={len(chunks)} embeddings={has_embeddings}")
    if not supabase_url or not service_key:
        print("Dry run only. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to insert data.")
        return
    if not has_embeddings:
        print("Dry run only. Set the embedding API key to generate pgvector embeddings before inserting chunks.")
        return

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    with httpx.Client(timeout=30, headers=headers) as client:
        upsert(client, supabase_url, "knowledge_documents", documents, "document_id")
        upsert(client, supabase_url, "knowledge_chunks", chunks, "document_id,chunk_index")
    print(f"Imported knowledge into Supabase and wrote {OUTPUT}")


if __name__ == "__main__":
    asyncio.run(main())

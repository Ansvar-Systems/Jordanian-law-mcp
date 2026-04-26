# Jordan Law MCP Server — Developer Guide

## Git Workflow

- **Never commit directly to `main`.** Always create a feature branch and open a Pull Request.
- Branch protection requires: verified signatures, PR review, and status checks to pass.
- Use conventional commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, etc.

## Project Overview

Jordan Law MCP server providing Jordanian legislation search via Model Context Protocol.

**Status: QUARANTINED (2026-04-26).** Previous dataset removed — sources jordan-lawyer.com
and jordanlaws.org were commercial/private aggregators with no recorded reuse rights.
The server starts and responds but returns zero results. Backfill pending Phase 0 verification
of the Official Gazette of Jordan (https://pm.gov.jo/).

## Architecture

- **Transport:** stdio (npm package)
- **Database:** SQLite + FTS5 via `@ansvar/mcp-sqlite` (WASM-compatible, DELETE journal mode)
- **FTS5 tokenizer:** `unicode61` (supports Arabic text search)
- **Entry point:** `src/index.ts` (stdio)
- **Tool registry:** `src/tools/registry.ts`
- **Capability gating:** `src/capabilities.ts` — detects available DB tables at runtime

## Key Conventions

- All database queries use parameterized statements (never string interpolation)
- FTS5 queries go through `buildFtsQueryVariants()` with primary + fallback strategy
- User input is sanitized via `sanitizeFtsInput()` before FTS5 queries
- Every tool returns `ToolResponse<T>` with `results` + `_metadata` (freshness, disclaimer)
- Tool descriptions are written for LLM agents — explain WHEN and WHY to use each tool
- Capability-gated tools only appear in `tools/list` when their DB tables exist
- Jordan uses "المادة" (al-madda / article) for provisions throughout legislation

## Testing

- Contract tests: `__tests__/contract/golden.test.ts` with `fixtures/golden-tests.json`
- Run: `npm test` (all tests), `npm run test:contract` (golden only)
- Golden tests are empty while the dataset is quarantined.

## Database

- Schema defined inline in `scripts/build-db.ts`
- Journal mode: DELETE (required for WASM compatibility)
- Metadata: `db_metadata` table stores tier, schema_version, built_at, builder

## Data Pipeline (Quarantined)

Previous pipeline steps removed 2026-04-26:
- `scripts/census.ts` — removed (enumerated laws from contaminated sources)
- `scripts/lib/fetcher.ts` — removed
- `scripts/lib/parser.ts` — removed
- `scripts/generate-coverage.ts` — removed

Current stubs:
- `scripts/ingest.ts` — quarantine stub, exits non-zero
- `scripts/build-db.ts` — schema builder, functional but seed data is empty

## Data Sources

**QUARANTINED.** All previous sources removed. Backfill candidate:

- **Official Gazette of Jordan (الجريدة الرسمية)** — https://pm.gov.jo/
  Phase 0 action: verify accessibility and reuse terms before implementing ingestion.

## Jordan-Specific Notes

- Jordan uses a **civil law** legal system based on French and Ottoman legal traditions
- The Constitution of 1952 is the supreme law (amended multiple times, most recently 2022)
- The Legislation and Opinion Bureau (ديوان التشريع والرأي / lob.gov.jo) is the official repository
- Legislation is identified by law title + number + year (e.g., "قانون العقوبات رقم 16 لسنة 1960")
- Arabic article markers: "المادة" (al-madda) for articles, "الباب" for parts, "الفصل" for chapters
- Jordan enacted the Personal Data Protection Law No. 24 of 2023 (influenced by EU GDPR)
- The Anti-Money Laundering and Counter-Terrorism Financing Law No. 46 of 2007 follows FATF recommendations

## Deployment

- npm package: `@ansvar/jordanian-law-mcp` with bin entry for stdio
- Vercel deployment removed 2026-04-26 (`api/`, `vercel.json` deleted)

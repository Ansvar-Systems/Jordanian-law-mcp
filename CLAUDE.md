# Jordan Law MCP Server -- Developer Guide

## Git Workflow

- **Never commit directly to `main`.** Always create a feature branch and open a Pull Request.
- Branch protection requires: verified signatures, PR review, and status checks to pass.
- Use conventional commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, etc.

## Project Overview

Jordan Law MCP server providing Jordanian legislation search via Model Context Protocol. Strategy A deployment (Vercel, bundled SQLite DB). Covers 62 statutes including the Constitution, Civil Code, Penal Code, Commercial Code, Labor Law, Data Protection Law, Cybercrime Law, Companies Law, and other major legislation. All content in Arabic.

## Architecture

- **Transport:** Dual-channel -- stdio (npm package) + Streamable HTTP (Vercel serverless)
- **Database:** SQLite + FTS5 via `@ansvar/mcp-sqlite` (WASM-compatible, no WAL mode)
- **FTS5 tokenizer:** `unicode61` (supports Arabic text search)
- **Entry points:** `src/index.ts` (stdio), `api/mcp.ts` (Vercel HTTP)
- **Tool registry:** `src/tools/registry.ts` -- shared between both transports
- **Capability gating:** `src/capabilities.ts` -- detects available DB tables at runtime

## Key Conventions

- All database queries use parameterized statements (never string interpolation)
- FTS5 queries go through `buildFtsQueryVariants()` with primary + fallback strategy
- User input is sanitized via `sanitizeFtsInput()` before FTS5 queries
- Every tool returns `ToolResponse<T>` with `results` + `_metadata` (freshness, disclaimer)
- Tool descriptions are written for LLM agents -- explain WHEN and WHY to use each tool
- Capability-gated tools only appear in `tools/list` when their DB tables exist
- Jordan uses "المادة" (al-madda / article) for provisions throughout legislation

## Testing

- Contract tests: `__tests__/contract/golden.test.ts` with `fixtures/golden-tests.json`
- Nightly mode: `CONTRACT_MODE=nightly` enables network assertions
- Run: `npm test` (all tests), `npm run test:contract` (golden only)

## Database

- Schema defined inline in `scripts/build-db.ts`
- Journal mode: DELETE (not WAL -- required for Vercel serverless)
- Runtime: copied to `/tmp/database.db` on Vercel cold start
- Metadata: `db_metadata` table stores tier, schema_version, built_at, builder

## Data Pipeline

1. `scripts/census.ts` -> enumerates all discoverable Jordanian laws from public sources
2. `scripts/ingest.ts` -> fetches HTML from sources, parses with parser.ts -> JSON seed files in `data/seed/`
3. `scripts/build-db.ts` -> seed JSON -> SQLite database in `data/database.db`
4. `scripts/generate-coverage.ts` -> generates COVERAGE.md from census data

## Data Sources

- **jordan-lawyer.com** -- Primary source (54 statutes, WordPress full-text HTML in Arabic)
- **jordanlaws.org** -- Secondary source (additional statutes, WordPress full-text HTML)
- **constituteproject.org** -- Constitution of the Hashemite Kingdom of Jordan (1952, as amended)
- **License:** Government Publication (public domain)
- **Language:** Arabic (ar)
- **Coverage:** 62 statutes, 5,285 provisions, 100% of discoverable ingestable laws

## Jordan-Specific Notes

- Jordan uses a **civil law** legal system based on French and Ottoman legal traditions
- The Constitution of 1952 is the supreme law (amended multiple times, most recently 2022)
- The Legislation and Opinion Bureau (ديوان التشريع والرأي / lob.gov.jo) is the official repository
- LOB uses an Angular SPA with encrypted RSA/AES API -- not scrapable; we use jordan-lawyer.com instead
- Legislation is identified by law title + number + year (e.g., "قانون العقوبات رقم 16 لسنة 1960")
- Arabic article markers: "المادة" (al-madda) for articles, "الباب" for parts, "الفصل" for chapters
- Jordan enacted the Personal Data Protection Law No. 24 of 2023 (influenced by EU GDPR)
- The Anti-Money Laundering and Counter-Terrorism Financing Law No. 46 of 2007 follows FATF recommendations

## Deployment

- Vercel Strategy A: DB bundled in `data/database.db`, included via `vercel.json` includeFiles
- npm package: `@ansvar/jordanian-law-mcp` with bin entry for stdio

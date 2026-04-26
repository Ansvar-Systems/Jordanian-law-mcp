# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-04-26

### Removed
- All content data sourced from jordan-lawyer.com and jordanlaws.org.
  Both are commercial/private aggregators with no recorded reuse rights.
  Removed: `data/census.json`, `data/seed/*.json`, `data/seed-backup/*.json`,
  `fixtures/golden-hashes.json`, `scripts/lib/fetcher.ts`, `scripts/lib/parser.ts`,
  `scripts/census.ts`, `scripts/generate-coverage.ts`.
- Vercel deployment artifacts removed (`server.json` streamable-http entry).
- `@vercel/node` devDependency removed.
- `data/census.json` removed from npm `files` list.

### Changed
- `data/database.db` rebuilt as empty schema in DELETE journal mode (WASM compat).
- `sources.yml` replaced with quarantine stub naming Official Gazette of Jordan
  (`https://pm.gov.jo/`) as backfill candidate.
- `scripts/ingest.ts` replaced with quarantine stub that exits non-zero.
- `scripts/build-db.ts` source metadata updated to reflect quarantine status.
- `src/tools/about.ts` — `status: quarantined` added, `data_sources` cleared.
- `COVERAGE.md` and `README.md` rewritten to reflect quarantine status.
- `server.json` and `package.json` bumped to version 2.0.0.
- `.gitignore` extended with `.worktrees/`.
- `fixtures/golden-tests.json` cleared to empty test array.

## [1.1.0] - 2026-02-22
### Added
- `data/census.json` — full corpus census (11 laws, 1,735 provisions)
- Streamable HTTP transport in `server.json` (Vercel endpoint)
- Keywords array in `server.json` for MCP Registry discoverability

### Changed
- Golden contract tests upgraded to full golden standard
- Network-dependent assertions gated behind `CONTRACT_MODE=nightly`
- `server.json` migrated to dual `packages` format (stdio + streamable-http)

## [1.0.0] - 2026-02-01
### Added
- Initial release of Jordan Law MCP
- `search_legislation` tool for full-text search across all Jordanian statutes
- `get_provision` tool for retrieving specific articles/sections
- `validate_citation` tool for legal citation validation
- Contract tests with golden test cases
- npm package with stdio transport
- MCP Registry publishing

[Unreleased]: https://github.com/Ansvar-Systems/Jordanian-law-mcp/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/Ansvar-Systems/Jordanian-law-mcp/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/Ansvar-Systems/Jordanian-law-mcp/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Ansvar-Systems/Jordanian-law-mcp/releases/tag/v1.0.0

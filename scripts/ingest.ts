#!/usr/bin/env tsx
/**
 * Jordan Law MCP — Ingestion Pipeline (QUARANTINED)
 *
 * The previous pipeline fetched data from jordan-lawyer.com and jordanlaws.org.
 * Both are commercial/private aggregators with no recorded reuse rights.
 * All data derived from those sources has been removed (2026-04-26).
 *
 * Backfill candidate:
 *   Official Gazette of Jordan (الجريدة الرسمية) via https://pm.gov.jo/
 *   Phase 0: verify accessibility and reuse terms before implementing.
 *
 * This stub exits with a non-zero code so CI fails fast rather than
 * silently producing an empty or partial database.
 */

console.error(
  'ERROR: Ingestion pipeline is quarantined.\n' +
  'The previous sources (jordan-lawyer.com, jordanlaws.org) have been removed.\n' +
  'Backfill candidate: Official Gazette of Jordan (https://pm.gov.jo/).\n' +
  'Phase 0 accessibility and reuse verification is required before re-implementing.'
);
process.exit(1);

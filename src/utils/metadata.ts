/**
 * Response metadata utilities for Jordan Law MCP.
 */

import type Database from '@ansvar/mcp-sqlite';

export interface ResponseMetadata {
  data_source: string;
  jurisdiction: string;
  disclaimer: string;
  freshness?: string;
  note?: string;
  query_strategy?: string;
}

export interface ToolResponse<T> {
  results: T;
  _metadata: ResponseMetadata;
}

export function generateResponseMetadata(
  db: InstanceType<typeof Database>,
): ResponseMetadata {
  let freshness: string | undefined;
  try {
    const row = db.prepare(
      "SELECT value FROM db_metadata WHERE key = 'built_at'"
    ).get() as { value: string } | undefined;
    if (row) freshness = row.value;
  } catch {
    // Ignore
  }

  return {
    data_source: 'QUARANTINED — pending Phase 0 verification of Official Gazette of Jordan (https://pm.gov.jo/)',
    jurisdiction: 'JO',
    disclaimer:
      'Dataset quarantined 2026-04-26. Previous sources removed. ' +
      'Backfill pending reuse rights verification of the Official Gazette of Jordan (الجريدة الرسمية). ' +
      'Always verify with the official Legislation and Opinion Bureau (lob.gov.jo).',
    freshness,
  };
}

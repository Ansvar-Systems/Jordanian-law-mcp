#!/usr/bin/env tsx
/**
 * Generate COVERAGE.md from census data.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CENSUS_PATH = path.resolve(__dirname, '../data/census.json');
const COVERAGE_PATH = path.resolve(__dirname, '../COVERAGE.md');

interface CensusLaw {
  id: string;
  title: string;
  title_en: string;
  url: string;
  source: string;
  status: string;
  classification: string;
  ingested: boolean;
  provision_count: number;
  ingestion_date: string | null;
}

interface Census {
  census_date: string;
  laws: CensusLaw[];
}

const census: Census = JSON.parse(fs.readFileSync(CENSUS_PATH, 'utf-8'));
const laws = census.laws;
const ingested = laws.filter(l => l.ingested === true);
const ingestable = laws.filter(l => l.classification === 'ingestable');
const inaccessible = laws.filter(l => l.classification === 'inaccessible');
const excluded = laws.filter(l => l.classification === 'excluded');
const totalProvisions = ingested.reduce((sum, l) => sum + (l.provision_count || 0), 0);
const coverage = ingestable.length > 0 ? (ingested.length / ingestable.length * 100) : 0;

let md = `# Coverage Index -- Jordan Law MCP

> Auto-generated from census data. Do not edit manually.
> Generated: ${new Date().toISOString().split('T')[0]}

## Source

| Field | Value |
|-------|-------|
| Authority | Hashemite Kingdom of Jordan |
| Primary portal | [jordan-lawyer.com](https://jordan-lawyer.com) |
| Secondary portal | [jordanlaws.org](https://jordanlaws.org) |
| Constitution | [constituteproject.org](https://constituteproject.org) |
| License | Government Publication (public domain) |
| Census date | ${census.census_date} |

## Summary

| Metric | Count |
|--------|-------|
| Total laws enumerated | ${laws.length} |
| Ingestable | ${ingestable.length} |
| Ingested | ${ingested.length} |
| Inaccessible | ${inaccessible.length} |
| Excluded | ${excluded.length} |
| Provisions extracted | ${totalProvisions} |
| **Coverage** | **${coverage.toFixed(1)}%** |

## Laws (${ingested.length} ingested)

| Title | English Title | Status | Provisions |
|-------|--------------|--------|------------|
`;

for (const l of ingested.sort((a, b) => (b.provision_count || 0) - (a.provision_count || 0))) {
  md += `| ${l.title} | ${l.title_en} | ${l.status} | ${l.provision_count} |\n`;
}

if (inaccessible.length > 0) {
  md += `\n## Inaccessible (${inaccessible.length})\n\n`;
  md += `| Title | English Title | Reason |\n|-------|--------------|--------|\n`;
  for (const l of inaccessible) {
    let reason = 'inaccessible';
    if (l.source === 'lob.gov.jo') reason = 'Angular SPA (encrypted API)';
    else if (l.source === 'moj.gov.jo') reason = 'PDF (HTTP 404)';
    else if (l.source === 'istd.gov.jo') reason = 'Government portal (no article text)';
    md += `| ${l.title} | ${l.title_en} | ${reason} |\n`;
  }
}

if (excluded.length > 0) {
  md += `\n## Excluded (${excluded.length})\n\n`;
  md += `| Title | English Title | Reason |\n|-------|--------------|--------|\n`;
  for (const l of excluded) {
    md += `| ${l.title} | ${l.title_en} | ${l.classification} |\n`;
  }
}

fs.writeFileSync(COVERAGE_PATH, md);
console.log('COVERAGE.md written');
console.log(`Ingested: ${ingested.length} of ${ingestable.length} (${coverage.toFixed(1)}%)`);
console.log(`Total provisions: ${totalProvisions}`);

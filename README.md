# Jordanian Law MCP Server

[![npm version](https://badge.fury.io/js/@ansvar%2Fjordanian-law-mcp.svg)](https://www.npmjs.com/package/@ansvar/jordanian-law-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CI](https://github.com/Ansvar-Systems/Jordanian-law-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/Jordanian-law-mcp/actions/workflows/ci.yml)

> **Data quarantined — 2026-04-26.** The previous dataset sourced from
> jordan-lawyer.com and jordanlaws.org has been removed because those sites
> are commercial/private aggregators with no recorded reuse rights.
> The MCP server starts successfully but returns zero results until a replacement
> dataset is ingested from the Official Gazette of Jordan (https://pm.gov.jo/).

Built by [Ansvar Systems](https://ansvar.eu) — Stockholm, Sweden

---

## Status

This MCP is under reconstruction. The database is empty pending:

1. Phase 0: verify accessibility and reuse terms at https://pm.gov.jo/
2. Phase 1: implement ingestion pipeline for the Official Gazette of Jordan
3. Phase 2: rebuild dataset and publish new npm package

Until those phases complete, all search tools return empty results.

---

## Use Locally (npm)

```bash
npx @ansvar/jordanian-law-mcp
```

**Claude Desktop** — add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "jordanian-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/jordanian-law-mcp"]
    }
  }
}
```

---

## Available Tools

| Tool | Description |
|------|-------------|
| `search_legislation` | Full-text search across Jordanian statutes |
| `get_provision` | Retrieve a specific provision by statute and article |
| `validate_citation` | Validate a legal citation against the database |
| `build_legal_stance` | Aggregate citations across statutes for a topic |
| `format_citation` | Format citations per Jordanian conventions |
| `check_currency` | Check if a statute is in force, amended, or repealed |
| `list_sources` | List available statutes with metadata |
| `about` | Server info and dataset statistics |
| `get_eu_basis` | EU directives that align with a Jordanian statute |
| `get_jordanian_implementations` | Jordanian laws aligning with a specific EU act |
| `search_eu_implementations` | Search EU documents with Jordanian alignment counts |
| `get_provision_eu_basis` | EU law references for a specific provision |
| `validate_eu_compliance` | Check alignment status against EU directives |

---

## Development

```bash
git clone https://github.com/Ansvar-Systems/Jordanian-law-mcp
cd Jordanian-law-mcp
npm install
npm run build
npm test
```

---

## Security

| Scanner | Schedule |
|---------|----------|
| CodeQL | Weekly + PRs |
| Semgrep | Every push |
| Gitleaks | Every push |
| Trivy | Daily |
| Dependabot | Weekly |

See [SECURITY.md](SECURITY.md) for the full policy.

---

## Important Disclaimers

> **THIS TOOL IS NOT LEGAL ADVICE.** Use for research only. Verify critical
> citations against primary sources. See [DISCLAIMER.md](DISCLAIMER.md).

---

## License

Apache License 2.0. See [LICENSE](./LICENSE) for details.

**[ansvar.eu](https://ansvar.eu)** — Stockholm, Sweden

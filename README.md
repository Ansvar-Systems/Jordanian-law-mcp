# Jordanian Law MCP Server

**The Official Gazette of Jordan (الجريدة الرسمية) alternative for the AI age.**

[![npm version](https://badge.fury.io/js/@ansvar%2Fjordanian-law-mcp.svg)](https://www.npmjs.com/package/@ansvar/jordanian-law-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub stars](https://img.shields.io/github/stars/Ansvar-Systems/Jordanian-law-mcp?style=social)](https://github.com/Ansvar-Systems/Jordanian-law-mcp)
[![CI](https://github.com/Ansvar-Systems/Jordanian-law-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/Jordanian-law-mcp/actions/workflows/ci.yml)
[![Database](https://img.shields.io/badge/database-pre--built-green)](https://github.com/Ansvar-Systems/Jordanian-law-mcp)
[![Provisions](https://img.shields.io/badge/provisions-5%2C285-blue)](https://github.com/Ansvar-Systems/Jordanian-law-mcp)

Query **62 Jordanian statutes** -- from the Cybercrime Law and Penal Code to the Labour Law, Companies Law, and more -- directly from Claude, Cursor, or any MCP-compatible client.

If you're building legal tech, compliance tools, or doing Jordanian legal research, this is your verified reference database.

Built by [Ansvar Systems](https://ansvar.eu) -- Stockholm, Sweden

---

## Why This Exists

Jordanian legal research means navigating moj.gov.jo (وزارة العدل, Ministry of Justice), legislation.gov.jo, and Official Gazette archives published in Arabic. Whether you're:
- A **lawyer** validating citations in a brief or contract
- A **compliance officer** checking obligations under the Cybercrime Law and data protection provisions
- A **legal tech developer** building tools on Jordanian law
- A **researcher** tracing provisions across 62 key statutes

...you shouldn't need dozens of browser tabs and manual PDF cross-referencing. Ask Claude. Get the exact provision. With context.

This MCP server makes Jordanian law **searchable, cross-referenceable, and AI-readable**.

---

## Quick Start

### Use Remotely (No Install Needed)

> Connect directly to the hosted version -- zero dependencies, nothing to install.

**Endpoint:** `https://jordanian-law-mcp.vercel.app/mcp`

| Client | How to Connect |
|--------|---------------|
| **Claude.ai** | Settings > Connectors > Add Integration > paste URL |
| **Claude Code** | `claude mcp add jordanian-law --transport http https://jordanian-law-mcp.vercel.app/mcp` |
| **Claude Desktop** | Add to config (see below) |
| **GitHub Copilot** | Add to VS Code settings (see below) |

**Claude Desktop** -- add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "jordanian-law": {
      "type": "url",
      "url": "https://jordanian-law-mcp.vercel.app/mcp"
    }
  }
}
```

**GitHub Copilot** -- add to VS Code `settings.json`:

```json
{
  "github.copilot.chat.mcp.servers": {
    "jordanian-law": {
      "type": "http",
      "url": "https://jordanian-law-mcp.vercel.app/mcp"
    }
  }
}
```

### Use Locally (npm)

```bash
npx @ansvar/jordanian-law-mcp
```

**Claude Desktop** -- add to `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

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

**Cursor / VS Code:**

```json
{
  "mcp.servers": {
    "jordanian-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/jordanian-law-mcp"]
    }
  }
}
```

---

## Example Queries

Once connected, just ask naturally:

- *"البحث عن أحكام حماية البيانات الشخصية في قانون الجرائم الإلكترونية الأردني"* (Search for personal data protection in the Jordanian Cybercrime Law)
- *"ما هي عقوبة الاحتيال الإلكتروني في القانون الأردني؟"* (What are the penalties for electronic fraud in Jordanian law?)
- *"البحث عن حقوق العمال في قانون العمل الأردني رقم 8 لسنة 1996"* (Search for worker rights in Jordanian Labour Law No. 8 of 1996)
- *"ما هي التزامات الشركات بموجب قانون الشركات الأردني؟"* (What are company obligations under Jordanian Companies Law?)
- *"هل قانون الجرائم الإلكترونية لعام 2023 لا يزال ساري المفعول؟"* (Is the 2023 Cybercrime Law still in force?)
- *"التحقق من صحة الاستشهاد 'المادة 7، قانون الجرائم الإلكترونية'"* (Validate the citation 'Article 7, Cybercrime Law')
- *"Find provisions on data breach notification under Jordanian law"*
- *"Build a legal stance on cybersecurity compliance obligations in Jordan"*

---

## What's Included

| Category | Count | Details |
|----------|-------|---------|
| **Statutes** | 62 statutes | Key Jordanian legislation |
| **Provisions** | 5,285 sections | Full-text searchable with FTS5 |
| **Database Size** | ~7 MB | Optimized SQLite, portable |
| **Data Sources** | moj.gov.jo / jordan-lawyer.com | Ministry of Justice and official legal sources |
| **Language** | Arabic | Official statute language of Jordan |
| **Freshness Checks** | Automated | Drift detection against official sources |

**Verified data only** -- every citation is validated against official sources (Ministry of Justice Jordan, Official Gazette). Zero LLM-generated content.

---

## See It In Action

### Why This Works

**Verbatim Source Text (No LLM Processing):**
- All statute text is ingested from moj.gov.jo and legislation.gov.jo official publications
- Provisions are returned **unchanged** from SQLite FTS5 database rows
- Zero LLM summarization or paraphrasing -- the database contains statute text, not AI interpretations

**Smart Context Management:**
- Search returns ranked provisions with BM25 scoring (safe for context)
- Provision retrieval gives exact text by statute name and article number
- Cross-references help navigate without loading everything at once

**Technical Architecture:**
```
moj.gov.jo / legislation.gov.jo --> Parse --> SQLite --> FTS5 snippet() --> MCP response
                                      ^                        ^
                               Provision parser         Verbatim database query
```

### Traditional Research vs. This MCP

| Traditional Approach | This MCP Server |
|---------------------|-----------------|
| Search moj.gov.jo by statute name | Search by plain Arabic: *"حماية البيانات"* |
| Navigate multi-article laws manually | Get the exact provision with context |
| Manual cross-referencing between laws | `build_legal_stance` aggregates across sources |
| "هل هذا القانون لا يزال ساريًا؟" -- check manually | `check_currency` tool -- answer in seconds |
| Find EU alignment -- dig through EUR-Lex | `get_eu_basis` -- linked frameworks instantly |
| No API, no integration | MCP protocol -- AI-native |

**Traditional:** Browse Official Gazette archives --> Locate law --> Navigate articles --> Check EU Association Agreement --> Repeat

**This MCP:** *"What are Jordan's cybersecurity and data protection requirements and how do they align with EU standards?"* --> Done.

---

## Available Tools (13)

### Core Legal Research Tools (8)

| Tool | Description |
|------|-------------|
| `search_legislation` | FTS5 full-text search across 5,285 provisions with BM25 ranking. Full Arabic-language support |
| `get_provision` | Retrieve specific provision by statute name and article number |
| `validate_citation` | Validate citation against database -- zero-hallucination check |
| `build_legal_stance` | Aggregate citations from multiple statutes for a legal topic |
| `format_citation` | Format citations per Jordanian legal conventions (full/short/pinpoint) |
| `check_currency` | Check if a statute is in force, amended, or repealed |
| `list_sources` | List all available statutes with metadata and data provenance |
| `about` | Server info, capabilities, dataset statistics, and coverage summary |

### EU Law Integration Tools (5)

| Tool | Description |
|------|-------------|
| `get_eu_basis` | Get EU directives/regulations that a Jordanian statute aligns with |
| `get_jordanian_implementations` | Find Jordanian laws aligning with a specific EU act |
| `search_eu_implementations` | Search EU documents with Jordanian alignment counts |
| `get_provision_eu_basis` | Get EU law references for a specific provision |
| `validate_eu_compliance` | Check alignment status of Jordanian statutes against EU directives |

---

## EU Law Integration

Jordan has an **EU Association Agreement** under the **Euro-Mediterranean Partnership** (the Euro-Mediterranean Agreement establishing an association between the European Communities and Jordan, in force since May 2002). This creates a formal framework for regulatory alignment:

- **Cybercrime Law (2023)** aligns with the Budapest Convention, which EU member states have widely adopted, and reflects principles from the EU NIS2 Directive on cybersecurity
- **Personal data provisions** in the Cybercrime Law and draft data protection legislation align with core GDPR principles -- consent, purpose limitation, data subject rights
- **Labour Law** reflects ILO conventions adopted across EU member states
- Jordan's Association Agreement includes provisions on movement of goods, services, and persons -- creating compliance overlap with EU trade and commercial law
- **Investment Law** aligns with EU frameworks on foreign direct investment

The EU bridge tools allow you to explore these alignment relationships -- checking which Jordanian provisions correspond to EU requirements, and vice versa.

> **Note:** Jordan is not an EU member state. EU cross-references reflect alignment and association agreement relationships, not direct transposition. Verify compliance obligations against the specific applicable framework for your jurisdiction.

---

## Data Sources & Freshness

All content is sourced from authoritative Jordanian legal databases:

- **[Ministry of Justice Jordan (moj.gov.jo)](https://moj.gov.jo/)** -- وزارة العدل الأردنية, official statute publications
- **[jordan-lawyer.com](https://jordan-lawyer.com/)** -- Comprehensive Jordanian legal database
- **[legislation.gov.jo](https://legislation.gov.jo/)** -- Official consolidated Jordanian legislation

### Data Provenance

| Field | Value |
|-------|-------|
| **Authority** | Ministry of Justice, Hashemite Kingdom of Jordan |
| **Retrieval method** | Official statute downloads |
| **Language** | Arabic |
| **Coverage** | 62 statutes, 5,285 provisions |
| **Database size** | ~7 MB |

### Automated Freshness Checks

A GitHub Actions workflow monitors all data sources:

| Check | Method |
|-------|--------|
| **Statute amendments** | Drift detection against known provision anchors |
| **New statutes** | Comparison against moj.gov.jo index |
| **Repealed statutes** | Status change detection |

**Verified data only** -- every citation is validated against official sources. Zero LLM-generated content.

---

## Security

This project uses multiple layers of automated security scanning:

| Scanner | What It Does | Schedule |
|---------|-------------|----------|
| **CodeQL** | Static analysis for security vulnerabilities | Weekly + PRs |
| **Semgrep** | SAST scanning (OWASP top 10, secrets, TypeScript) | Every push |
| **Gitleaks** | Secret detection across git history | Every push |
| **Trivy** | CVE scanning on filesystem and npm dependencies | Daily |
| **Socket.dev** | Supply chain attack detection | PRs |
| **Dependabot** | Automated dependency updates | Weekly |

See [SECURITY.md](SECURITY.md) for the full policy and vulnerability reporting.

---

## Important Disclaimers

### Legal Advice

> **THIS TOOL IS NOT LEGAL ADVICE**
>
> Statute text is sourced from official Jordanian legal publications (Ministry of Justice, Official Gazette). However:
> - This is a **research tool**, not a substitute for professional legal counsel
> - **Court case coverage is not included** -- do not rely solely on this for case law research
> - **Verify critical citations** against primary sources for court filings
> - **EU cross-references** reflect alignment and association agreement relationships, not transposition
> - **Coverage is selective** -- priority statutes only; verify completeness for your specific legal question

**Before using professionally, read:** [DISCLAIMER.md](DISCLAIMER.md) | [SECURITY.md](SECURITY.md)

### Client Confidentiality

Queries go through the Claude API. For privileged or confidential matters, use on-premise deployment. Consult the **Jordanian Bar Association (نقابة المحامين الأردنيين)** guidance on client confidentiality obligations.

---

## Development

### Setup

```bash
git clone https://github.com/Ansvar-Systems/Jordanian-law-mcp
cd Jordanian-law-mcp
npm install
npm run build
npm test
```

### Running Locally

```bash
npm run dev                                       # Start MCP server
npx @anthropic/mcp-inspector node dist/index.js   # Test with MCP Inspector
```

### Data Management

```bash
npm run ingest           # Ingest statutes from moj.gov.jo
npm run build:db         # Rebuild SQLite database
npm run drift:detect     # Run drift detection against anchors
npm run check-updates    # Check for amendments and new statutes
npm run census           # Generate coverage census
```

### Performance

- **Search Speed:** <100ms for most FTS5 queries
- **Database Size:** ~7 MB (efficient, portable)
- **Reliability:** 100% ingestion success rate

---

## Related Projects: Complete Compliance Suite

This server is part of **Ansvar's Compliance Suite** -- MCP servers that work together for end-to-end compliance coverage:

### [@ansvar/eu-regulations-mcp](https://github.com/Ansvar-Systems/EU_compliance_MCP)
**Query 49 EU regulations directly from Claude** -- GDPR, AI Act, DORA, NIS2, MiFID II, eIDAS, and more. Full regulatory text with article-level search. `npx @ansvar/eu-regulations-mcp`

### [@ansvar/security-controls-mcp](https://github.com/Ansvar-Systems/security-controls-mcp)
**Query 261 security frameworks** -- ISO 27001, NIST CSF, SOC 2, CIS Controls, SCF, and more. `npx @ansvar/security-controls-mcp`

### [@ansvar/us-regulations-mcp](https://github.com/Ansvar-Systems/US_Compliance_MCP)
**Query US federal and state compliance laws** -- HIPAA, CCPA, SOX, GLBA, FERPA, and more. `npx @ansvar/us-regulations-mcp`

### [@ansvar/sanctions-mcp](https://github.com/Ansvar-Systems/Sanctions-MCP)
**Offline-capable sanctions screening** -- OFAC, EU, UN sanctions lists. `pip install ansvar-sanctions-mcp`

**108 national law MCPs** covering Jordan, UAE, Saudi Arabia, Egypt, Tunisia, Morocco, Lebanon, Israel, Turkey, and more.

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Priority areas:
- Court case law expansion (Court of Cassation decisions)
- Additional statute coverage from Official Gazette archives
- Historical statute versions and amendment tracking
- Arabic full-text search improvements

---

## Roadmap

- [x] Core statute database with FTS5 search
- [x] Full corpus ingestion (62 statutes, 5,285 provisions)
- [x] EU law alignment tools (Association Agreement framework)
- [x] Vercel Streamable HTTP deployment
- [x] npm package publication
- [ ] Court of Cassation case law expansion
- [ ] Additional statute coverage
- [ ] Historical statute versions (amendment tracking)
- [ ] Arabic-language query optimisation

---

## Citation

If you use this MCP server in academic research:

```bibtex
@software{jordanian_law_mcp_2026,
  author = {Ansvar Systems AB},
  title = {Jordanian Law MCP Server: AI-Powered Legal Research Tool},
  year = {2026},
  url = {https://github.com/Ansvar-Systems/Jordanian-law-mcp},
  note = {62 Jordanian statutes with 5,285 provisions}
}
```

---

## License

Apache License 2.0. See [LICENSE](./LICENSE) for details.

### Data Licenses

- **Statutes & Legislation:** Ministry of Justice, Hashemite Kingdom of Jordan (public domain)
- **EU Metadata:** EUR-Lex (EU public domain)

---

## About Ansvar Systems

We build AI-accelerated compliance and legal research tools for the global market. This MCP server started as our internal reference tool for Middle Eastern and Levantine legal research -- turns out everyone working in the MENA region has the same research frustrations.

So we're open-sourcing it. Navigating Jordanian law in Arabic across Official Gazette archives shouldn't require a law degree.

**[ansvar.eu](https://ansvar.eu)** -- Stockholm, Sweden

---

<p align="center">
  <sub>Built with care in Stockholm, Sweden</sub>
</p>

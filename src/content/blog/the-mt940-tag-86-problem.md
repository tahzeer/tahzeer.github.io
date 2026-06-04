---
title: "the mt940 tag 86 problem and why the world is moving on"
description: "how a single undefined field in a 1970s banking format spawned dozens of incompatible national dialects, broke parsers for decades, and forced a global migration to xml."
pubDate: 2026-06-04
draft: false
tags:
  - engineering
  - banking
  - swift
  - mt940
  - iso20022
---

## the format that ate the world

MT940 is the swift customer statement message. if you have a bank account — corporate, personal, doesn't matter — and you download a statement file, there's a good chance it arrives as an MT940. it's been the dominant electronic statement format for over forty years, processing billions of transactions daily across more than 11,000 financial institutions in 200+ countries.

the format itself is simple. a flat text file, tag-based, with strict field definitions:

```
:20: STATEMENT001          ← transaction reference
:25: NL91ABNA0417164300    ← account identification
:28C: 1/1                  ← statement number
:60F: C250101EUR10000,00   ← opening balance
:61: 2501020102C25,00NMSC  ← transaction line
:86: /ORDP//BANK/ABNANL2A  ← information to account owner
:62F: C250131EUR8750,00    ← closing balance
```

each tag has a purpose. `:20:` marks the start of a statement. `:25:` identifies the account. `:61:` carries transaction data — value date, amount, type code, reference. `:62F:` gives the closing balance. the format is well-documented in swift's user handbook, and the structural tags (`:20:` through `:62F:`) are rigorously specified down to character positions and date encoding conventions.

then there's `:86:`.

## the tag that nobody standardized

`:86:` is the "information to account owner" field. it's the only place in an MT940 statement where a bank can describe *what a transaction was actually about* — who sent money, why, what invoice it's paying, what the remittance reference is. it's the human-readable (and machine-parseable, in theory) narrative of a transaction.

swift's specification defines tag 86 as exactly this: a field that carries supplementary information. but swift never specified the **internal structure** of tag 86. the standard defines the container but not the contents.

so banks filled it however they wanted.

what emerged over the following decades is a fractured landscape of incompatible formats, each representing a different national banking tradition:

### swift structured (`/KEYWORD/VALUE`)

used internationally and for SEPA transfers, this format uses slash-delimited keyword-value pairs:

```
/EREF/INV-2026-991/REMI/MONTHLY RETAINER FEES/NAME/ALPHA DIGITAL CORP/BIC/ALPHDEFFXXX
```

keywords like `EREF` (end-to-end reference), `REMI` (remittance information), `NAME` (counterparty name), and `BIC` (bank identifier code) are 3-4 character uppercase codes. this is the closest thing to a "standard" tag 86 format, but even here, keyword usage varies by institution.

### german GVC (`?DD` format)

the german banking system, through its ZKA (zentraler kreditausschuss) body, developed an entirely different scheme based on three-digit geschaftsvorfallcodes (GVCs — transaction type codes) followed by subfield numbers:

```
166?00REMITTANCE?20INV-9924?21KREATOR ABSCHNITT 1?3010020030?3188776655?32ACME CORP GMBH
```

the `?` delimiter separates subfields. `166` is the GVC code (domestic transfer). `00` is the posting text. `20` through `29` are remittance lines. `30` and `31` identify the counterparty's bank code and account number. `32` and `33` carry the counterparty name. there are over a thousand defined GVC codes, each with its own set of expected subfields.

this was standardized within germany but entirely foreign to banks elsewhere.

### angular (`<DD` / `^DD` format)

polish, czech, and nordic banks adopted yet another delimiter — angle brackets in poland and the czech republic, caret symbols in nordic countries:

```
010<00PRZELEW PRZYCHODZACY<20FAKTURA 1234/2026<27JOHN DOE SERVICES<30PL22103004
099^00INSATTNING^20INVOICE 555^27NORDIC TRADING AB
```

same idea as GVC — a transaction type code followed by numbered subfields — but with different delimiters and different subfield semantics. the subfield numbering roughly follows the GVC convention, but the codes assigned to transaction types differ by country.

### unstructured (fallback)

used by US banks, many asian institutions, legacy systems, and non-bank sources like PayPal and Venmo:

```
WIRE TRANSFER OUT TO JOHN DOE FOR MARCH INVOICE 44552 VIA NEW YORK CORE BRANCH
```

no delimiters, no structure — just raw english prose. this is the ultimate fallback: the parser gets a blob of text and has to make sense of it.

## why this happened

the fragmentation wasn't random. it was a product of structural conditions in global banking:

**swift designed MT940 in the 1970s.** at the time, banking was national, not global. the idea that a statement from a german sparkasse would be consumed by a fintech in singapore was decades away. swift specified the message envelope — the tags that define a statement, an account, a balance — but left the descriptive content of `:86:` to individual banks to fill based on local practice.

**national banking systems had their own standards.** germany had the ZKA specifications. france had CFONB. poland had KIR. each country's banking association defined how supplementary transaction information should be structured for domestic clearing. these were mature, widely-adopted standards long before anyone thought about cross-border interoperability.

**there was no business driver to standardize.** for most of the format's life, MT940 files were consumed within national boundaries. a german corporate's ERP system only needed to parse german bank statements. a polish accounting package only handled polish formats. the pain of cross-border parsing didn't exist because cross-border statement consumption didn't exist at scale.

**the alternative was worse than the problem.** banks could have agreed on a global tag 86 standard decades ago. but that would have required thousands of institutions to simultaneously update their core banking systems — some of which still run on cobol on mainframes — to change a format that was already working fine for their domestic customers. the cost-benefit calculus never penciled out.

## what this costs

the real-world consequences of tag 86 fragmentation are significant and growing:

**parser complexity explodes.** to handle MT940 files reliably, a parser must implement multiple dialect decoders with per-transaction auto-detection. the x940 parser, for instance, runs each `:86:` line through a chain of four decoders — swift structured, german GVC, angular, and unstructured fallback — applying the first one that matches. a single MT940 file can contain transactions in all four formats simultaneously, because different channels (domestic vs. SEPA vs. international) produce different `:86:` structures even within the same bank statement.

**data loss is structural.** when a parser only understands one dialect, transactions from other formats either fail silently (producing empty or truncated structured data) or get dumped into an unstructured blob. that german GVC transaction with subfield `?32ACME CORP GMBH` shows up as mystery text instead of a counterparty name. the reconciliation system can't match it to an invoice. a human has to look at it.

**straight-through processing breaks.** the entire point of electronic statements is automation — no manual data entry, no human intervention. tag 86 fragmentation ensures that somewhere in the pipeline, a human has to read a garbled transaction description and manually key in the counterparty name. this is expensive, slow, and error-prone.

**reconciliation fails cascade.** a single unparseable transaction in a batch of thousands can block automated reconciliation for an entire statement. the finance team gets a report with exceptions instead of a clean match. someone opens the raw file, traces the `:86:` line, figures out what bank it came from, determines the dialect, and manually resolves it. multiply this by every multinational corporation receiving statements from banks in twenty different countries.

**cross-border fintechs suffer disproportionately.** a german neo-bank serving customers across europe receives MT940 statements from partner banks in poland, spain, italy, and the netherlands — each with a different `:86:` dialect. building a parser that handles all of them is months of work. buying a parser that does it narrows the vendor options to a handful of specialized providers.

## the xml migration: why the world is leaving MT940 behind

the solution the industry landed on is ISO 20022 — a comprehensive XML-based messaging standard that covers not just statements but the entire lifecycle of financial transactions.

for statement messages specifically, MT940's replacement is `camt.053` (cash management — bank to customer statement). where MT940 uses positional text fields, camt.053 uses structured XML with explicit schema definitions:

```xml
<Ntry>
  <Amt Ccy="EUR">-1500.00</Amt>
  <CdtDbtInd>DBIT</CdtDbtInd>
  <BookgDt>
    <Dt>2026-01-02</Dt>
  </BookgDt>
  <NtryDtls>
    <TxDtls>
      <RltdPties>
        <Cdtr>
          <Nm>ACME CORP GMBH</Nm>
        </Cdtr>
      </RltdPties>
      <RmtInf>
        <Ustrd>INVOICE 44552</Ustrd>
      </RmtInf>
    </TxDtls>
  </NtryDtls>
</Ntry>
```

every field has a defined type. a counterparty name is always `<Nm>`. a remittance reference is always `<RmtInf>`. there is no ambiguity — no guessing whether `?32` means a counterparty name in this particular dialect, no wondering if the amount field uses a comma or a period as a decimal separator. the XML schema enforces structure at the protocol level.

the transition isn't theoretical. swift set a hard deadline: the MT/ISO 20022 cross-border coexistence period ended on november 22, 2025. after that date, financial institutions were expected to be processing payment instructions natively in ISO 20022. the MT format still exists in contingency and legacy channels, but its role as the primary cross-border messaging standard is over.

why the industry agreed to this massive, expensive migration:

**structured data end-to-end.** ISO 20022 messages carry party names, addresses, remittance information, and regulatory data as explicit fields, not as a blob of text inside an undefined container. this means automated systems can extract counterparty names, match invoices, and flag suspicious transactions without human parsing.

**no more format guessing.** a tag 86 line could be swift structured, GVC, angular, or unstructured — and the only way to know is to try parsing it with each decoder. a `camt.053` entry is always XML. the schema is public, machine-readable, and unambiguous.

**better compliance and fraud detection.** structured data enables automated screening against sanctions lists, fraud detection based on counterparty patterns, and regulatory reporting with traceable data lineage. all of this was possible with MT940 in theory but required per-bank, per-dialect extraction logic that was brittle and incomplete.

**cross-border interoperability without translation layers.** in the MT era, a transaction originating in ISO 20022 might get converted to MT format during its cross-border journey through a correspondent bank, silently losing structured data. the coexistence end means transactions can travel end-to-end in a single, rich format.

**modern technology integration.** XML namespaces, schema validation, and XPath querying are standard tools in any modern tech stack. MT940's fixed-width, tag-based flat text format requires custom tokenizers, finite state machines, and dialect-specific decoders — all bespoke code that must be maintained and tested across edge cases.

## what this means for engineers

if you're building financial software today, you should be thinking about this transition along two axes:

**ingestion: you still need MT940 support, painfully.** despite the migration, MT940 will exist in production for years. banks move slowly. legacy systems don't get rewritten overnight. a practical statement ingestion pipeline in 2026 supports both camt.053 XML and MT940, ideally with auto-detection of format and dialect. the good news is that the MT940 dialect problem is now well-understood — there are exactly four formats to handle, and the detection heuristics are reliable.

**emission: target ISO 20022 natively.** if you're building a new system that generates or processes financial messages, don't emit MT940. emit camt.053. the XML schemas are published by swift and ISO. every major banking platform supports ingestion. you'll spend less time explaining your format to partners and zero time debugging dialect mismatches.

## the broader lesson

the MT940 tag 86 story is a case study in how standards evolve — or fail to evolve — under real-world constraints. a field left undefined in the 1970s because nobody needed cross-border statement parsing spawned four incompatible national formats, decades of parser engineering work, and ultimately a global migration to a completely different format technology.

the next time you're designing an API or a data format and you're tempted to leave a field as "free text — implementers will figure it out," remember that implementers did figure it out. four different ways. and now the entire global financial system is spending billions of dollars to undo that decision.

# TOON Grammar Draft

TOON means Token-Oriented Object Notation. AVL uses it for `@state` because many page states are tabular, repetitive, and expensive when serialized as JSON.

This document is a draft grammar for AVL's TOON profile. It is intentionally conservative: enough structure to validate producer output without trying to become a general-purpose data language.

## Encoding Rules

- Documents are UTF-8 text.
- Indentation is two spaces per level.
- A line is either a named scalar, a named collection header, or a collection row.
- Keys are ASCII identifiers: letters, digits, `_`, and `-`, starting with a letter or `_`.
- Null is `~`.
- Booleans are `true` and `false`.
- Numbers use JSON number syntax.
- Dates are encoded as strings, usually ISO 8601.
- Strings containing commas, quotes, carriage returns, or newlines must be double-quoted.
- Quoted strings escape `"` as `\"` and `\` as `\\`.

## Forms

### Scalar

```text
title: Hello AVL
active: true
count: 3
empty: ~
```

### Object

```text
site:
  name: Example
  url: https://example.com
```

### Scalar List

```text
tags[3]: avl, agents, cms
```

### Inline Object

```text
author{id,name}: 42, Ada Lovelace
```

### Tabular Object List

```text
posts[2]{id,title,slug}:
  1,Hello AVL,hello-avl
  2,"Agents, Not Scrapers",agents-not-scrapers
```

## ABNF Sketch

This ABNF is provisional and intended for validator development.

```abnf
document      = *(line LF)
line          = scalar-line / list-line / object-header / table-header / row-line / blank-line
blank-line    = *WSP

scalar-line   = indent key ":" SP value
list-line     = indent key "[" count "]:" [SP value-list]
object-header = indent key ":"
table-header  = indent key "[" count "]" "{" key-list "}:" 
row-line      = indent value-list

key-list      = key *("," key)
value-list    = value *("," value)

value         = null / boolean / number / quoted-string / bare-string
null          = "~"
boolean       = "true" / "false"
count         = 1*DIGIT
key           = (ALPHA / "_") *(ALPHA / DIGIT / "_" / "-")
indent        = *("  ")

quoted-string = DQUOTE *(escaped / unescaped) DQUOTE
escaped       = "\\" (DQUOTE / "\\")
unescaped     = %x20-21 / %x23-5B / %x5D-10FFFF
bare-string   = 1*(%x21 / %x23-2B / %x2D-10FFFF)
```

## Validator Requirements

A TOON validator should:

- Reject malformed indentation.
- Reject mismatched list counts.
- Reject tabular rows with the wrong column count.
- Reject unquoted strings that contain commas or quotes.
- Parse scalar values into null, boolean, number, or string.
- Preserve key order for round-trip fixtures.

## Fixtures

Fixtures live under:

```text
specs/fixtures/valid/
specs/fixtures/invalid/
```

They are intended to seed a future `avl validate-file` command.

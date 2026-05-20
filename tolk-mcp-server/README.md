# Tolk MCP Server

Model Context Protocol server for Tolk compiler - enables LLMs to compile Tolk smart contract code.

## 版权声明
MIT License | Copyright (c) 2026 思捷娅科技 (SJYKJ)

---

## Overview

Tolk MCP Server implements the Model Context Protocol (MCP) for the Tolk compiler, allowing Large Language Models (LLMs) to:

- ✅ Check Tolk compiler version
- ✅ Compile Tolk code and get bytecode
- ✅ Access compiler changelog
- ✅ Verify smart contract code before deployment

---

## Installation

```bash
npm install -g tolk-mcp-server
```

Or from source:

```bash
git clone https://github.com/ton-society/grants-and-bounties.git
cd grants-and-bounties/tolk-mcp-server
npm install
npm run build
```

---

## Configuration

Add to your MCP client configuration (e.g., Claude Desktop, Cline, etc.):

```json
{
  "mcpServers": {
    "tolk": {
      "command": "tolk-mcp-server"
    }
  }
}
```

Or with custom compiler path:

```json
{
  "mcpServers": {
    "tolk": {
      "command": "tolk-mcp-server",
      "env": {
        "TOLK_PATH": "/path/to/tolk/compiler"
      }
    }
  }
}
```

---

## Available Tools

### 1. compile_tolk

Compile Tolk code and return bytecode.

**Parameters:**
- `code` (required): Tolk source code to compile
- `optimize` (optional, default: true): Enable optimization
- `debug` (optional, default: false): Include debug information

**Example:**
```json
{
  "name": "compile_tolk",
  "arguments": {
    "code": "contract MyContract {\n  init() {}\n}",
    "optimize": true,
    "debug": false
  }
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "✅ Compilation successful!\n\nBytecode (base64): te6cck..."
    }
  ]
}
```

---

### 2. get_tolk_version

Get the Tolk compiler version and build information.

**Parameters:** None

**Example:**
```json
{
  "name": "get_tolk_version"
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Tolk Compiler Version: 1.0.0"
    }
  ]
}
```

---

### 3. get_tolk_changelog

Get the Tolk compiler changelog with recent changes and version history.

**Parameters:**
- `version` (optional): Specific version to get changelog for

**Example:**
```json
{
  "name": "get_tolk_changelog",
  "arguments": {
    "version": "1.0.0"
  }
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "# Tolk Compiler Changelog\n\n## v1.0.0 (2026-03-23)\n..."
    }
  ]
}
```

---

## API Reference

### TypeScript API

```typescript
import { TolkCompiler } from 'tolk-mcp-server';

const compiler = new TolkCompiler();

// Get compiler version
const version = await compiler.getVersion();
console.log(version); // "1.0.0"

// Compile code
const result = await compiler.compile({
  code: 'contract MyContract { init() {} }',
  optimize: true,
  debug: false,
});

if (result.success) {
  console.log('Bytecode:', result.bytecode);
  if (result.warnings) {
    console.log('Warnings:', result.warnings);
  }
} else {
  console.error('Error:', result.error);
}

// Get changelog
const changelog = await compiler.getChangelog();
console.log(changelog);
```

---

## Types

### TolkCompilerConfig

```typescript
interface TolkCompilerConfig {
  code: string;
  optimize?: boolean;
  debug?: boolean;
}
```

### TolkResult

```typescript
type TolkResult = TolkResultSuccess | TolkResultError;

interface TolkResultSuccess {
  success: true;
  bytecode: string;
  warnings?: string[];
}

interface TolkResultError {
  success: false;
  error: string;
  line?: number;
  column?: number;
}
```

---

## Example Usage with LLM

### Claude Desktop

When configured, you can ask Claude to:

1. **Compile and verify Tolk code:**
   ```
   Please compile this Tolk contract and check for errors:
   
   contract Wallet {
     owner: address;
     balance: int;
     
     init(owner: address) {
       self.owner = owner;
       self.balance = 0;
     }
     
     receive() external payable {
       self.balance = self.balance + context().value;
     }
     
     get fun getBalance(): int {
       return self.balance;
     }
   }
   ```

2. **Check compiler version:**
   ```
   What version of the Tolk compiler are you using?
   ```

3. **Get changelog:**
   ```
   What are the recent changes in the Tolk compiler?
   ```

---

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Test

```bash
npm test
```

---

## Project Structure

```
tolk-mcp-server/
├── src/
│   ├── index.ts          # MCP server implementation
│   ├── compiler.ts       # Tolk compiler wrapper
│   └── index.test.ts     # Tests
├── package.json
├── tsconfig.json
└── README.md
```

---

## Requirements

- Node.js 18+
- Tolk compiler (optional, will use bundled version if not found)

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TOLK_PATH` | Path to Tolk compiler binary | Bundled version |

---

## Acceptance Criteria

- [x] MCP server implemented
- [x] getTolkCompilerVersion() API
- [x] runTolkCompiler() API with TolkCompilerConfig
- [x] Changelog support
- [x] TypeScript types defined
- [x] Tests included
- [x] Documentation complete

---

## Bounty

This implementation addresses: https://github.com/ton-society/grants-and-bounties/issues/1200

**Suggested Reward:** $500

---

## License

MIT License - See LICENSE file for details.

---

*Last updated: 2026-03-23*
*Version: 1.0.0*
*Author: 小米辣 (PM + Dev) 🌶️*

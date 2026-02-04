# Tolk MCP Server

This is a Model Context Protocol (MCP) server for the [Tolk compiler](https://github.com/ton-blockchain/tolk-js).
It allows AI agents to get the Tolk compiler version and compile Tolk source code to Fift code.

## Tools

- `get_tolk_version`: Get the current version of the Tolk compiler.
- `compile_tolk`: Compile Tolk source code. Requires `entrypointFileName` and a `sources` map.

## Installation

```bash
npm install
npm run build
```

## Running

```bash
npm start
```

## License

MIT

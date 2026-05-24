# WASM wrapper for TON Tolk Language

**Tolk** is a next-generation language for smart contracts in TON.
It replaces FunC with modern syntax, strong types, and built-in serialization — while generating even more efficient assembler code.

**tolk-js** is a WASM wrapper for Tolk compiler. 
[Blueprint](https://github.com/ton-org/blueprint) uses tolk-js to compile `.tolk` files, 
so if you develop contracts with blueprint, you don't have to install tolk-js directly.
However, you can use tolk-js without blueprint, it has a simple and straightforward API.

tolk-js works both in Node.js and browser (does not depend on filesystem).


## Installation

```
yarn add @ton/tolk-js
// or
npm install @ton/tolk-js
```


## CLI mode

Its purpose is to launch a Tolk compiler from command-line, without compiling ton repo from sources, 
without installing apt/homebrew packages, etc. Just run

```
npx @ton/tolk-js --output-json out.json contract.tolk
```

Output JSON will contain `fiftCode`, `codeBoc64`, `codeHashHex`, and other fields (launch to see).

There are some flags like `--cwd`, `--output-fift`, and others (run `npx @ton/tolk-js --help`).


## Usage example

```js
import {runTolkCompiler, getTolkCompilerVersion} from "@ton/tolk-js"

async function compileMainTolk() {
  // for example, file `main.tolk` is saved nearby
  // fsReadCallback (below) is called for both main.tolk and all its imports
  let result = await runTolkCompiler({
    entrypointFileName: 'main.tolk',
    fsReadCallback: path => fs.readFileSync(__dirname + '/' + path, 'utf-8')
  })
  if (result.status === 'error') {
    throw result.message
  }

  console.log(result.fiftCode)
  // using result.codeBoc64, you can construct a cell
  let codeCell = Cell.fromBoc(Buffer.from(result.codeBoc64, "base64"))[0]
  // result has several (probably useful) fields, look up TolkResultSuccess
}

async function showTolkVersion() {
  let version = await getTolkCompilerVersion()
  console.log(`Tolk v${version}`)
}
```

The only point to pay attention to is `fsReadCallback`. It's called for every `.tolk` file, input or imported, and you should synchronously return file contents. 
tolk-js does not access filesystem itself, it just provides a flexible callback, so you can make it easily work if you have file contents in memory, for example:
```js
let sources = {
  'main.tolk': 'import "utils/math.tolk"',
  'utils/math.tolk': '...',
}

runTolkCompiler({
  entrypointFileName: 'main.tolk',
  fsReadCallback: path => sources[path],
})
```

The function `runTolkCompiler()` accepts the following properties (look up `TolkCompilerConfig`):
* `entrypointFileName` — obvious
* `fsReadCallback` — explained above
* `optimizationLevel` (default 2) — controls Tolk compiler stack optimizer
* `withStackComments` (default false) — Fift output will contain stack comments, if you wish to debug its output
* `withSrcLineComments` (default false) — Fift output will contain line comments from original .tolk files
* `experimentalOptions` (default '') — you can pass experimental compiler options here


## Embedded stdlib functions

Tolk standard functions (`beginCell`, `assertEnd`, and lots of others) are available out of the box *(if you worked with FunC earlier, you had to download stdlib.fc and store in your project; in Tolk, you don't need any additional files)*.

It works, because all stdlib files are embedded into JS, placed near wasm. If you `import "@stdlib/tvm-dicts"` for example, tolk-js will handle it, `fsReadCallback` won't be called.

Note, that folder `tolk-stdlib/` and files within it exist only for IDE purposes. For example, if you use blueprint or tolk-js directly, JetBrains and VS Code plugins locate this folder and auto-complete stdlib functions. 

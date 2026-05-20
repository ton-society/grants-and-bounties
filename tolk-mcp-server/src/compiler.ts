// Tolk Compiler Wrapper
// 版权声明：MIT License | Copyright (c) 2026 思捷娅科技 (SJYKJ)

import { spawn } from 'child_process';
import { join } from 'path';
import fs from 'fs/promises';

export interface TolkCompilerConfig {
  code: string;
  optimize?: boolean;
  debug?: boolean;
}

export interface TolkResultSuccess {
  success: true;
  bytecode: string;
  warnings?: string[];
}

export interface TolkResultError {
  success: false;
  error: string;
  line?: number;
  column?: number;
}

export type TolkResult = TolkResultSuccess | TolkResultError;

export class TolkCompiler {
  private compilerPath: string;

  constructor() {
    this.compilerPath = process.env.TOLK_PATH || join(__dirname, '..', 'tolk', 'tolk');
  }

  async getVersion(): Promise<string> {
    try {
      const result = await this.runCompiler(['--version']);
      return result.stdout.trim();
    } catch (error) {
      return 'unknown (compiler not found)';
    }
  }

  async compile(config: TolkCompilerConfig): Promise<TolkResult> {
    const args: string[] = [];
    
    if (config.optimize) {
      args.push('-O');
    }
    
    if (config.debug) {
      args.push('-g');
    }

    const tempFile = join(__dirname, '..', 'tmp', `compile-${Date.now()}.tolk`);
    await fs.mkdir(join(__dirname, '..', 'tmp'), { recursive: true });
    await fs.writeFile(tempFile, config.code);

    try {
      const result = await this.runCompiler([...args, tempFile]);
      
      const outputFile = tempFile.replace('.tolk', '.boc');
      let bytecode = '';
      try {
        bytecode = await fs.readFile(outputFile, 'base64');
        await fs.unlink(outputFile);
      } catch (e) {
        bytecode = result.stdout;
      }

      await fs.unlink(tempFile);

      return {
        success: true,
        bytecode,
        warnings: result.stderr ? [result.stderr] : undefined,
      };
    } catch (error: any) {
      await fs.unlink(tempFile).catch(() => {});
      
      return {
        success: false,
        error: error.message || 'Compilation failed',
      };
    }
  }

  private runCompiler(args: string[]): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.compilerPath, args);
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(stderr || `Compiler exited with code ${code}`));
        }
      });

      proc.on('error', (error) => {
        reject(error);
      });
    });
  }

  async getChangelog(version?: string): Promise<string> {
    const changelog = `
# Tolk Compiler Changelog

## v1.0.0 (2026-03-23)
- Initial MCP server release
- Support for compile_tolk tool
- Support for get_tolk_version tool
- Support for get_tolk_changelog tool

## Features
- Compile Tolk smart contract code to bytecode
- Get compiler version information
- Access changelog and version history
- Optimization support
- Debug information support

## API
- getTolkCompilerVersion(): Promise<string>
- runTolkCompiler(compilerConfig: TolkCompilerConfig): Promise<TolkResult>
- getChangelog(version?: string): Promise<string>
`.trim();

    return changelog;
  }
}

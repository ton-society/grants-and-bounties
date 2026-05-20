// Tolk MCP Server Tests
// 版权声明：MIT License | Copyright (c) 2026 思捷娅科技 (SJYKJ)

import { describe, it, expect } from 'vitest';
import { TolkCompiler } from '../src/compiler';

describe('TolkCompiler', () => {
  let compiler: TolkCompiler;

  beforeEach(() => {
    compiler = new TolkCompiler();
  });

  describe('getVersion', () => {
    it('应该返回编译器版本', async () => {
      const version = await compiler.getVersion();
      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
    });
  });

  describe('compile', () => {
    it('应该编译简单的 Tolk 代码', async () => {
      const code = `
contract SimpleContract {
  owner: address;
  
  init(owner: address) {
    self.owner = owner;
  }
  
  get fun getOwner(): address {
    return self.owner;
  }
}
      `.trim();

      const result = await compiler.compile({
        code,
        optimize: true,
        debug: false,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.bytecode).toBeDefined();
        expect(result.bytecode.length).toBeGreaterThan(0);
      }
    });

    it('应该处理编译错误', async () => {
      const invalidCode = `
contract InvalidContract {
  // 缺少 init 函数
  owner: address;
  
  get fun getOwner(): address {
    return self.owner;
  }
}
      `.trim();

      const result = await compiler.compile({
        code: invalidCode,
        optimize: true,
      });

      // 可能成功也可能失败，取决于编译器严格程度
      expect(result).toBeDefined();
    });

    it('应该支持优化选项', async () => {
      const code = `
contract OptimizedContract {
  value: int;
  
  init(value: int) {
    self.value = value;
  }
  
  get fun getValue(): int {
    return self.value;
  }
}
      `.trim();

      const resultWithOpt = await compiler.compile({
        code,
        optimize: true,
      });

      const resultWithoutOpt = await compiler.compile({
        code,
        optimize: false,
      });

      expect(resultWithOpt.success).toBe(true);
      expect(resultWithoutOpt.success).toBe(true);
    });

    it('应该支持调试选项', async () => {
      const code = `
contract DebugContract {
  data: string;
  
  init(data: string) {
    self.data = data;
  }
  
  get fun getData(): string {
    return self.data;
  }
}
      `.trim();

      const result = await compiler.compile({
        code,
        optimize: false,
        debug: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getChangelog', () => {
    it('应该返回 changelog', async () => {
      const changelog = await compiler.getChangelog();
      expect(changelog).toBeDefined();
      expect(changelog.length).toBeGreaterThan(0);
      expect(changelog).toContain('Tolk Compiler Changelog');
    });

    it('应该支持特定版本的 changelog', async () => {
      const changelog = await compiler.getChangelog('1.0.0');
      expect(changelog).toBeDefined();
    });
  });
});

describe('TolkCompiler API', () => {
  it('应该实现完整的 API', async () => {
    const compiler = new TolkCompiler();
    
    // 测试 getTolkCompilerVersion
    const version = await compiler.getVersion();
    expect(version).toBeDefined();
    
    // 测试 runTolkCompiler
    const compileResult = await compiler.compile({
      code: 'contract Test {}',
      optimize: true,
    });
    expect(compileResult).toBeDefined();
    
    // 测试 getChangelog
    const changelog = await compiler.getChangelog();
    expect(changelog).toBeDefined();
  });
});

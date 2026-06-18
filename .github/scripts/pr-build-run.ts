/**
 * PR Build Runner
 * 执行构建步骤
 *
 * 用法: node pr-build-run.ts <target>
 * target: framework | shell
 */

import { execSync } from 'node:child_process';
import { existsSync, renameSync, unlinkSync } from 'node:fs';
import { setOutput } from './lib/github.ts';

type BuildTarget = 'framework' | 'shell';

interface BuildStep {
  name: string;
  command: string;
  errorMessage: string;
}

// ============== 构建步骤 ==============

function getCommonSteps (): BuildStep[] {
  return [
    // pnpm 已通过 GitHub Action (pnpm/action-setup) 预安装并固定 v9, 此处无需再次安装
    {
      name: 'Install dependencies',
      command: 'pnpm i',
      errorMessage: 'Failed to install dependencies',
    },
    {
      name: 'Type check',
      command: 'pnpm run typecheck',
      errorMessage: 'Type check failed',
    },
    {
      name: 'Test',
      command: 'pnpm test',
      errorMessage: 'Tests failed',
    },
    {
      name: 'Build WebUI',
      command: 'pnpm --filter napcat-webui-frontend run build',
      errorMessage: 'WebUI build failed',
    },
  ];
}

function getTargetSteps (target: BuildTarget): BuildStep[] {
  if (target === 'framework') {
    return [
      {
        name: 'Build Framework',
        command: 'pnpm run build:framework',
        errorMessage: 'Framework build failed',
      },
    ];
  }
  return [
    {
      name: 'Build Shell',
      command: 'pnpm run build:shell',
      errorMessage: 'Shell build failed',
    },
  ];
}

// ============== 执行器 ==============

function runStep (step: BuildStep): boolean {
  console.log(`\n::group::${step.name}`);
  console.log(`> ${step.command}\n`);

  try {
    execSync(step.command, {
      stdio: 'inherit',
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
    });
    console.log('::endgroup::');
    console.log(`✓ ${step.name}`);
    return true;
  } catch (_error) {
    console.log('::endgroup::');
    console.log(`✗ ${step.name}`);
    setOutput('error', step.errorMessage);
    return false;
  }
}

function postBuild (target: BuildTarget): void {
  const srcDir = target === 'framework'
    ? 'packages/napcat-framework/dist'
    : 'packages/napcat-shell/dist';
  const destDir = target === 'framework' ? 'framework-dist' : 'shell-dist';

  console.log(`\n→ Moving ${srcDir} to ${destDir}`);

  if (!existsSync(srcDir)) {
    throw new Error(`Build output not found: ${srcDir}`);
  }

  renameSync(srcDir, destDir);

  // Install production dependencies
  console.log('→ Installing production dependencies');
  execSync('npm install --omit=dev', {
    cwd: destDir,
    stdio: 'inherit',
    shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
  });

  // Remove package-lock.json
  const lockFile = `${destDir}/package-lock.json`;
  if (existsSync(lockFile)) {
    unlinkSync(lockFile);
  }

  console.log(`✓ Build output ready at ${destDir}`);
}

// ============== 主函数 ==============

function main (): void {
  const target = process.argv[2] as BuildTarget;

  if (!target || !['framework', 'shell'].includes(target)) {
    console.error('Usage: node pr-build-run.ts <framework|shell>');
    process.exit(1);
  }

  console.log(`🔨 Building NapCat.${target === 'framework' ? 'Framework' : 'Shell'}\n`);

  const steps = [...getCommonSteps(), ...getTargetSteps(target)];

  for (const step of steps) {
    if (!runStep(step)) {
      process.exit(1);
    }
  }

  postBuild(target);
  console.log('\n✅ Build completed successfully!');
}

main();

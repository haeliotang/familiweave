/**
 * LSM-0 offline evaluation CLI.
 *
 * Reads a local JSON/JSONL fixture, prints the deterministic descriptive
 * baseline report, and optionally writes the JSON report. No network access,
 * no new dependencies.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { evaluateLsm0Text, formatLsm0Report } from '../src/lsm0-eval'

const usage = [
  'Usage: pnpm tsx scripts/lsm0-baseline.ts --in <fixture.json|fixture.jsonl> [--out <report.json>]',
  '',
  'Read a local LSM-0 fixture, compute the prespecified descriptive metrics, and',
  'print a report. No network access. This baseline is not a clinical result.',
  '',
  'Options:',
  '  --in <path>   Local JSON or JSONL fixture (required)',
  '  --out <path>  Write the deterministic JSON report to this path',
  '  -h, --help    Show this help',
  '',
  'Exit codes: 0 report printed; 1 read/evaluation failure; 2 usage error.',
].join('\n')

class UsageError extends Error {}

function parseArguments(argv: readonly string[]): { inputPath: string; outputPath?: string } {
  let inputPath: string | undefined
  let outputPath: string | undefined
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index]
    if (argument === '--help' || argument === '-h') {
      process.stdout.write(`${usage}\n`)
      process.exit(0)
    }
    if (argument === '--in' || argument === '--out') {
      const value = argv[index + 1]
      if (value === undefined || value.startsWith('-')) throw new UsageError(`${argument} requires a path`)
      if (argument === '--in') inputPath = value
      else outputPath = value
      index++
      continue
    }
    throw new UsageError(`unknown argument: ${argument}`)
  }
  if (!inputPath) throw new UsageError('--in is required')
  return outputPath === undefined ? { inputPath } : { inputPath, outputPath }
}

try {
  const { inputPath, outputPath } = parseArguments(process.argv.slice(2))
  const text = await readFile(resolve(inputPath), 'utf8')
  const report = evaluateLsm0Text(text)
  process.stdout.write(`${formatLsm0Report(report)}\n`)
  if (outputPath !== undefined) {
    const resolvedOutput = resolve(outputPath)
    await writeFile(resolvedOutput, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    process.stdout.write(`JSON report written to ${resolvedOutput}\n`)
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  if (error instanceof UsageError) {
    process.stderr.write(`lsm0-baseline: ${message}\n\n${usage}\n`)
    process.exit(2)
  }
  process.stderr.write(`lsm0-baseline: ${message}\n`)
  process.exit(1)
}

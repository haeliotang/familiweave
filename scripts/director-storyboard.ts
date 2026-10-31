import { directorPlan } from '../src/director'
import { storyboard, storyboardMarkdown } from '../src/storyboard'

const args = process.argv.slice(2)
const usage = '用法：pnpm storyboard --memory "一句记忆" [--json]'

if (args.includes('--help') || args.includes('-h')) {
  process.stdout.write(`${usage}\n`)
  process.exit(0)
}

const memoryFlag = args.indexOf('--memory')
const memory = memoryFlag >= 0 ? args[memoryFlag + 1] : args.filter(arg => !arg.startsWith('--')).join(' ')
if (!memory) {
  process.stderr.write(`${usage}\n`)
  process.exit(2)
}

const plan = directorPlan({ memory })
const output = args.includes('--json') ? JSON.stringify(storyboard(plan), null, 2) : storyboardMarkdown(plan)
process.stdout.write(`${output}\n`)

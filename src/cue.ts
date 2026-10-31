export type Cue = 'wait' | 'repair' | 'general'

export function spokenLine(cue: Cue) {
  return cue === 'wait' ? '不用急，我走慢一点。' : cue === 'repair' ? '再试试，这下应该好了。' : '今天的风很好。'
}

export function cueFromMemory(memory: string): Cue {
  const clauses = memory.split(/[，。！？；,!?;\n]|但是|不过|可是|但/)
  const patterns = { wait: /回头|等我|等人|等你|落后|慢下脚步|走慢|走得慢|慢些走|停下来等|并肩走/, repair: /修理|修东西|修补|修好|修车|木工|缝补|缝衣服|拧紧|修一修|修一下|补一补|做木工|修家具/ }
  for (const cue of ['wait', 'repair'] as const) {
    const matching = clauses.filter(clause => patterns[cue].test(clause))
    // A contradictory or negated clause cannot establish an affirmative cue.
    if (matching.length && matching.every(clause => !/(?<!有)没|不|未|并非|(?<!特)别|很少/.test(clause))) return cue
  }
  return 'general'
}

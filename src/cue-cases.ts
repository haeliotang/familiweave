import type { Cue } from './cue'

export interface CueCase {
  text: string
  expected: Cue
  note: string
}

// Synthetic regression corpus for the limited cue classifier. It is deliberately
// small: the product must not infer a whole personality from one sentence.
export const cueCases: CueCase[] = [
  { text: '他走路时总会回头等我', expected: 'wait', note: 'wait: explicit 回头等我' },
  { text: '她总在路口等我一起走', expected: 'wait', note: 'wait: 等我一起' },
  { text: '他发现我落后就停下来等', expected: 'wait', note: 'wait: 落后 + 停下来等' },
  { text: '她走慢一点，怕我跟不上', expected: 'wait', note: 'wait: 走慢' },
  { text: '他常常慢下脚步', expected: 'wait', note: 'wait: 慢下脚步' },
  { text: '她回头看看我有没有跟上', expected: 'wait', note: 'wait: 回头' },
  { text: '他们并肩走的时候很安静', expected: 'wait', note: 'wait: 并肩走' },

  { text: '她喜欢修东西', expected: 'repair', note: 'repair: explicit 修东西' },
  { text: '他会修车', expected: 'repair', note: 'repair: 修车' },
  { text: '她做木工', expected: 'repair', note: 'repair: 木工' },
  { text: '他总把坏掉的椅子修好', expected: 'repair', note: 'repair: 修好' },
  { text: '她缝补旧衣服', expected: 'repair', note: 'repair: 缝补' },
  { text: '他拧紧松掉的螺丝', expected: 'repair', note: 'repair: 拧紧' },
  { text: '她喜欢修一修旧家具', expected: 'repair', note: 'repair: 修一修' },

  { text: '他喜欢蓝色', expected: 'general', note: 'general: no behavioral cue' },
  { text: '她常看天空', expected: 'general', note: 'general: no behavioral cue' },
  { text: '他从不迟到', expected: 'general', note: 'general: no supported cue' },
  { text: '她喜欢装修风格', expected: 'general', note: 'general: 装修 is not repair' },
  { text: '他喜欢修长的手指', expected: 'general', note: 'general: 修长 is not repair' },
  { text: '她不会修车', expected: 'general', note: 'negated repair' },
  { text: '他没有修好那件东西', expected: 'general', note: 'negated repair' },
  { text: '他从不回头等我', expected: 'general', note: 'negated wait' },
  { text: '她不会等你', expected: 'general', note: 'negated wait' },

  { text: '他不会修东西，但总会回头等我', expected: 'wait', note: 'separate affirmative clause' },
  { text: '她不等人，但喜欢修东西', expected: 'repair', note: 'separate affirmative clause' },
  { text: '他会回头等我，也从不回头等我', expected: 'general', note: 'contradictory clauses cancel' },
]

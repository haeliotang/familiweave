export type SomaticRegion = 'head' | 'jaw' | 'throat' | 'shoulders' | 'chest' | 'stomach' | 'back' | 'hands' | 'legs'

export type SomaticSensation = 'pressure' | 'heaviness' | 'hollowness' | 'tightness' | 'tingling' | 'heat' | 'cold' | 'numbness'

export type BreathState = 'held' | 'shallow' | 'fast' | 'deep' | 'even'

export type AssociativeFragmentId =
  | 'dusk-stairs'
  | 'wet-corridor'
  | 'cold-gaze'
  | 'window-rain'
  | 'empty-platform'
  | 'warm-door'
  | 'forest-edge'
  | 'mirror-room'

export interface SomaticCapture {
  region: SomaticRegion
  sensation: SomaticSensation
  intensity: 1 | 2 | 3 | 4 | 5
  breath: BreathState
  fragments: AssociativeFragmentId[]
}

export interface AssociativeFragment {
  id: AssociativeFragmentId
  label: string
  motifs: Array<'corridor' | 'door' | 'water' | 'house' | 'forest' | 'station' | 'mirror' | 'field'>
  light: string
  texture: string
  sound: string
  palette: string
}

export const regions: Array<{ value: SomaticRegion; label: string }> = [
  { value: 'head', label: '头' },
  { value: 'jaw', label: '下颌' },
  { value: 'throat', label: '喉咙' },
  { value: 'shoulders', label: '肩' },
  { value: 'chest', label: '胸口' },
  { value: 'stomach', label: '胃/腹部' },
  { value: 'back', label: '后背' },
  { value: 'hands', label: '手' },
  { value: 'legs', label: '腿' },
]

export const sensations: Array<{ value: SomaticSensation; label: string }> = [
  { value: 'pressure', label: '压迫' },
  { value: 'heaviness', label: '沉重' },
  { value: 'hollowness', label: '空/坠' },
  { value: 'tightness', label: '绷紧' },
  { value: 'tingling', label: '发麻' },
  { value: 'heat', label: '发热' },
  { value: 'cold', label: '发冷' },
  { value: 'numbness', label: '麻木' },
]

export const breaths: Array<{ value: BreathState; label: string }> = [
  { value: 'held', label: '屏住' },
  { value: 'shallow', label: '很浅' },
  { value: 'fast', label: '偏快' },
  { value: 'deep', label: '很深' },
  { value: 'even', label: '还算均匀' },
]

export const fragments: AssociativeFragment[] = [
  { id: 'dusk-stairs', label: '黄昏的楼梯间', motifs: ['house', 'corridor'], light: 'Amber dusk light, dust in the air, long stair shadows.', texture: 'Worn wood and cool plaster.', sound: 'Distant room tone and a faint outside hum.', palette: 'dusk' },
  { id: 'wet-corridor', label: '潮湿的走廊', motifs: ['corridor', 'water'], light: 'Dim, greenish light reflected from wet floor.', texture: 'Damp concrete and condensation.', sound: 'Water dripping slowly in a narrow space.', palette: 'wet' },
  { id: 'cold-gaze', label: '冰冷的注视', motifs: ['mirror', 'door'], light: 'Hard, pale light with a dark edge.', texture: 'Glass, cold metal, a still surface.', sound: 'A low, almost inaudible room tone.', palette: 'cold' },
  { id: 'window-rain', label: '窗边的雨', motifs: ['house', 'water'], light: 'Soft grey daylight through rain.', texture: 'Cold window glass and fabric.', sound: 'Rain on glass and muffled street sound.', palette: 'rain' },
  { id: 'empty-platform', label: '空站台', motifs: ['station', 'field'], light: 'Flat fluorescent light over an empty platform.', texture: 'Concrete, painted metal, open air.', sound: 'Distant rail hum and wind.', palette: 'station' },
  { id: 'warm-door', label: '半开的暖门', motifs: ['door', 'house'], light: 'Warm light spilling from a narrow opening.', texture: 'Painted wood and a worn handle.', sound: 'Quiet room tone from the other side.', palette: 'warm' },
  { id: 'forest-edge', label: '森林边缘', motifs: ['forest', 'field'], light: 'Low sun through leaves, deep green shade.', texture: 'Moss, bark and cold air.', sound: 'Leaves, wind and distant birds.', palette: 'forest' },
  { id: 'mirror-room', label: '镜子的房间', motifs: ['mirror', 'corridor'], light: 'Soft light multiplied by reflections.', texture: 'Cool glass and polished floor.', sound: 'A slight echo with no clear source.', palette: 'mirror' },
]

export function isSomaticCapture(value: unknown): value is SomaticCapture {
  if (!value || typeof value !== 'object') return false
  const capture = value as Partial<SomaticCapture>
  return regions.some(item => item.value === capture.region)
    && sensations.some(item => item.value === capture.sensation)
    && Number.isInteger(capture.intensity) && capture.intensity! >= 1 && capture.intensity! <= 5
    && breaths.some(item => item.value === capture.breath)
    && Array.isArray(capture.fragments)
    && capture.fragments.length > 0 && capture.fragments.length <= 3
    && capture.fragments.every(id => fragments.some(fragment => fragment.id === id))
}

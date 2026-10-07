import type { CityMeta, FilterState, Scope } from '@/types/dashboard'

export const SCOPE_LABELS: Record<Scope, string> = {
  mainland: '中国大陆',
  overseas: '境外',
  global: '全球',
}

export function filterIndices(cities: CityMeta[], f: FilterState): number[] {
  const out: number[] = []
  for (let i = 0; i < cities.length; i++) {
    const c = cities[i]
    if (f.scope === 'mainland') {
      if (c.scope !== 'mainland') continue
      if (f.provinces && !f.provinces.has(c.province)) continue
      if (f.tiers && !f.tiers.has(c.tier)) continue
    } else if (f.scope === 'overseas') {
      if (c.scope === 'mainland') continue
    }
    out.push(i)
  }
  return out
}

/** 省份列表（仅大陆） */
export function mainlandProvinces(cities: CityMeta[]): string[] {
  return [...new Set(cities.filter((c) => c.scope === 'mainland').map((c) => c.province))].sort()
}

/** 城市等级列表（仅大陆，按既定顺序） */
const TIER_ORDER = ['一线', '新一线', '二线', '三线', '四线', '五线', '其它']
export function mainlandTiers(cities: CityMeta[]): string[] {
  const tiers = new Set(cities.filter((c) => c.scope === 'mainland').map((c) => c.tier))
  return TIER_ORDER.filter((t) => tiers.has(t))
}

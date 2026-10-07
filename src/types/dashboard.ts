export interface CityMeta {
  name: string
  tier: string // 一线/新一线/二线/三线/四线/五线/港澳台/海外
  scope: 'mainland' | 'hkm' | 'intl'
  province: string // 中国大陆省份；境外为空
  country: string
  continent: string
  lat: number
  lon: number
}

export interface BinSpec {
  file: string
  metrics: string[]
  shape: [number, number, number]
  layout: string
}

export interface Manifest {
  version: number
  dates: string[]
  cities: CityMeta[]
  bins: {
    daily: BinSpec
    doy: BinSpec
    monthly: BinSpec
  }
}

/**
 * 指标键：
 * 模块分 l=光照(30) th=温湿(25) a=空气(20) e=风压(15) rn=降水(10)
 * 总分 s
 * 原始字段 t=均温 tx=最高温 tn=最低温 tapp=体感 txapp/tnapp=最高/最低体感
 * rh=湿度 dew=露点 sun=日照时数 psun=理论日照 u=日照率 cloud=云量 uv=UV rad=辐射
 * p25=PM2.5 p10=PM10 wind=风速 press=气压 rain=降水
 */
export interface DashData {
  manifest: Manifest
  /** 索引读取：bin=daily|doy|monthly，d 分别为日序/年内日序(0-365)/月份(0-11) */
  v: (bin: 'daily' | 'doy' | 'monthly', key: string, c: number, d: number) => number
  idx: Record<'daily' | 'doy' | 'monthly', Record<string, number>>
  C: number
  D: number
}

export type Scope = 'mainland' | 'overseas' | 'global'

export interface FilterState {
  scope: Scope
  /** null = 全选 */
  provinces: Set<string> | null
  /** null = 全选 */
  tiers: Set<string> | null
}

export const DEFAULT_FILTER: FilterState = { scope: 'mainland', provinces: null, tiers: null }

/** 表格行 */
export interface Row {
  name: string
  region: string
  s: number
  l: number
  th: number
  a: number
  e: number
  rn: number
  t: number
  tx: number
  tn: number
  tapp: number
  txapp: number
  tnapp: number
  rh: number
  dew: number
  sun: number
  psun: number
  u: number
  cloud: number
  uv: number
  rad: number
  p25: number
  p10: number
  wind: number
  press: number
  rain: number
}

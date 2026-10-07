/** 指标元数据：用于表格列头与格式化 */
export interface MetricMeta {
  key: string
  label: string
  unit?: string
  dec: number
}

export const MODULE_METAS: MetricMeta[] = [
  { key: 'l', label: '光照', unit: '/30', dec: 1 },
  { key: 'th', label: '温湿体感', unit: '/25', dec: 1 },
  { key: 'a', label: '空气', unit: '/20', dec: 1 },
  { key: 'e', label: '风压', unit: '/15', dec: 1 },
  { key: 'rn', label: '降水', unit: '/10', dec: 1 },
]

export const RAW_METAS: MetricMeta[] = [
  { key: 't', label: '均温', unit: '℃', dec: 1 },
  { key: 'tx', label: '最高温', unit: '℃', dec: 1 },
  { key: 'tn', label: '最低温', unit: '℃', dec: 1 },
  { key: 'tapp', label: '体感', unit: '℃', dec: 1 },
  { key: 'txapp', label: '最高体感', unit: '℃', dec: 1 },
  { key: 'tnapp', label: '最低体感', unit: '℃', dec: 1 },
  { key: 'rh', label: '湿度', unit: '%', dec: 0 },
  { key: 'dew', label: '露点', unit: '℃', dec: 1 },
  { key: 'sun', label: '日照时数', unit: 'h', dec: 2 },
  { key: 'psun', label: '理论日照', unit: 'h', dec: 2 },
  { key: 'u', label: '日照率', unit: '%', dec: 0 },
  { key: 'cloud', label: '云量', unit: '%', dec: 0 },
  { key: 'uv', label: 'UV', dec: 1 },
  { key: 'rad', label: '辐射', unit: 'MJ/m²', dec: 1 },
  { key: 'p25', label: 'PM2.5', unit: 'μg/m³', dec: 0 },
  { key: 'p10', label: 'PM10', unit: 'μg/m³', dec: 0 },
  { key: 'wind', label: '风速', unit: 'km/h', dec: 1 },
  { key: 'press', label: '气压', unit: 'hPa', dec: 1 },
  { key: 'rain', label: '降水', unit: 'mm', dec: 1 },
]

export function fmt(v: number, dec: number): string {
  return v.toFixed(dec)
}

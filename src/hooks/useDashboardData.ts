import { useEffect, useState } from 'react'
import type { DashData, Manifest } from '@/types/dashboard'

export const MONTH_STARTS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]

/** 把月-日映射为 0-365 的日序（2月29日按2月28日处理） */
export function monthDayToDoy(m: number, d: number): number {
  return MONTH_STARTS[m - 1] + (d - 1)
}

export function doyToMonthDay(doy: number): { m: number; d: number } {
  let m = 11
  for (let i = 11; i >= 0; i--) {
    if (MONTH_STARTS[i] <= doy) {
      m = i
      break
    }
  }
  return { m: m + 1, d: doy - MONTH_STARTS[m] + 1 }
}

async function fetchBin(file: string): Promise<Float32Array> {
  const buf = await fetch(import.meta.env.BASE_URL + 'data/' + file).then((r) => {
    if (!r.ok) throw new Error('加载失败: ' + file)
    return r.arrayBuffer()
  })
  return new Float32Array(buf)
}

export function useDashboardData() {
  const [data, setData] = useState<DashData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const manifest = (await fetch(import.meta.env.BASE_URL + 'data/manifest.json').then((r) => {
          if (!r.ok) throw new Error('manifest 加载失败')
          return r.json()
        })) as Manifest
        const [daily, doy, monthly] = await Promise.all([
          fetchBin(manifest.bins.daily.file),
          fetchBin(manifest.bins.doy.file),
          fetchBin(manifest.bins.monthly.file),
        ])
        if (cancelled) return
        const idx = {
          daily: Object.fromEntries(manifest.bins.daily.metrics.map((k, i) => [k, i])),
          doy: Object.fromEntries(manifest.bins.doy.metrics.map((k, i) => [k, i])),
          monthly: Object.fromEntries(manifest.bins.monthly.metrics.map((k, i) => [k, i])),
        } as DashData['idx']
        const C = manifest.cities.length
        const D = manifest.dates.length
        const bufs = { daily, doy, monthly }
        const dims = { daily: D, doy: 366, monthly: 12 }
        const v = (bin: 'daily' | 'doy' | 'monthly', key: string, c: number, d: number): number => {
          const arr = bufs[bin]
          return arr[(idx[bin][key] * C + c) * dims[bin] + d]
        }
        setData({ manifest, v, idx, C, D })
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { data, error }
}

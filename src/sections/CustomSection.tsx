import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { DashData } from '@/types/dashboard'
import { monthDayToDoy, doyToMonthDay } from '@/hooks/useDashboardData'
import type { Row, FilterState } from '@/types/dashboard'
import { DEFAULT_FILTER } from '@/types/dashboard'
import { filterIndices } from '@/lib/filters'
import FilterBar from '@/components/FilterBar'
import { ViewToggle, ScoreCells, RawCells, ScoreHead, RawHead, ALL_KEYS } from '@/sections/MonthlySection'

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function MonthDayPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: number // doy
  onChange: (doy: number) => void
}) {
  const { m, d } = doyToMonthDay(value)
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Select value={String(m)} onValueChange={(v) => onChange(monthDayToDoy(Number(v), Math.min(d, DAYS_IN_MONTH[Number(v) - 1])))}>
        <SelectTrigger className="h-8 w-[76px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => (
            <SelectItem key={i + 1} value={String(i + 1)} className="text-xs">
              {i + 1}月
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(d)} onValueChange={(v) => onChange(monthDayToDoy(m, Number(v)))}>
        <SelectTrigger className="h-8 w-[68px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: DAYS_IN_MONTH[m - 1] }, (_, i) => (
            <SelectItem key={i + 1} value={String(i + 1)} className="text-xs">
              {i + 1}日
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function CustomSection({ data }: { data: DashData }) {
  const [startDoy, setStartDoy] = useState(monthDayToDoy(10, 1))
  const [endDoy, setEndDoy] = useState(monthDayToDoy(10, 7))
  const [mode, setMode] = useState<'score' | 'raw'>('score')
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)

  const rows = useMemo<Row[]>(() => {
    const cities = data.manifest.cities
    const span = ((endDoy - startDoy + 366) % 366) + 1
    const doys: number[] = []
    for (let k = 0; k < span; k++) doys.push((startDoy + k) % 366)

    return filterIndices(cities, filter)
      .map((ci) => {
        const c = cities[ci]
        const row = { name: c.name, region: c.scope === 'mainland' ? c.province : c.country } as Row
        const rec = row as unknown as Record<string, number>
        for (const key of ALL_KEYS) {
          let sum = 0
          for (const doy of doys) sum += data.v('doy', key, ci, doy)
          rec[key] = sum / doys.length
        }
        return row
      })
      .sort((a, b) => b.s - a.s)
      .slice(0, 20)
  }, [data, startDoy, endDoy, filter])

  const { m: sm, d: sd } = doyToMonthDay(startDoy)
  const { m: em, d: ed } = doyToMonthDay(endDoy)

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">自定义时间段排名 · TOP 20</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              只选月-日（跨年循环匹配历史全部年份），自动计算该时段各城平均分数与全部原始数据
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
              <MonthDayPicker label="从" value={startDoy} onChange={setStartDoy} />
              <span className="text-muted-foreground">至</span>
              <MonthDayPicker label="到" value={endDoy} onChange={setEndDoy} />
            </div>
            <ViewToggle mode={mode} onChange={setMode} />
            <FilterBar data={data} value={filter} onChange={setFilter} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          当前时段：{sm}月{sd}日 → {em}月{ed}日 · 基于历史全部年份该时段的逐日记录平均
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">排名</TableHead>
                <TableHead>城市</TableHead>
                <TableHead>地区</TableHead>
                {mode === 'score' ? <ScoreHead /> : <RawHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={r.name}>
                  <TableCell className="font-medium tabular-nums">
                    <span className={i < 3 ? 'text-base font-bold text-primary' : ''}>{i + 1}</span>
                  </TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.region}</TableCell>
                  {mode === 'score' ? <ScoreCells r={r} /> : <RawCells r={r} />}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

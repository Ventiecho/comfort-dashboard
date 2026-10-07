import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { DashData } from '@/types/dashboard'
import type { Row, FilterState } from '@/types/dashboard'
import { DEFAULT_FILTER } from '@/types/dashboard'
import { scoreBadgeClass, scoreGrade } from '@/lib/scoreColor'
import { MODULE_METAS, RAW_METAS, fmt } from '@/lib/metrics'
import { filterIndices } from '@/lib/filters'
import FilterBar from '@/components/FilterBar'

export type ViewMode = 'score' | 'raw'

export function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex overflow-hidden rounded-md border text-xs">
      <button
        onClick={() => onChange('score')}
        className={`px-3 py-1.5 transition-colors ${
          mode === 'score' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
        }`}
      >
        舒适度分数
      </button>
      <button
        onClick={() => onChange('raw')}
        className={`px-3 py-1.5 transition-colors ${
          mode === 'raw' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
        }`}
      >
        原始数据
      </button>
    </div>
  )
}

export function ScoreCells({ r }: { r: Row }) {
  return (
    <>
      <TableCell className="text-right">
        <Badge className={`${scoreBadgeClass(r.s)} tabular-nums`}>{r.s.toFixed(1)}</Badge>
      </TableCell>
      {MODULE_METAS.map((m) => (
        <TableCell key={m.key} className="text-right tabular-nums">
          {fmt((r as unknown as Record<string, number>)[m.key], m.dec)}
        </TableCell>
      ))}
      <TableCell className="text-muted-foreground">{scoreGrade(r.s)}</TableCell>
    </>
  )
}

export function RawCells({ r }: { r: Row }) {
  return (
    <>
      {RAW_METAS.map((m) => (
        <TableCell key={m.key} className="text-right tabular-nums">
          {fmt((r as unknown as Record<string, number>)[m.key], m.dec)}
        </TableCell>
      ))}
    </>
  )
}

export function ScoreHead() {
  return (
    <>
      <TableHead className="text-right">总分</TableHead>
      {MODULE_METAS.map((m) => (
        <TableHead key={m.key} className="text-right">
          {m.label}
          <span className="text-muted-foreground">{m.unit}</span>
        </TableHead>
      ))}
      <TableHead>等级</TableHead>
    </>
  )
}

export function RawHead() {
  return (
    <>
      {RAW_METAS.map((m) => (
        <TableHead key={m.key} className="text-right">
          {m.label}
          {m.unit && <span className="text-muted-foreground">({m.unit})</span>}
        </TableHead>
      ))}
    </>
  )
}

export const ALL_KEYS = ['s', 'l', 'th', 'a', 'e', 'rn', ...RAW_METAS.map((m) => m.key)]

export default function MonthlySection({ data }: { data: DashData }) {
  const [month, setMonth] = useState(10)
  const [mode, setMode] = useState<ViewMode>('score')
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)

  const rows = useMemo<Row[]>(() => {
    const cities = data.manifest.cities
    return filterIndices(cities, filter)
      .map((ci) => {
        const c = cities[ci]
        const row = { name: c.name, region: c.scope === 'mainland' ? c.province : c.country } as Row
        const rec = row as unknown as Record<string, number>
        for (const k of ALL_KEYS) rec[k] = data.v('monthly', k, ci, month - 1)
        return row
      })
      .sort((a, b) => b.s - a.s)
      .slice(0, 20)
  }, [data, month, filter])

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">月度 TOP 20 · 城市舒适度排名</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              2022-08 至 2026-10 全时段各月平均 · 分数视图含五大模块得分，原始数据视图含全部 19 项指标
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ViewToggle mode={mode} onChange={setMode} />
            <FilterBar data={data} value={filter} onChange={setFilter} />
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <button
                  key={m}
                  onClick={() => setMonth(m)}
                  className={`h-7 w-8 rounded text-xs transition-colors ${
                    m === month ? 'bg-primary font-medium text-primary-foreground' : 'bg-muted hover:bg-muted-foreground/20'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
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

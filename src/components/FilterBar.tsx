import { useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CheckSquare, Square, ChevronDown } from 'lucide-react'
import type { DashData } from '@/types/dashboard'
import type { FilterState, Scope } from '@/types/dashboard'
import { SCOPE_LABELS, mainlandProvinces, mainlandTiers } from '@/lib/filters'

function MultiCheck({
  options,
  selected,
  onChange,
}: {
  options: string[]
  selected: Set<string> | null // null = 全选
  onChange: (s: Set<string> | null) => void
}) {
  const toggle = (o: string) => {
    const cur = new Set(selected ?? options)
    if (cur.has(o)) cur.delete(o)
    else cur.add(o)
    onChange(cur.size === options.length ? null : cur)
  }
  return (
    <div className="w-52">
      <div className="mb-1 flex items-center justify-between border-b pb-1.5 text-xs">
        <button
          className="flex items-center gap-1 text-primary hover:underline"
          onClick={() => onChange(null)}
        >
          <CheckSquare className="h-3.5 w-3.5" /> 全选
        </button>
        <button
          className="flex items-center gap-1 text-muted-foreground hover:underline"
          onClick={() => onChange(new Set())}
        >
          <Square className="h-3.5 w-3.5" /> 全不选
        </button>
      </div>
      <div className="max-h-64 space-y-0.5 overflow-y-auto pr-1">
        {options.map((o) => {
          const checked = selected === null || selected.has(o)
          return (
            <label key={o} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs hover:bg-muted">
              <input type="checkbox" className="h-3.5 w-3.5 accent-primary" checked={checked} onChange={() => toggle(o)} />
              {o}
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default function FilterBar({
  data,
  value,
  onChange,
}: {
  data: DashData
  value: FilterState
  onChange: (f: FilterState) => void
}) {
  const provinces = useMemo(() => mainlandProvinces(data.manifest.cities), [data])
  const tiers = useMemo(() => mainlandTiers(data.manifest.cities), [data])

  const provLabel =
    value.provinces === null ? `省份（全选）` : `省份（${value.provinces.size}/${provinces.length}）`
  const tierLabel = value.tiers === null ? `等级（全选）` : `等级（${value.tiers.size}/${tiers.length}）`

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex overflow-hidden rounded-md border text-xs">
        {(Object.keys(SCOPE_LABELS) as Scope[]).map((s) => (
          <button
            key={s}
            onClick={() => onChange({ ...value, scope: s })}
            className={`px-3 py-1.5 transition-colors ${
              value.scope === s ? 'bg-primary font-medium text-primary-foreground' : 'bg-background hover:bg-muted'
            }`}
          >
            {SCOPE_LABELS[s]}
          </button>
        ))}
      </div>
      {value.scope === 'mainland' && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                {provLabel} <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2">
              <MultiCheck options={provinces} selected={value.provinces} onChange={(p) => onChange({ ...value, provinces: p })} />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                {tierLabel} <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2">
              <MultiCheck options={tiers} selected={value.tiers} onChange={(t) => onChange({ ...value, tiers: t })} />
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  )
}

import { useState } from 'react'
import { CloudSun, LayoutDashboard, ScrollText } from 'lucide-react'
import { useDashboardData } from '@/hooks/useDashboardData'
import MapSection from '@/sections/MapSection'
import MonthlySection from '@/sections/MonthlySection'
import CustomSection from '@/sections/CustomSection'
import RulesPage from '@/pages/RulesPage'
import { Skeleton } from '@/components/ui/skeleton'

const TABS = [
  { key: 'dashboard', label: '看板', icon: LayoutDashboard },
  { key: 'rules', label: '评分规则', icon: ScrollText },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function Home() {
  const { data, error } = useDashboardData()
  const [tab, setTab] = useState<TabKey>('dashboard')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CloudSun className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight">全球城市天气舒适度看板</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              437 城（中国大陆 368 + 港澳台 4 + 国际 65）· 基于舒适区平台函数评分模型 · 数据：2022-08-04 至 2026-10-04 逐日 · 颜色：0 分红 → 50 分黄 → 100 分绿
            </p>
          </div>
          <div className="flex shrink-0 overflow-hidden rounded-md border text-sm">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 transition-colors ${
                  tab === t.key ? 'bg-primary font-medium text-primary-foreground' : 'bg-background hover:bg-muted'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {tab === 'rules' ? (
          <RulesPage />
        ) : (
          <>
            {error && <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            {!data && !error && (
              <div className="space-y-4">
                <Skeleton className="h-[680px] w-full" />
                <Skeleton className="h-[560px] w-full" />
              </div>
            )}
            {data && (
              <>
                <MapSection data={data} />
                <MonthlySection data={data} />
                <CustomSection data={data} />
              </>
            )}
          </>
        )}
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        评分模型：天空光照 30 + 温湿体感 25 + 空气洁净 20 + 风压环境 15 + 降水 10，极端惩罚封顶 35，核心短板触发 79 分门槛
      </footer>
    </div>
  )
}

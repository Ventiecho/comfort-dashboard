import { useEffect, useMemo, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, RotateCcw } from 'lucide-react'
import type { DashData } from '@/types/dashboard'

const SPEEDS = [
  { label: '慢速', daysPerSec: 3 },
  { label: '常速', daysPerSec: 8 },
  { label: '快速', daysPerSec: 20 },
]

const MAP_SCOPES = [
  { key: 'mainland', label: '中国大陆' },
  { key: 'global', label: '全球' },
  { key: 'overseas', label: '境外' },
] as const

type MapScope = (typeof MAP_SCOPES)[number]['key']

export default function MapSection({ data }: { data: DashData }) {
  const { manifest, v, D } = data
  const cities = manifest.cities
  const n = D
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInst = useRef<echarts.ECharts | null>(null)
  const [dayIdx, setDayIdx] = useState(n - 1)
  const [playing, setPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1)
  const [mapScope, setMapScope] = useState<MapScope>('mainland')
  const [mapReady, setMapReady] = useState(false)
  const [chartReady, setChartReady] = useState(false)

  // 可见城市（按地图范围）
  const visibleIdx = useMemo(() => {
    return cities
      .map((c, i) => ({ c, i }))
      .filter(({ c }) =>
        mapScope === 'mainland' ? c.scope === 'mainland' : mapScope === 'overseas' ? c.scope !== 'mainland' : true
      )
      .map(({ i }) => i)
  }, [cities, mapScope])

  // 初始化地图
  useEffect(() => {
    let disposed = false
    Promise.all([
      fetch(import.meta.env.BASE_URL + 'maps/china-all.json'),
      fetch(import.meta.env.BASE_URL + 'maps/world.json'),
    ])
      .then(async ([r1, r2]) => {
        if (!r1.ok || !r2.ok) throw new Error('地图数据加载失败')
        const china = await r1.json()
        const world = await r2.json()
        if (disposed) return
        echarts.registerMap('china-all', china as never)
        echarts.registerMap('world', world as never)
        setMapReady(true)
      })
      .catch((e) => console.error(e))
    return () => {
      disposed = true
    }
  }, [])

  // 播放循环
  useEffect(() => {
    if (!playing) return
    const ms = 1000 / SPEEDS[speedIdx].daysPerSec
    const t = setInterval(() => setDayIdx((i) => (i + 1) % n), ms)
    return () => clearInterval(t)
  }, [playing, speedIdx, n])

  // 创建/销毁图表（容器尺寸就绪后才初始化）
  useEffect(() => {
    if (!mapReady || !chartRef.current) return
    const el = chartRef.current
    let disposed = false
    const init = () => {
      if (disposed || chartInst.current || el.clientWidth < 10 || el.clientHeight < 10) return
      const chart = echarts.init(el)
      chartInst.current = chart
      setChartReady(true)
    }
    init()
    const ro = new ResizeObserver(init)
    ro.observe(el)
    const onResize = () => chartInst.current?.resize()
    window.addEventListener('resize', onResize)
    return () => {
      disposed = true
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      chartInst.current?.dispose()
      chartInst.current = null
      setChartReady(false)
    }
  }, [mapReady])

  // 更新数据帧
  useEffect(() => {
    const chart = chartInst.current
    if (!chart || !chartReady) return

    const tip = (name: string) => {
      const i = cities.findIndex((c) => c.name === name)
      if (i < 0) return name
      const g = (k: string) => v('daily', k, i, dayIdx)
      const region = cities[i].scope === 'mainland' ? cities[i].province : cities[i].country
      return (
        `<b>${name}</b>（${region}）　${manifest.dates[dayIdx]}<br/>` +
        `舒适度：<b>${g('s').toFixed(1)}</b> 分<br/>` +
        `<span style="opacity:.75;font-size:11px">` +
        `光照 ${g('l').toFixed(1)} / 温湿 ${g('th').toFixed(1)} / 空气 ${g('a').toFixed(1)}<br/>` +
        `风压 ${g('e').toFixed(1)} / 降水 ${g('rn').toFixed(1)}</span><br/>` +
        `均温 ${g('t').toFixed(1)}℃　湿度 ${g('rh').toFixed(0)}%<br/>` +
        `日照率 ${g('u').toFixed(0)}%　PM2.5 ${g('p25').toFixed(0)}<br/>` +
        `风速 ${g('wind').toFixed(1)}km/h　降水 ${g('rain').toFixed(1)}mm`
      )
    }

    const isChina = mapScope === 'mainland'

    const option: Record<string, unknown> = {
      animationDurationUpdate: 150,
      tooltip: {
        trigger: 'item',
        formatter: (p: { seriesType: string; name: string; value?: number | number[] }) => {
          if (p.seriesType === 'scatter' || typeof p.value === 'number') return tip(p.name)
          return p.name
        },
      },
      visualMap: {
        min: 0,
        max: 100,
        seriesIndex: 0,
        orient: 'horizontal',
        left: 'center',
        bottom: 6,
        text: ['100 绿', '0 红'],
        calculable: false,
        inRange: { color: ['#d73027', '#fee08b', '#1a9850'] },
        textStyle: { color: '#64748b', fontSize: 11 },
      },
    }

    if (isChina) {
      option.series = [
        {
          type: 'map',
          map: 'china-all',
          roam: true,
          zoom: 1.35,
          center: [104.5, 35.5],
          layoutCenter: ['50%', '46%'],
          layoutSize: '108%',
          scaleLimit: { min: 0.8, max: 8 },
          label: { show: false },
          itemStyle: { areaColor: '#eef1f5', borderColor: '#c3ccd6', borderWidth: 0.5 },
          emphasis: {
            label: { show: true, fontSize: 11, color: '#1e293b' },
            itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.3)' },
          },
          select: { disabled: true },
          data: visibleIdx.map((i) => ({ name: cities[i].name, value: v('daily', 's', i, dayIdx) })),
          zlevel: 2,
        },
      ]
    } else {
      // 全球/境外：世界国家底图 + 城市点位（圆点大小/颜色随舒适度变化）
      option.geo = {
        map: 'world',
        roam: true,
        zoom: mapScope === 'overseas' ? 1.5 : 1.15,
        center: mapScope === 'overseas' ? [18, 22] : [12, 32],
        layoutCenter: ['50%', '50%'],
        layoutSize: '100%',
        scaleLimit: { min: 0.8, max: 8 },
        label: { show: false },
        itemStyle: { areaColor: '#eef1f5', borderColor: '#c3ccd6', borderWidth: 0.4 },
        emphasis: {
          label: { show: false },
          itemStyle: { areaColor: '#e2e8f0' },
        },
        select: { disabled: true },
      }
      option.series = [
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          data: visibleIdx.map((i) => ({
            name: cities[i].name,
            value: [cities[i].lon, cities[i].lat, v('daily', 's', i, dayIdx)],
          })),
          symbolSize: (val: number[]) => 8 + (val[2] / 100) * 12,
          itemStyle: { borderColor: '#ffffff', borderWidth: 1, shadowBlur: 4, shadowColor: 'rgba(15,23,42,0.3)' },
          emphasis: {
            scale: 1.5,
            label: { show: true, formatter: '{b}', position: 'right', fontSize: 11, color: '#1e293b', fontWeight: 600 },
          },
          zlevel: 2,
        },
      ]
    }

    try {
      chart.setOption(option, { notMerge: true })
    } catch (e) {
      console.error('地图渲染失败（容器可能尚未就绪）', e)
    }
  }, [chartReady, mapReady, dayIdx, mapScope, visibleIdx, cities, manifest.dates, v])

  const dayStats = useMemo(() => {
    let sum = 0
    let mx = -1
    let mn = 101
    for (const i of visibleIdx) {
      const val = v('daily', 's', i, dayIdx)
      sum += val
      if (val > mx) mx = val
      if (val < mn) mn = val
    }
    return { avg: sum / visibleIdx.length, max: mx, min: mn }
  }, [dayIdx, visibleIdx, v])

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">地图热力图 · 逐日天气舒适度</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              0 分红（不舒适） → 50 分黄 → 100 分绿（舒适） · 中国大陆为城市轮廓填色，全球/境外为城市点位（圆点越大越舒适）· 拖动时间轴可停留在任意一天
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-md border text-xs">
              {MAP_SCOPES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setMapScope(s.key)}
                  className={`px-3 py-1.5 transition-colors ${
                    mapScope === s.key ? 'bg-primary font-medium text-primary-foreground' : 'bg-background hover:bg-muted'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPlaying(false)
                setDayIdx(n - 1)
              }}
            >
              <RotateCcw className="mr-1 h-4 w-4" /> 回到现在
            </Button>
            <Button size="sm" onClick={() => setPlaying(!playing)}>
              {playing ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
              {playing ? '暂停' : '播放'}
            </Button>
            <div className="flex overflow-hidden rounded-md border text-xs">
              {SPEEDS.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setSpeedIdx(i)}
                  className={`px-2.5 py-1.5 transition-colors ${
                    i === speedIdx ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-semibold tabular-nums text-primary">{manifest.dates[dayIdx]}</span>
          <span className="tabular-nums text-muted-foreground">
            当日均分 <b className="text-foreground">{dayStats.avg.toFixed(1)}</b> · 最高{' '}
            <b className="text-green-600">{dayStats.max.toFixed(0)}</b> · 最低{' '}
            <b className="text-red-600">{dayStats.min.toFixed(0)}</b>
          </span>
        </div>
        <Slider
          value={[dayIdx]}
          min={0}
          max={n - 1}
          step={1}
          onValueChange={(val) => {
            setPlaying(false)
            setDayIdx(val[0])
          }}
          className="mb-2"
        />
        <div ref={chartRef} style={{ height: 560 }} />
      </CardContent>
    </Card>
  )
}

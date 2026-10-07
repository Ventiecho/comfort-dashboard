import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Sun,
  Thermometer,
  Wind,
  Gauge,
  CloudRainWind,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react'

/* ---------- 小部件 ---------- */

function SectionTitle({ no, children }: { no: string; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
        {no}
      </span>
      {children}
    </h2>
  )
}

function ModuleBlock({
  icon,
  title,
  rows,
}: {
  icon: ReactNode
  title: string
  rows: [string, string, string][]
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
        <span className="text-primary">{icon}</span>
        {title}
      </h3>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead className="w-40">子项</TableHead>
              <TableHead className="w-20 text-center">满分</TableHead>
              <TableHead>计分规则</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(([item, full, rule]) => (
              <TableRow key={item}>
                <TableCell className="font-medium">{item}</TableCell>
                <TableCell className="text-center tabular-nums">{full}</TableCell>
                <TableCell className="text-muted-foreground">{rule}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ---------- F(x) 平台函数图 ---------- */

function PlateauChart() {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">核心函数 F(x)：舒适区平台 · 出区线性扣分</p>
      <svg viewBox="0 0 400 200" className="w-full max-w-md">
        {/* 坐标轴 */}
        <line x1="30" y1="20" x2="30" y2="176" stroke="#2B2620" strokeWidth="1.5" />
        <line x1="30" y1="176" x2="396" y2="176" stroke="#2B2620" strokeWidth="1.5" />
        {/* 平台折线：起点/终点落在坐标轴端点 */}
        <polyline points="30,166 125,26 315,26 396,166" fill="none" stroke="#C2410C" strokeWidth="3" />
        {/* 轴标签 */}
        <text x="14" y="30" fontSize="13" fontWeight="bold" fill="#C2410C">
          M
        </text>
        <text x="119" y="194" fontSize="13" fontWeight="bold" fill="#C2410C" textAnchor="middle">
          L
        </text>
        <text x="315" y="194" fontSize="13" fontWeight="bold" fill="#C2410C" textAnchor="middle">
          U
        </text>
      </svg>
      <p className="mt-1 text-xs text-muted-foreground">x 落入 [L, U] 得满分 M；每偏出 1 单位扣 k 分，扣完为止（下限 0）</p>
    </div>
  )
}

/* ---------- 数据 ---------- */

const STEPS = [
  { no: '1', strong: '基础分 Base ＝ 100 分', sub: '光照 30 ＋ 温湿体感 25 ＋ 空气 20 ＋ 风压 15 ＋ 降水 10' },
  { no: '2', strong: '极端惩罚 Penalty（合计封顶 35 分）', sub: '霾、大风、闷湿、酷暑、无温差五项叠加，最多扣 35 分' },
  { no: '3', strong: '资格门槛 gate', sub: '空气 < 8、光照 < 15、温湿体感 < 12 任一成立 → 当日总分封顶 79' },
  { no: '4', strong: '总分 Final ＝ max(Base − Penalty, 0)', sub: '输出 0–100 的逐日总分 s；触发门槛时最终不高于 79' },
]

const MODULES: { icon: ReactNode; title: string; rows: [string, string, string][] }[] = [
  {
    icon: <Sun className="h-4 w-4" />,
    title: '模块 1 · 天空光照 — 30 分',
    rows: [
      ['日照率', '10', '日照时数 ÷ 理论最大日照时数，按比例给分（日照率 ≥ 100% 即满分）'],
      ['云量', '10', '总云量 0% 得 10 分，云量每增加 10% 扣 1 分，扣完为止'],
      ['太阳辐射', '5', '总辐射 12–20 MJ/m² 满分；每偏出 1 MJ/m² 扣 0.5'],
      ['紫外线', '5', 'UV 指数 2–4 满分；每偏出 1 扣 0.8'],
    ],
  },
  {
    icon: <Thermometer className="h-4 w-4" />,
    title: '模块 2 · 温湿体感 — 25 分',
    rows: [
      ['体感温度', '7', '平均体感 14–18℃ 满分；每偏出 1℃ 扣 0.8'],
      ['昼夜温差', '6', '最高温 − 最低温 8–12℃ 满分；每偏出 1℃ 扣 0.75'],
      ['露点', '7', '≤ 12℃ 一律满分（干爽不罚）；＞ 12℃ 每高 1℃ 扣 0.8 —— 只罚闷、不罚干'],
      ['日平均气温', '5', '均温 16–18℃ 满分；每偏出 1℃ 扣 0.8'],
    ],
  },
  {
    icon: <Wind className="h-4 w-4" />,
    title: '模块 3 · 空气洁净 — 20 分',
    rows: [
      ['PM2.5', '12', '≤ 10 μg/m³ 满分；每超 1 μg/m³ 扣 0.3'],
      ['PM10', '8', '≤ 20 μg/m³ 满分；每超 1 μg/m³ 扣 0.1'],
    ],
  },
  {
    icon: <Gauge className="h-4 w-4" />,
    title: '模块 4 · 风压环境 — 15 分',
    rows: [
      ['风速', '10', '2–3 m/s 满分；每偏出 1 m/s 扣 2（原始数据 km/h 先 ÷ 3.6 换算）'],
      ['海平面气压', '5', '1015–1022 hPa 满分；每偏出 1 hPa 扣 0.4'],
    ],
  },
  {
    icon: <CloudRainWind className="h-4 w-4" />,
    title: '模块 5 · 降水 — 10 分',
    rows: [['降水量', '10', '无降水（0 mm）得 10 分；每 1 mm 扣 2 分，≥ 5 mm 为 0 分']],
  },
]

const PENALTIES: [string, string, string, string][] = [
  ['霾 e25', 'PM2.5 ＞ 35 μg/m³', '每超 1 μg/m³ 扣 0.5', '20'],
  ['大风 eW', '风速 ＞ 6 m/s', '每超 1 m/s 扣 5', '15'],
  ['闷湿 eDw', '露点 ＞ 18℃', '每高 1℃ 扣 3', '12'],
  ['酷暑 eT', '最高气温 ＞ 30℃', '每高 1℃ 扣 2', '10'],
  ['无温差 eR', '昼夜温差 ＜ 4℃', '每少 1℃ 扣 2', '8'],
]

const GRADES: { range: string; label: string; text: string; fill: string }[] = [
  { range: '≥ 90', label: '顶级舒适', text: '#15803D', fill: '#DCFCE7' },
  { range: '85–89', label: '非常优秀', text: '#4D7C0F', fill: '#ECFCCB' },
  { range: '80–84', label: '舒适', text: '#A16207', fill: '#FEF9C3' },
  { range: '70–79', label: '尚可', text: '#B45309', fill: '#FEF3C7' },
  { range: '60–69', label: '普通', text: '#C2410C', fill: '#FFEDD5' },
  { range: '< 60', label: '不舒适', text: '#B91C1C', fill: '#FEE2E2' },
]

/* ---------- 页面 ---------- */

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* 标题区 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-orange-700">天气舒适度 · 评分细则全解</p>
              <CardTitle className="text-2xl">天气舒适度评分模型</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                满分 100 分，逐日打分：五大模块加总得基础分，减去极端惩罚，核心模块失守时触发资格门槛
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-xs text-muted-foreground">满分 </span>
              <span className="text-4xl font-bold text-orange-700 tabular-nums">100</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ① 一条主线 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <SectionTitle no="①">一条主线：模块加总 → 极端惩罚 → 资格门槛</SectionTitle>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
          <PlateauChart />
          <ol className="space-y-1">
            {STEPS.map((s, i) => (
              <li key={s.no}>
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-primary-foreground ${
                      s.no === '4' ? 'bg-orange-700' : 'bg-primary'
                    }`}
                  >
                    {s.no}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{s.strong}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && <ChevronDown className="ml-1.5 mt-1 h-4 w-4 text-muted-foreground" />}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* ② 五大模块 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <SectionTitle no="②">五大模块 · 逐项计分规则</SectionTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {MODULES.map((m) => (
            <ModuleBlock key={m.title} icon={m.icon} title={m.title} rows={m.rows} />
          ))}
        </CardContent>
      </Card>

      {/* ③ 极端惩罚 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <SectionTitle no="③">极端惩罚 Penalty · 合计封顶 35 分</SectionTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead className="w-32">惩罚项</TableHead>
                  <TableHead className="w-56">触发条件</TableHead>
                  <TableHead>扣分规则</TableHead>
                  <TableHead className="w-24 text-center">单项封顶</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PENALTIES.map(([name, cond, rule, cap]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell className="text-muted-foreground">{cond}</TableCell>
                    <TableCell className="text-muted-foreground">{rule}</TableCell>
                    <TableCell className="text-center tabular-nums">{cap}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">五项相加后再整体封顶 35 分：Final ＝ max(Base − Penalty, 0)</p>
          <div className="rounded-md bg-slate-900 p-4 text-sm leading-relaxed text-slate-50">
            <p>
              <span className="flex items-center gap-1.5 font-bold text-amber-300">
                <ShieldAlert className="h-4 w-4" /> 资格门槛 gate
              </span>
              　空气 &lt; 8、光照 &lt; 15、温湿体感 &lt; 12 任一成立 → 当日总分即使算出 80+ 也压回 79。
            </p>
            <p className="mt-1.5 text-slate-300">雾霾天、阴雨天无法靠其他模块刷分混进优秀档。</p>
          </div>
        </CardContent>
      </Card>

      {/* ④ 等级与配色 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <SectionTitle no="④">分数 → 等级与配色</SectionTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {GRADES.map((g) => (
              <div
                key={g.range}
                className="rounded-md border px-2 py-3 text-center"
                style={{ backgroundColor: g.fill }}
              >
                <p className="text-lg font-bold tabular-nums" style={{ color: g.text }}>
                  {g.range}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: '#2B2620' }}>
                  {g.label}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            地图色标为 0 红（不舒适）→ 50 黄 → 100 绿（舒适）的连续渐变，与等级色同向：分越高越偏绿
          </p>
          <p className="text-sm">
            <b>聚合方式：</b>
            月视图与自定义时段排名，均把时段内逐日总分 s 与各模块分分别取平均，而非对原始气象要素平均后再重新打分。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

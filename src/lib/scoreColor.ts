/** 0 红（不舒适） -> 50 黄 -> 100 绿（舒适），与地图 visualMap 同一套色标 */
export function scoreColor(score: number): string {
  const c1 = [215, 48, 39] // 红
  const c2 = [254, 224, 139] // 黄
  const c3 = [26, 152, 80] // 绿
  const t = Math.max(0, Math.min(100, score)) / 100
  const from = t < 0.5 ? c1 : c2
  const to = t < 0.5 ? c2 : c3
  const k = t < 0.5 ? t * 2 : (t - 0.5) * 2
  const mix = from.map((f, i) => Math.round(f + (to[i] - f) * k))
  return `rgb(${mix[0]},${mix[1]},${mix[2]})`
}

export function scoreBadgeClass(score: number): string {
  if (score >= 90) return 'bg-green-100 text-green-700'
  if (score >= 85) return 'bg-lime-100 text-lime-700'
  if (score >= 80) return 'bg-yellow-100 text-yellow-700'
  if (score >= 70) return 'bg-amber-100 text-amber-700'
  if (score >= 60) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

export function scoreGrade(score: number): string {
  if (score >= 90) return '顶级舒适'
  if (score >= 85) return '非常优秀'
  if (score >= 80) return '舒适'
  if (score >= 70) return '尚可'
  if (score >= 60) return '普通'
  return '不舒适'
}

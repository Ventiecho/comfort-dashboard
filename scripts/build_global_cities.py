#!/usr/bin/env python3
"""生成 global-cities.json = 世界国家底图 + 真实城市边界 + 港澳台省级轮廓（去除旧的 Voronoi 假分区）。"""
import glob, json, os, re

ROOT = '/Users/ventiecho/work/weather/comfort-dashboard'
g = json.load(open(os.path.join(ROOT, 'public/maps/global-all.json')))
intl = json.load(open(os.path.join(ROOT, 'public/maps/intl-cities.json')))

HANT = re.compile(r'[\u4e00-\u9fff]')
keep_hkm = {'台湾省', '香港特别行政区', '澳门特别行政区'}

def is_han(name):
    return bool(HANT.search(name or ''))

feats = []
dropped = 0
for f in g['features']:
    name = f['properties'].get('name', '')
    if is_han(name) and name not in keep_hkm:
        dropped += 1  # 旧的 Voronoi 假分区 / 中国省市旧轮廓
        continue
    feats.append(f)

# 世界国家底图：旧文件的 45 个「有城市国家」缺国家多边形（被 Voronoi 吃掉），从 world.json 补齐
world = json.load(open(os.path.join(ROOT, 'public/maps/world.json')))
have = {f['properties'].get('name', '') for f in feats}
added = 0
for f in world['features']:
    if f['properties'].get('name', '') not in have:
        feats.append(f)
        have.add(f['properties']['name'])
        added += 1
print('countries added from world.json:', added)

feats.extend(intl['features'])
feats.extend(json.load(open(os.path.join(ROOT, 'public/maps/china-cities.json')))['features'])
out = {'type': 'FeatureCollection', 'features': feats}
path = os.path.join(ROOT, 'public/maps/global-cities.json')
with open(path, 'w') as fh:
    json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
print('countries kept:', sum(1 for f in feats if not is_han(f['properties'].get('name',''))))
print('dropped fake cells:', dropped)
print('city+hkm features added:', len(intl['features']))
print('saved', path, round(os.path.getsize(path) / 1e6, 2), 'MB')

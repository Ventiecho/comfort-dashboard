#!/usr/bin/env python3
"""合并缓存的城市边界 + 港澳台省级轮廓，生成 public/maps/intl-cities.json，并校验城市点在轮廓内。"""
import glob, json, math, os

ROOT = '/Users/ventiecho/work/weather/comfort-dashboard'
CACHE = os.path.join(ROOT, 'scripts/cache')

m = json.load(open(os.path.join(ROOT, 'public/data/manifest.json')))
coords = {c['name']: (c['lon'], c['lat']) for c in m['cities']}

def rings_of(geom):
    if geom['type'] == 'Polygon':
        return [geom['coordinates']]
    return geom['coordinates']

def pip(x, y, ring):
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]; xj, yj = ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside

def contains(geom, lon, lat):
    for poly in rings_of(geom):
        if poly and pip(lon, lat, poly[0]):
            if not any(pip(lon, lat, h) for h in poly[1:]):
                return True
    return False

feats = []
bad = []
for path in sorted(glob.glob(os.path.join(CACHE, '*.geojson'))):
    f = json.load(open(path))
    name = f['properties']['name']
    lon, lat = coords[name]
    if not contains(f['geometry'], lon, lat):
        bad.append(name)
    feats.append(f)
print('features:', len(feats), 'point-not-inside:', bad or 'none')

# 港澳台省级轮廓（复用 global-all.json 中的要素）
g = json.load(open(os.path.join(ROOT, 'public/maps/global-all.json')))
keep = {'台湾省', '香港特别行政区', '澳门特别行政区'}
for f in g['features']:
    if f['properties'].get('name') in keep:
        feats.append({'type': 'Feature', 'properties': {'name': f['properties']['name']},
                      'geometry': f['geometry']})
        print('added', f['properties']['name'])

out = {'type': 'FeatureCollection', 'features': feats}
path = os.path.join(ROOT, 'public/maps/intl-cities.json')
with open(path, 'w') as fh:
    json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
print('saved', path, round(os.path.getsize(path) / 1e6, 2), 'MB')

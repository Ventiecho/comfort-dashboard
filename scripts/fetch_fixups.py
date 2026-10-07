#!/usr/bin/env python3
"""补拉 Nominatim 初次未命中的城市边界（指定查询词与挑选规则）。"""
import json, os, time, urllib.parse, urllib.request

ROOT = '/Users/ventiecho/work/weather/comfort-dashboard'
CACHE = os.path.join(ROOT, 'scripts/cache')
UA = {'User-Agent': 'kimi-weather-dashboard/1.0 (local weather comfort dashboard)'}

FIXUPS = [
 ('孟买', 'Mumbai City district', 'in', 'en', 'boundary'),
 ('孟买', 'Mumbai Suburban District', 'in', 'en', 'boundary'),
 ('伊斯坦布尔', 'İstanbul', 'tr', 'en', 'boundary'),
 ('雅典', 'Municipality of Athens', 'gr', 'en', 'boundary'),
 ('斯德哥尔摩', 'Stockholm Municipality', 'se', 'en', 'boundary'),
 ('哥本哈根', 'Copenhagen Municipality', 'dk', 'en', 'boundary'),
 ('开罗', 'Cairo Governorate', 'eg', 'en', 'boundary'),
 ('突尼斯', 'Tunis Governorate', 'tn', 'en', 'boundary'),
 ('开普敦', 'City of Cape Town', 'za', 'en', 'boundary'),
 ('华盛顿', 'District of Columbia', 'us', 'en', 'boundary'),
 ('圣地亚哥', 'Provincia de Santiago', 'cl', 'en', 'boundary'),
 ('悉尼', 'City of Sydney', 'au', 'en', 'boundary'),
 ('墨尔本', 'City of Melbourne', 'au', 'en', 'boundary'),
 ('惠灵顿', 'Wellington City', 'nz', 'en', 'boundary'),
]

def round_geom(g):
    if g['type'] == 'Polygon':
        g['coordinates'] = [[[round(x, 5) for x in pt] for pt in ring] for ring in g['coordinates']]
    else:
        g['coordinates'] = [[[[round(x, 5) for x in pt] for pt in ring] for ring in poly]
                            for poly in g['coordinates']]
    return g

for name, q, cc, lang, want in FIXUPS:
    path = os.path.join(CACHE, f'{name}__{q.split(",")[0].replace(" ", "_")}.geojson')
    params = urllib.parse.urlencode({
        'q': q, 'format': 'geojson', 'polygon_geojson': 1, 'limit': 5,
        'dedupe': 0, 'countrycodes': cc, 'accept-language': lang})
    try:
        req = urllib.request.Request('https://nominatim.openstreetmap.org/search?' + params, headers=UA)
        with urllib.request.urlopen(req, timeout=60) as r:
            js = json.loads(r.read())
        pick = None
        for f in js.get('features', []):
            p = f.get('properties', {})
            if p.get('category') == want and f.get('geometry'):
                pick = f
                break
        if not pick:
            print(name, q, 'ERROR no boundary result')
            continue
        p = pick['properties']
        out = {'type': 'Feature',
               'properties': {'name': name, 'osm_name': p.get('name'),
                              'display_name': p.get('display_name')},
               'geometry': round_geom(pick['geometry'])}
        with open(path, 'w') as fh:
            json.dump(out, fh, ensure_ascii=False)
        print(name, '<-', p.get('display_name'))
    except Exception as e:
        print(name, q, 'ERROR', e)
    time.sleep(1.2)

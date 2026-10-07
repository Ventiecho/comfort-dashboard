#!/usr/bin/env python3
"""用 Nominatim 按城市英文名+国家码取行政边界 GeoJSON，逐个缓存。"""
import json, os, sys, time, urllib.parse, urllib.request

ROOT = '/Users/ventiecho/work/weather/comfort-dashboard'
CACHE = os.path.join(ROOT, 'scripts/cache')
os.makedirs(CACHE, exist_ok=True)
UA = {'User-Agent': 'kimi-weather-dashboard/1.0 (local weather comfort dashboard)'}

CITIES = [
 ('东京', 'Tokyo', 'jp'), ('大阪', 'Osaka', 'jp'), ('首尔', 'Seoul', 'kr'),
 ('新加坡', 'Singapore', 'sg'), ('曼谷', 'Bangkok', 'th'), ('清迈', 'Chiang Mai', 'th'),
 ('雅加达', 'Jakarta', 'id'), ('吉隆坡', 'Kuala Lumpur', 'my'), ('马尼拉', 'Manila', 'ph'),
 ('河内', 'Hanoi', 'vn'), ('胡志明市', 'Ho Chi Minh City', 'vn'), ('新德里', 'New Delhi', 'in'),
 ('孟买', 'Mumbai', 'in'), ('迪拜', 'Dubai', 'ae'), ('阿布扎比', 'Abu Dhabi', 'ae'),
 ('德黑兰', 'Tehran', 'ir'), ('伊斯坦布尔', 'Istanbul', 'tr'), ('伦敦', 'London', 'gb'),
 ('曼彻斯特', 'Manchester', 'gb'), ('巴黎', 'Paris', 'fr'), ('阿姆斯特丹', 'Amsterdam', 'nl'),
 ('都柏林', 'Dublin', 'ie'), ('柏林', 'Berlin', 'de'), ('汉堡', 'Hamburg', 'de'),
 ('维也纳', 'Vienna', 'at'), ('布拉格', 'Prague', 'cz'), ('布达佩斯', 'Budapest', 'hu'),
 ('华沙', 'Warsaw', 'pl'), ('苏黎世', 'Zurich', 'ch'), ('罗马', 'Rome', 'it'),
 ('米兰', 'Milan', 'it'), ('佛罗伦萨', 'Florence', 'it'), ('马德里', 'Madrid', 'es'),
 ('巴塞罗那', 'Barcelona', 'es'), ('里斯本', 'Lisbon', 'pt'), ('雅典', 'Athens', 'gr'),
 ('斯德哥尔摩', 'Stockholm', 'se'), ('哥本哈根', 'Copenhagen', 'dk'), ('奥斯陆', 'Oslo', 'no'),
 ('赫尔辛基', 'Helsinki', 'fi'), ('雷克雅未克', 'Reykjavik', 'is'), ('莫斯科', 'Moscow', 'ru'),
 ('圣彼得堡', 'Saint Petersburg', 'ru'), ('开罗', 'Cairo', 'eg'), ('突尼斯', 'Tunis', 'tn'),
 ('内罗毕', 'Nairobi', 'ke'), ('开普敦', 'Cape Town', 'za'), ('渥太华', 'Ottawa', 'ca'),
 ('多伦多', 'Toronto', 'ca'), ('温哥华', 'Vancouver', 'ca'), ('华盛顿', 'Washington, D.C.', 'us'),
 ('纽约', 'New York City', 'us'), ('洛杉矶', 'Los Angeles', 'us'), ('芝加哥', 'Chicago', 'us'),
 ('旧金山', 'San Francisco', 'us'), ('波士顿', 'Boston', 'us'), ('迈阿密', 'Miami', 'us'),
 ('西雅图', 'Seattle', 'us'), ('墨西哥城', 'Mexico City', 'mx'), ('里约热内卢', 'Rio de Janeiro', 'br'),
 ('布宜诺斯艾利斯', 'Buenos Aires', 'ar'), ('圣地亚哥', 'Santiago', 'cl'), ('悉尼', 'Sydney', 'au'),
 ('墨尔本', 'Melbourne', 'au'), ('惠灵顿', 'Wellington', 'nz'),
]

def fetch(name, q, cc):
    params = urllib.parse.urlencode({
        'q': q, 'format': 'geojson', 'polygon_geojson': 1, 'limit': 1,
        'countrycodes': cc, 'accept-language': 'en'})
    req = urllib.request.Request('https://nominatim.openstreetmap.org/search?' + params, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())

def main():
    start, end = int(sys.argv[1]), int(sys.argv[2])
    m = json.load(open(os.path.join(ROOT, 'public/data/manifest.json')))
    coords = {c['name']: (c['lat'], c['lon']) for c in m['cities']}
    for name, q, cc in CITIES[start:end]:
        path = os.path.join(CACHE, f'{name}.geojson')
        if os.path.exists(path):
            print(name, 'cache', flush=True)
            continue
        lat, lon = coords[name]
        try:
            js = fetch(name, q, cc)
            feats = js.get('features', [])
            if not feats:
                raise RuntimeError('no result')
            f = feats[0]
            p = f.get('properties', {})
            if p.get('category') != 'boundary':
                raise RuntimeError(f'not boundary: {p.get("category")}/{p.get("type")} {p.get("display_name")}')
            bbox = f.get('bbox')
            ok = bbox and bbox[0] - 0.5 <= lon <= bbox[2] + 0.5 and bbox[1] - 0.5 <= lat <= bbox[3] + 0.5
            # 坐标精度裁剪
            def rnd(r):
                return [round(x, 5) for x in r]
            g = f['geometry']
            if g['type'] == 'Polygon':
                g['coordinates'] = [[rnd(pt) for pt in ring] for ring in g['coordinates']]
            else:
                g['coordinates'] = [[[rnd(pt) for pt in ring] for ring in poly] for poly in g['coordinates']]
            out = {'type': 'Feature',
                   'properties': {'name': name, 'osm_name': p.get('name'),
                                  'display_name': p.get('display_name')},
                   'geometry': g}
            with open(path, 'w') as fh:
                json.dump(out, fh, ensure_ascii=False)
            print(name, 'ok', 'pt-in-bbox' if ok else 'PT-OUTSIDE!', p.get('display_name'), flush=True)
        except Exception as e:
            print(name, 'ERROR', e, flush=True)
        time.sleep(1.2)

if __name__ == '__main__':
    main()

"""Trace the outer silhouette of the temporary Living Curve bottle crop into a
hairline SVG outline (decorative motif). Usage:
python3 -I bottle_profile.py <living-curve-concept.png> <out.svg>"""
import zlib, struct, sys
src, dst = sys.argv[1], sys.argv[2]
data = open(src, 'rb').read()
w, h, _, ct = struct.unpack('>IIBB', data[16:26]); ch = {2: 3, 6: 4}[ct]
idat = b''; i = 8
while i < len(data):
    L = struct.unpack('>I', data[i:i+4])[0]
    if data[i+4:i+8] == b'IDAT': idat += data[i+8:i+8+L]
    i += 12 + L
raw = zlib.decompress(idat); stride = w*ch + 1
# undo PNG row filters (the file is written by our own scripts with filter 0, but be safe)
assert all(raw[y*stride] == 0 for y in range(h)), 'expects unfiltered rows'
BG = (0xed, 0xef, 0xf0)
def ink(x, y):
    o = y*stride + 1 + x*ch
    return sum(abs(a - b) for a, b in zip(raw[o:o+3], BG)) > 14
rows = []
for y in range(h):
    xs = [x for x in range(w) if ink(x, y)]
    if xs: rows.append((y, min(xs), max(xs)))
rows = rows[:-8]  # drop the contact shadow under the base
y0, y1 = rows[0][0], rows[-1][0]
def med(v): v = sorted(v); return v[len(v)//2]
pts = []
for k in range(0, len(rows), 1):
    win = rows[max(0, k-10):k+11]
    pts.append((rows[k][0], med([r[1] for r in win]), med([r[2] for r in win])))
cx = med([(l + r) / 2 for _, l, r in pts])
# symmetric outline from the half-width, moving-averaged (+-12 rows) to remove pixel noise
hw = [(r - l) / 2 for _, l, r in pts]
sm = [sum(hw[max(0, k-12):k+13]) / len(hw[max(0, k-12):k+13]) for k in range(len(hw))]
step = 18
idx = list(range(0, len(pts), step)) + ([len(pts) - 1] if (len(pts) - 1) % step else [])
half = [(pts[k][0], sm[k]) for k in idx]
right = [(cx + hw, y) for y, hw in half]
left = [(cx - hw, y) for y, hw in reversed(half)]
poly = right + left
def cr2bez(p):
    n = len(p); out = [f'M{p[0][0]:.1f} {p[0][1]:.1f}']
    for i in range(n - 1):
        p0 = p[i-1] if i else p[i]; p1 = p[i]; p2 = p[i+1]; p3 = p[i+2] if i + 2 < n else p2
        c1 = (p1[0] + (p2[0]-p0[0])/6, p1[1] + (p2[1]-p0[1])/6)
        c2 = (p2[0] - (p3[0]-p1[0])/6, p2[1] - (p3[1]-p1[1])/6)
        out.append(f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}')
    return ''.join(out) + 'Z'
pad = 2
minx = min(x for x, _ in poly) - pad; maxx = max(x for x, _ in poly) + pad
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{minx:.1f} {y0 - pad} {maxx - minx:.1f} {y1 - y0 + 2*pad}" '
       f'fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke">\n'
       f'  <path vector-effect="non-scaling-stroke" d="{cr2bez(poly)}"/>\n</svg>\n')
open(dst, 'w').write(svg)
print(dst, f'{maxx-minx:.0f}x{y1-y0}', len(poly), 'points')

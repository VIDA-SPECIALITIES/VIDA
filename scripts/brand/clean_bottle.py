"""Crop the Living Curve bottle from the decoded Design Codex PNG and blank
guide lines/labels outside the bottle silhouette (row-wise) to the sheet's
background colour, then tint so that background equals the site mist #EDEFF0. Usage: python3 -I clean_bottle.py <in.png> <out.png>"""
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
X0, X1, Y0, Y1 = 336, 472, 138, 684   # crop box in sheet pixels
BG = bytes((0xf3, 0xf2, 0xf0))
MIST = (0xed, 0xef, 0xf0)  # site background: per-channel scale so BG maps exactly onto mist
def tint(rgb): return bytes(min(255, round(c * m / b)) for c, m, b in zip(rgb, MIST, BG))
def px(x, y): o = y*stride + 1 + x*ch; return raw[o:o+3]
def ink(x, y): return sum(abs(a-b) for a, b in zip(px(x, y), BG)) > 12
# outer silhouette per row, then a running median over +-8 rows so 1-2px guide lines drop out
ext = []
for y in range(Y0, Y1):
    xs = [x for x in range(X0, X1) if ink(x, y)]
    ext.append((min(xs), max(xs)) if xs else None)
def med(v): v = sorted(v); return v[len(v)//2]
out = bytearray()
for j, y in enumerate(range(Y0, Y1)):
    win = [e for e in ext[max(0, j-8):j+9] if e]
    row = bytearray()
    if win:
        l, r = med([e[0] for e in win]), med([e[1] for e in win])
    for x in range(X0, X1):
        row += tint(px(x, y) if (win and l - 2 <= x <= r + 2) else BG)
    out += b'\x00' + row
def chunk(t, b): return struct.pack('>I', len(b)) + t + b + struct.pack('>I', zlib.crc32(t + b) & 0xffffffff)
W, H = X1 - X0, Y1 - Y0
open(dst, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(bytes(out), 9)) + chunk(b'IEND', b''))
print(dst, W, H)

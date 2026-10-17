"""Decode FlateDecode RGB images (objects given) from a PDF to PNG (+ optional SMask alpha).
Usage: python3 -I pdf_images.py <pdf> <out_dir> <obj> [<obj>...]"""
import re, sys, zlib, struct, os
pdf, out, objs = sys.argv[1], sys.argv[2], sys.argv[3:]
d = open(pdf, 'rb').read()
def obj(n):
    m = re.search(rb'(?<!\d)' + n.encode() + rb' 0 obj\s*<<(.*?)>>\s*stream\r?\n', d, re.S)
    hdr = m.group(1); L = int(re.search(rb'/Length (\d+)', hdr).group(1))
    return hdr, zlib.decompress(d[m.end():m.end() + L])
def png(path, w, h, raw, ch):
    ct = {1: 0, 3: 2, 4: 6}[ch]
    rows = b''.join(b'\x00' + raw[y*w*ch:(y+1)*w*ch] for y in range(h))
    def chunk(t, b): return struct.pack('>I', len(b)) + t + b + struct.pack('>I', zlib.crc32(t + b) & 0xffffffff)
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, ct, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(rows, 9)) + chunk(b'IEND', b''))
for n in objs:
    hdr, raw = obj(n)
    w = int(re.search(rb'/Width (\d+)', hdr).group(1)); h = int(re.search(rb'/Height (\d+)', hdr).group(1))
    print(n, w, h, len(raw), 'bpc', re.search(rb'/BitsPerComponent (\d+)', hdr).group(1), 'parms', re.findall(rb'/DecodeParms[^/]*/\w+ \d+', hdr), 'smask', re.findall(rb'/SMask \d+', hdr))
    ch = len(raw) // (w * h)
    png(os.path.join(out, f'img{n}.png'), w, h, raw[:w*h*ch], ch)

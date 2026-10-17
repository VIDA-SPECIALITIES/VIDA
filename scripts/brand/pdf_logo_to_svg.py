"""Convert the filled vector paths on page 1 of the VIDA logo PDF to SVG.
Usage: python3 -I pdf_logo_to_svg.py <pdf> <out_dir>"""
import re, sys, zlib, os
pdf, out = sys.argv[1], sys.argv[2]
d = open(pdf, 'rb').read()
streams = [m.group(1) for m in re.finditer(rb'stream\r?\n(.*?)endstream', d, re.S)]
page1 = zlib.decompress(streams[0]).decode('latin1')
H = 595.0735  # page/background height used for the y-flip
paths, cur, colour, nums = [], [], None, []
for tok in page1.split():
    if re.fullmatch(r'-?\d+(\.\d+)?', tok):
        nums.append(float(tok)); continue
    if tok == 'scn': colour = tuple(nums[-3:])
    elif tok == 'm': cur.append(('M', nums[-2:]))
    elif tok == 'l': cur.append(('L', nums[-2:]))
    elif tok == 'c': cur.append(('C', nums[-6:]))
    elif tok == 'h': cur.append(('Z', []))
    elif tok in ('f*', 'f'):
        paths.append((colour, cur)); cur = []
    elif tok == 'n': cur = []
    nums = []
# drop the full-page background rectangle
LOGO = (0.1373, 0.2118, 0.2706)
paths = [(c, p) for c, p in paths if c == LOGO]
def pts(p):
    for op, a in p:
        for i in range(0, len(a), 2): yield a[i], a[i+1]
def d_attr(p):
    s = []
    for op, a in p:
        xy = ' '.join(f'{a[i]:.3f} {H - a[i+1]:.3f}' for i in range(0, len(a), 2))
        s.append(op + xy)
    return ''.join(s)
def write(name, sel, pad=0):
    xs, ys = zip(*[(x, H - y) for _, p in sel for x, y in pts(p)])
    x0, y0, x1, y1 = min(xs)-pad, min(ys)-pad, max(xs)+pad, max(ys)+pad
    body = '\n'.join(f'  <path d="{d_attr(p)}"/>' for _, p in sel)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.3f} {y0:.3f} {x1-x0:.3f} {y1-y0:.3f}" '
           f'fill="currentColor" fill-rule="evenodd" role="img">\n{body}\n</svg>\n')
    open(os.path.join(out, name), 'w').write(svg)
    print(name, len(sel), 'paths', f'{x1-x0:.1f}x{y1-y0:.1f}')
write('vida-logo-lockup.svg', paths)
# wordmark letters sit above y=290 in PDF space; the descriptor line sits below
write('vida-wordmark.svg', [(c, p) for c, p in paths if min(y for _, y in pts(p)) > 290])

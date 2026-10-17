"""Build favicon SVGs from the 'V' glyph of the traced VIDA wordmark (no redrawing).
Usage: python3 -I make_favicon.py <wordmark.svg> <out.svg> <out-square.svg>"""
import re, sys
s = open(sys.argv[1]).read()
d = re.findall(r'd="([^"]+)"', s)[0]           # first path = V
nums = list(map(float, re.findall(r'-?\d+\.\d+', d)))
xs, ys = nums[0::2], nums[1::2]
x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
side = (x1 - x0) / 0.70                          # V occupies 70% of the tile width
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
vb = f'{cx - side/2:.3f} {cy - side/2:.3f} {side:.3f} {side:.3f}'
def svg(rx):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">\n'
            f'  <rect x="{cx - side/2:.3f}" y="{cy - side/2:.3f}" width="{side:.3f}" height="{side:.3f}" rx="{rx:.3f}" fill="#EDEFF0"/>\n'
            f'  <path fill="#233645" d="{d}"/>\n</svg>\n')
open(sys.argv[2], 'w').write(svg(side * 0.18))
open(sys.argv[3], 'w').write(svg(0))
print('V bbox', round(x1-x0,1), round(y1-y0,1), 'tile', round(side,1))

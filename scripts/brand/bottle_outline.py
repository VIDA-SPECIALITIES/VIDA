"""Trace a smooth hairline outline of the Artifact 002 bottle from the
high-resolution render's alpha channel (1536x2304).
Symmetric profile (mean half-width per row), heavily smoothed, sampled sparsely
and drawn with Catmull-Rom curves; flat top, rounded base corners.
Usage: python bottle_outline.py <render.png> <out.svg>"""
import cv2, numpy as np, sys
r = cv2.imread(sys.argv[1], cv2.IMREAD_UNCHANGED)
a = r[:, :, 3] > 128
ys = np.where(a.any(axis=1))[0]; y0, y1 = ys.min(), ys.max()
# skip the cap's rounded top lip so the outline starts flat
y0 = next(y for y in range(y0, y1) if np.ptp(np.where(a[y])[0]) > 0.9 * np.ptp(np.where(a[y0 + 40])[0]))
cx = np.mean(np.where(a.any(axis=0))[0][[0, -1]])
half = np.array([(np.where(a[y])[0].max() - np.where(a[y])[0].min()) / 2 for y in range(y0, y1 + 1)], float)
# cap region (top ~6%) is wider than the neck: continue the neck line straight up
cap_end = int(len(half) * 0.075)
half[:cap_end] = np.median(half[cap_end:cap_end + 40])
# smooth: wide Gaussian removes cap ribs / neck rings / pixel noise
k = 49; g = cv2.getGaussianKernel(k, 12).ravel()
pad = np.pad(half, k // 2, mode='edge'); sm = np.convolve(pad, g, mode='valid')
H = len(sm)
# sample: denser near the base where the curve turns fast
t = np.linspace(0, 1, 46) ** 0.9
idx = np.unique(np.clip((t * (H - 1)).round().astype(int), 0, H - 1))
R = 34.0                                          # base corner radius (px)
pts_r = [(cx + sm[i], y0 + i) for i in idx if y0 + i < y1 - R - 70]  # stop before the base-rim inset
def cr(p):
    out = []
    for i in range(len(p) - 1):
        p0 = p[i - 1] if i else p[i]; p1, p2 = p[i], p[i + 1]; p3 = p[i + 2] if i + 2 < len(p) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        out.append(f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}')
    return out
right = pts_r
left = [(2 * cx - x, y) for x, y in reversed(right)]
bx = right[-1][0]; by = y1
d = [f'M{2*cx-right[0][0]:.1f} {right[0][1]:.1f}', f'L{right[0][0]:.1f} {right[0][1]:.1f}']
d += cr(right)
d.append(f'Q{bx:.1f} {by:.1f} {bx-R:.1f} {by:.1f}')       # rounded base corner
d.append(f'L{2*cx-bx+R:.1f} {by:.1f}')
d.append(f'Q{2*cx-bx:.1f} {by:.1f} {left[0][0]:.1f} {left[0][1]:.1f}')
d += cr(left)
d.append('Z')
w = (sm.max() * 2) + 8; vx = cx - w / 2
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx:.1f} {y0-4} {w:.1f} {y1-y0+8}" fill="none" '
       f'stroke="currentColor" stroke-width="1" stroke-linejoin="round" stroke-linecap="round">\n'
       f'  <path vector-effect="non-scaling-stroke" d="{"".join(d)}"/>\n</svg>\n')
open(sys.argv[2], 'w').write(svg)
print('points per side', len(right), 'height', y1 - y0)

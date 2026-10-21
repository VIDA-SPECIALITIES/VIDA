"""Recolour only the screw cap of the Artifact 002 render, keeping its ribbing
and shading (luminance-preserving tint). Cap = rows 26-144 of the 1536x2304
render; the glass neck threads below are untouched.
Usage: python cap_colours.py <render.png> <out_dir>
Colours are DESIGN PROPOSALS (client request 2026-10-20): IMMUNE green,
RADIANCE pink, EDGE grey."""
import cv2, numpy as np, sys, os
src, out_dir = sys.argv[1], sys.argv[2]
CAP_Y0, CAP_Y1 = 20, 145
CAPS = {  # BGR
    'immune': (98, 150, 38),     # green #269662 (client wrapper spec 2026-10-21)
    'radiance': (143, 113, 199), # pink  #C7718F
    'edge': (152, 144, 138),     # grey  #8A9098
}
r = cv2.imread(src, cv2.IMREAD_UNCHANGED)
h, w = r.shape[:2]
L = cv2.cvtColor(r[:, :, :3], cv2.COLOR_BGR2GRAY).astype(np.float32)
mask = np.zeros((h, w), np.float32)
mask[CAP_Y0:CAP_Y1] = 1
mask[CAP_Y1 - 6:CAP_Y1] = np.linspace(1, 0, 6)[:, None]       # feather the lower edge
mask = (mask * (r[:, :, 3] / 255.0))[:, :, None]
ref = float(np.median(L[CAP_Y0 + 10:CAP_Y1 - 10][r[CAP_Y0 + 10:CAP_Y1 - 10, :, 3] > 200]))
shade = (L / ref)[:, :, None]
for name, bgr in CAPS.items():
    c = np.array(bgr, np.float32)
    tinted = np.where(shade <= 1, c * shade, c + (255 - c) * np.clip((shade - 1) / 3, 0, 1) * 0.65)
    rgb = r[:, :, :3].astype(np.float32) * (1 - mask) + tinted * mask
    out = np.dstack([rgb.clip(0, 255), r[:, :, 3:4].astype(np.float32)]).astype(np.uint8)
    p = os.path.join(out_dir, f'vida-artifact-002-render-{name}.png')
    cv2.imwrite(p, out)
    print(p)

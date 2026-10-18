"""Build the two VIDA hero layers.
1) bottle layer: colour-to-alpha extraction of the client's Artifact 002 render
   against its studio white (exact reproduction of bottle.jpeg over white;
   sharp, full resolution, no blur).
2) background: client coastal scene with its own bottle removed, plus a contact
   shadow, a faint reflection and a refraction softening of the *background*
   inside the bottle footprint (the bottle layer itself is untouched).
Usage: python hero_layers.py <scene.png> <render.png> <bottle_out.png> <bg_out.png>
Prints the bottle's placement as fractions of the scene (for CSS)."""
import cv2, numpy as np, sys, json
scene_p, render_p, bottle_out, bg_out = sys.argv[1:5]
CX, BASE_Y, H = 1294, 696, 618
W = 247.0                                    # studio white of bottle.jpeg

# ---- bottle layer --------------------------------------------------------
r = cv2.imread(render_p, cv2.IMREAD_UNCHANGED)
ys, xs = np.where(r[:, :, 3] > 8)
r = r[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
sil = r[:, :, 3:4].astype(np.float32) / 255
C = r[:, :, :3].astype(np.float32) * sil + W * (1 - sil)        # = bottle.jpeg look
dark_a = np.max((W - C) / W, axis=2, keepdims=True).clip(0, 1)   # colour-to-alpha vs white
hi = np.max(C, axis=2, keepdims=True)
hi_a = ((hi - W) / (255 - W)).clip(0, 1) * 0.9                  # brighter-than-studio highlights
a = np.maximum(dark_a, hi_a)
a = np.maximum(a, 0.14 * (sil > 0.5))                           # faint body so clear glass reads
safe = np.maximum(a, 1e-3)
rgb = np.where(hi_a > dark_a, 255.0, (C - (1 - a) * W) / safe).clip(0, 255)
a = a * sil
pre_rim = (rgb * a + W * (1 - a)).copy()                     # for the fidelity check below

# Rim light: a thin, soft highlight just inside the glass contour (sun from the
# right, so the right edge is brighter). Added over the glass ("over" operator);
# geometry and existing detail are untouched.
inside = (sil[:, :, 0] > 0.5).astype(np.uint8)
dist = cv2.distanceTransform(inside, cv2.DIST_L2, 5)
rim = np.exp(-dist / 7.0) * inside
bh0, bw0 = inside.shape
side = np.linspace(0.45, 1.0, bw0)[None, :]                 # left 45% -> right 100%
cap_zone = np.zeros_like(rim); cap_zone[: int(bh0 * 0.06)] = 1  # leave the black cap alone
ha = (rim * side * 0.50 * (1 - cap_zone))[:, :, None]
# base rim: warm highlight along the lowest ~2.5% of the glass
rows = np.arange(bh0)[:, None]
base_band = np.clip((rows - bh0 * 0.965) / (bh0 * 0.035), 0, 1) * np.exp(-dist / 18.0)
ha = np.maximum(ha, (base_band * inside * 0.42)[:, :, None])
hl = np.array([226, 242, 255], np.float32)                  # BGR warm white
na = ha + a * (1 - ha)
rgb = ((hl * ha + rgb * a * (1 - ha)) / np.maximum(na, 1e-3)).clip(0, 255)
a = na
out = np.dstack([rgb, a * 255]).astype(np.uint8)
cv2.imwrite(bottle_out, out)
bh, bw = out.shape[:2]
# check: over white it reproduces the studio image
print('bottle layer', bw, 'x', bh, '| mean error vs studio before rim light', round(float(np.abs(pre_rim - C).mean()), 3))

# ---- background ----------------------------------------------------------
scene = cv2.imread(scene_p); sh, sw = scene.shape[:2]
old = np.zeros((sh, sw), np.uint8)
pts = [(1252,78),(1336,78),(1338,215),(1372,300),(1380,430),(1370,520),(1384,600),(1392,700),
       (1196,700),(1204,600),(1214,520),(1206,430),(1212,300),(1248,215)]
cv2.fillPoly(old, [np.array(pts, np.int32)], 255)
old = cv2.dilate(old, np.ones((9, 9), np.uint8))
bg = cv2.inpaint(scene, old, 21, cv2.INPAINT_NS)
PY0, PY1 = 548, 712
patch = scene[PY0:PY1, 1430:1660]
pm = np.full(patch.shape[:2], 255, np.uint8); pm[:5] = pm[-5:] = 0; pm[:, :5] = pm[:, -5:] = 0
bg = cv2.seamlessClone(patch, bg, pm, (CX, (PY0 + PY1) // 2), cv2.NORMAL_CLONE).astype(np.float32)

scale = H / bh; rw = round(bw * scale)
x0, y0 = CX - rw // 2, BASE_Y - H
small_a = cv2.resize(a, (rw, H), interpolation=cv2.INTER_AREA)
small_s = cv2.resize(sil, (rw, H), interpolation=cv2.INTER_AREA)
# refraction: soften the background seen through the glass
roi = bg[y0:y0 + H, x0:x0 + rw]
soft = cv2.GaussianBlur(roi, (0, 0), 4)
m = cv2.GaussianBlur((small_s > 0.5).astype(np.float32), (0, 0), 2)[:, :, None]
bg[y0:y0 + H, x0:x0 + rw] = roi * (1 - m) + soft * m
# Local lift behind the bottle: frosted glass scatters light, so the rocks/sea
# seen through the lower body read lighter and cooler; a very wide, faint lift
# behind the whole silhouette separates it from the scenery (no visible shape).
lower = np.clip((np.arange(H)[:, None] - H * 0.55) / (H * 0.25), 0, 1)
fm = cv2.GaussianBlur((small_s > 0.5).astype(np.float32), (0, 0), 3) * lower
fm = fm[:, :, None]
roi = bg[y0:y0 + H, x0:x0 + rw]
grey = roi.mean(axis=2, keepdims=True)
frosted = roi * 0.55 + grey * 0.45
frosted = frosted + (232 - frosted) * 0.42
bg[y0:y0 + H, x0:x0 + rw] = roi * (1 - fm) + frosted * fm
halo = np.zeros((sh, sw), np.float32)
cv2.rectangle(halo, (x0 + 10, y0 + 40), (x0 + rw - 10, BASE_Y - 30), 1, -1)
halo = cv2.GaussianBlur(halo, (0, 0), 38)[:, :, None]
bg = bg + (248 - bg) * 0.10 * halo
# contact shadow
sh_m = np.zeros((sh, sw), np.float32)
cv2.ellipse(sh_m, (CX, BASE_Y - 1), (int(rw * 0.46), 8), 0, 0, 360, 1, -1)
sh_m = cv2.GaussianBlur(sh_m, (0, 0), 6)[:, :, None]
bg = bg * (1 - 0.6 * sh_m)
# faint reflection of the bottle's base on the wet rock
RH = 64
br = cv2.resize(rgb.astype(np.float32), (rw, H), interpolation=cv2.INTER_AREA)
ref = br[H - RH:][::-1]; ra = small_a[H - RH:][::-1][:, :, None] * np.linspace(0.32, 0, RH)[:, None, None]
seg = bg[BASE_Y:BASE_Y + RH, x0:x0 + rw]; n = seg.shape[0]
bg[BASE_Y:BASE_Y + n, x0:x0 + rw] = seg * (1 - ra[:n]) + ref[:n] * ra[:n]
cv2.imwrite(bg_out, bg.clip(0, 255).astype(np.uint8))
print(json.dumps({'scene': [sw, sh], 'left%': round(x0 / sw * 100, 3), 'top%': round(y0 / sh * 100, 3),
                  'width%': round(rw / sw * 100, 3), 'height%': round(H / sh * 100, 3)}))

"""Split the Artifact 002 render into layers for the 360° viewer:
  - base (per cap colour): the bottle with the embossed "VIDA" removed;
  - emboss (shared): the embossed letters on a transparent background.
The bottle is axially symmetric and lit by fixed studio lights, so on rotation
its silhouette and highlights stay put; only surface features (the emboss)
travel around the body. Usage: python rotation_layers.py <renders_dir>"""
import cv2, numpy as np, sys, os, json
d = sys.argv[1]
src = cv2.imread(os.path.join(d, 'vida-artifact-002-render.png'), cv2.IMREAD_UNCHANGED)
g = cv2.cvtColor(src[:, :, :3], cv2.COLOR_BGR2GRAY).astype(np.float32)
X0, X1, Y0, Y1 = 690, 860, 1110, 1590            # emboss box (render px)
# Stroke mask: fine detail that forms long connected strokes (frost is speckle)
detail = np.abs(g - cv2.GaussianBlur(g, (0, 0), 7))
m = np.zeros(g.shape, np.uint8)
m[Y0:Y1, X0:X1] = (detail[Y0:Y1, X0:X1] > 3.5).astype(np.uint8) * 255
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
keep = np.zeros_like(m)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] > 220:            # letter strokes, not frost grains
        keep[lab == i] = 255
stroke = cv2.dilate(keep, np.ones((7, 7), np.uint8))
# Emboss layer: original pixels inside the (feathered) stroke mask
feather = cv2.GaussianBlur(stroke.astype(np.float32) / 255, (0, 0), 1.5)
emb = src[Y0:Y1, X0:X1].copy()
emb[:, :, 3] = (feather[Y0:Y1, X0:X1] * 255).astype(np.uint8)
cv2.imwrite(os.path.join(d, 'vida-a002-emboss.png'), emb)
# Base layers: inpaint the strokes away, per cap colour
for tone in ('immune', 'radiance', 'edge'):
    r = cv2.imread(os.path.join(d, f'vida-artifact-002-render-{tone}.png'), cv2.IMREAD_UNCHANGED)
    rgb = cv2.inpaint(r[:, :, :3], stroke, 7, cv2.INPAINT_TELEA)
    out = np.dstack([rgb, r[:, :, 3]])
    cv2.imwrite(os.path.join(d, f'vida-a002-base-{tone}.png'), out)
a = src[:, :, 3] > 128
row = np.where(a[(Y0 + Y1) // 2])[0]
H, W = src.shape[:2]
print(json.dumps({'emboss_box_pct': [round(X0 / W * 100, 3), round(Y0 / H * 100, 3), round((X1 - X0) / W * 100, 3), round((Y1 - Y0) / H * 100, 3)],
                  'axis_x_pct': round((row.min() + row.max()) / 2 / W * 100, 3), 'radius_pct_of_width': round((row.max() - row.min()) / 2 / W * 100, 3),
                  'strokes_px': int((keep > 0).sum())}))

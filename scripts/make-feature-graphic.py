#!/usr/bin/env python3
"""Generates assets/feature-graphic.png (1024x500) for the Play Store listing."""

from PIL import Image, ImageDraw, ImageFont
import math, os

W, H = 1024, 500
BG       = (244, 239, 230)   # #f4efe6
BROWN    = (139, 69, 19)     # #8b4513
DARK_PIP = (90, 45, 12)      # #5a2d0c
DICE_BG  = (250, 243, 224)   # #faf3e0

img  = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# --- border ---
draw.rounded_rectangle([16, 16, W-16, H-16], radius=20, outline=BROWN + (80,) if False else BROWN, width=2)

# --- try to load a serif font, fall back to default ---
def load_font(size):
    for path in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
    ]:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

font_title    = load_font(96)
font_subtitle = load_font(28)
font_tagline  = load_font(22)

# --- title ---
draw.text((W//2, 155), "YAHTZEE", font=font_title, fill=BROWN, anchor="mm")

# --- subtitle ---
draw.text((W//2, 210), "Classic Dice Game", font=font_subtitle, fill=BROWN + (150,) if False else (180, 120, 60), anchor="mm")

# --- 5 dice (fan layout, centred) ---
DICE  = 72
GAP   = 14
TOTAL = DICE * 5 + GAP * 4
START_X = (W - TOTAL) // 2
START_Y = 295
RADIUS  = DICE * 0.09
CORNER  = 10

PIPS = {
    1: [(0.5, 0.5)],
    2: [(0.25, 0.25), (0.75, 0.75)],
    3: [(0.25, 0.25), (0.5, 0.5), (0.75, 0.75)],
    4: [(0.25, 0.25), (0.75, 0.25), (0.25, 0.75), (0.75, 0.75)],
    5: [(0.25, 0.25), (0.75, 0.25), (0.5, 0.5), (0.25, 0.75), (0.75, 0.75)],
    6: [(0.25, 0.25), (0.75, 0.25), (0.25, 0.5), (0.75, 0.5), (0.25, 0.75), (0.75, 0.75)],
}
FACES   = [1, 2, 5, 4, 6]
ROTATIONS = [-6, -3, 0, 3, 6]

for i, (face, rot_deg) in enumerate(zip(FACES, ROTATIONS)):
    cx = START_X + i * (DICE + GAP) + DICE // 2
    cy = START_Y + DICE // 2

    # rotate a temp layer so the die is tilted
    die_layer = Image.new("RGBA", (DICE + 20, DICE + 20), (0, 0, 0, 0))
    dl = ImageDraw.Draw(die_layer)
    ox, oy = 10, 10  # offset inside layer
    dl.rounded_rectangle([ox, oy, ox+DICE, oy+DICE], radius=CORNER,
                          fill=DICE_BG, outline=BROWN, width=2)
    for px, py in PIPS[face]:
        pcx = ox + px * DICE
        pcy = oy + py * DICE
        dl.ellipse([pcx-RADIUS, pcy-RADIUS, pcx+RADIUS, pcy+RADIUS], fill=DARK_PIP)

    rotated = die_layer.rotate(rot_deg, expand=False, resample=Image.BICUBIC)
    paste_x = cx - rotated.width  // 2
    paste_y = cy - rotated.height // 2
    img.paste(rotated, (paste_x, paste_y), rotated)

# --- tagline ---
draw.text((W//2, 432), "Roll · Score · Win", font=font_tagline, fill=(180, 120, 60), anchor="mm")

# --- save ---
out = os.path.join(os.path.dirname(__file__), "..", "assets", "feature-graphic.png")
img.save(os.path.abspath(out), "PNG", optimize=True)
print(f"Saved: {os.path.abspath(out)}")

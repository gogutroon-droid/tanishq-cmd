import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('thumbnails', exist_ok=True)
os.makedirs('videos', exist_ok=True)

projects = [
    ('showreel.jpg', 'CUT. GRADE. COMPOSE.', 'MASTER SHOWREEL 2026', (18, 18, 22), (234, 179, 8)),
    ('midnight.jpg', 'ECHOES OF MIDNIGHT', 'CINEMATIC SHORT · 2.39:1', (8, 14, 20), (56, 189, 248)),
    ('overdrive.jpg', 'OVERDRIVE SYMPHONY', 'MUSIC VIDEO · 16:9 DCI 4K', (22, 10, 14), (244, 63, 94)),
    ('quantum.jpg', 'QUANTUM HORIZON', 'FUSION VFX / SCI-FI · 2.35:1', (14, 9, 26), (168, 85, 247)),
    ('terra.jpg', 'TERRA INCOGNITA', 'DOCUMENTARY · KODAK 5219', (8, 20, 14), (16, 185, 129)),
    ('aura.jpg', 'AURA HAUTE COUTURE', 'COMMERCIAL FASHION EDIT', (22, 14, 8), (249, 115, 22)),
]

for filename, title, subtitle, bg_color, accent_color in projects:
    w, h = 1280, 720
    img = Image.new('RGB', (w, h), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Anamorphic 2.39:1 letterbox bars
    draw.rectangle([0, 0, w, 80], fill=(4, 4, 6))
    draw.rectangle([0, h - 80, w, h], fill=(4, 4, 6))

    # Subtle framing lines
    draw.rectangle([60, 100, w - 60, h - 100], outline=(255, 255, 255, 25), width=1)
    draw.line([w//2 - 20, h//2, w//2 + 20, h//2], fill=accent_color, width=2)
    draw.line([w//2, h//2 - 20, w//2, h//2 + 20], fill=accent_color, width=2)

    # Metadata text (fallback default font)
    draw.text((80, 120), "● REC [4K PRORES 422HQ]", fill=accent_color)
    draw.text((w - 260, 120), "TC: 01:14:28:16", fill=(160, 170, 185))

    # Center Title
    draw.text((w // 2 - 120, h // 2 - 40), title, fill=(255, 255, 255))
    draw.text((w // 2 - 120, h // 2), subtitle, fill=(180, 190, 205))

    draw.text((80, h - 130), "IMAGICA CINEMATIC SUITE", fill=(100, 110, 125))
    draw.text((w - 200, h - 130), "SCENE 01 / TAKE 01", fill=(100, 110, 125))

    path = os.path.join('thumbnails', filename)
    img.save(path, quality=92)
    print(f"Created {path}")

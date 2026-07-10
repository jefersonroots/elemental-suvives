from pathlib import Path
from PIL import Image

src = Path("tmp/imagegen/fenix-64-source-alpha.png")
out = Path("art/heroes/fogo/generated/fenix_64.png")

img = Image.open(src).convert("RGBA")
alpha = img.getchannel("A")
bbox = alpha.getbbox()
if bbox is None:
    raise SystemExit("No visible pixels found")

cropped = img.crop(bbox)
padding = 4
max_size = 64 - padding * 2
scale = min(max_size / cropped.width, max_size / cropped.height)
new_size = (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale)))

resized = cropped.resize(new_size, Image.Resampling.NEAREST)
canvas = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
pos = ((64 - resized.width) // 2, (64 - resized.height) // 2)
canvas.alpha_composite(resized, pos)

out.parent.mkdir(parents=True, exist_ok=True)
canvas.save(out)
print(f"Wrote {out} ({canvas.width}x{canvas.height})")

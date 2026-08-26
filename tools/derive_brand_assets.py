from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / 'public' / 'references' / 'oculix-live-reference.jpg'
out = root / 'public'
base = Image.open(source).convert('RGB')

# Preserve the reference exactly as the source; only resize/format-convert copies.
def square(size: int) -> Image.Image:
    return base.resize((size, size), Image.Resampling.LANCZOS)

square(1024).save(out / 'oculix-icon.png', 'PNG', optimize=True)
square(1024).save(out / 'oculix-icon.webp', 'WEBP', quality=92, method=6)
square(512).save(out / 'casaos-icon.png', 'PNG', optimize=True)
square(512).save(out / 'android-chrome-512x512.png', 'PNG', optimize=True)
square(192).save(out / 'android-chrome-192x192.png', 'PNG', optimize=True)
square(180).save(out / 'apple-touch-icon.png', 'PNG', optimize=True)
square(32).save(out / 'favicon-32x32.png', 'PNG', optimize=True)
square(16).save(out / 'favicon-16x16.png', 'PNG', optimize=True)
square(512).save(out / 'icon-192.png', 'PNG', optimize=True)
square(512).save(out / 'og-square.png', 'PNG', optimize=True)
# ICO keeps both browser-standard sizes.
square(32).save(out / 'favicon.ico', 'ICO', sizes=[(16, 16), (32, 32)])

# The social card remains a deterministic crop-free letterboxed rendition of the source.
canvas = Image.new('RGB', (1200, 630), (3, 8, 14))
thumb = base.copy()
thumb.thumbnail((630, 630), Image.Resampling.LANCZOS)
left = (1200 - thumb.width) // 2
canvas.paste(thumb, (left, (630 - thumb.height) // 2))
canvas.save(out / 'og-image.png', 'PNG', optimize=True)

"""Render certificate preview from final Canva template + dummy portal data."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "assets" / "certificate-template.png"
SIGNATURE = ROOT / "assets" / "director-signature.png"
OUTPUT = ROOT / "assets" / "certificate-preview-dummy.png"

DATA = {
    "student_name": "Syed Tatheer Hussain",
    "module_line": "HTML & CSS — WEB DEVELOPMENT PROGRAM",
    "completion_date": "11 JULY 2026",
    "certificate_id": "EEST-WD-2026-0042",
}


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (Path(rf"C:/Windows/Fonts/{name}"), Path(rf"C:/Windows/Fonts/{name.lower()}")):
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


def remove_near_white_bg(img: Image.Image, threshold: int = 210) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                px[x, y] = (255, 255, 255, 0)
            else:
                px[x, y] = (r, g, b, 255)
    return img


def trim_transparent(img: Image.Image) -> Image.Image:
    bbox = img.getbbox()
    return img.crop(bbox) if bbox else img


def cover(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int]) -> None:
    draw.rectangle(box, fill=(255, 255, 255))


def center_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    y: int,
    font: ImageFont.ImageFont,
    width: int,
) -> None:
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((width - tw) // 2, y), text, font=font, fill=(20, 20, 20))


def main() -> None:
    base = Image.open(TEMPLATE).convert("RGBA")
    w, h = base.size
    draw = ImageDraw.Draw(base)

    # Only replace dynamic fields — logo, seal, border from Canva stay
    cover(draw, (32, 248, w - 32, 312))      # student name
    cover(draw, (32, 332, w - 32, 362))      # module / program line
    cover(draw, (388, 502, 636, 528))        # date under seal
    cover(draw, (72, 636, 292, 662))         # footer date value
    cover(draw, (372, 636, 640, 662))        # footer cert id value
    cover(draw, (688, 528, 968, 596))        # signature

    font_name = load_font("timesbd.ttf", 42)
    font_module = load_font("arialbd.ttf", 20)
    font_date = load_font("arial.ttf", 17)
    font_footer = load_font("arialbd.ttf", 14)

    center_text(draw, DATA["student_name"], 262, font_name, w)
    center_text(draw, DATA["module_line"], 336, font_module, w)
    center_text(draw, DATA["completion_date"], 504, font_date, w)
    draw.text((118, 638), DATA["completion_date"], font=font_footer, fill=(20, 20, 20))
    draw.text((418, 638), DATA["certificate_id"], font=font_footer, fill=(20, 20, 20))

    if SIGNATURE.exists():
        sig = trim_transparent(remove_near_white_bg(Image.open(SIGNATURE)))
        sig_w = 195
        sig = sig.resize((sig_w, int(sig.height * (sig_w / sig.width))), Image.Resampling.LANCZOS)
        base.paste(sig, (742, 534), sig)

    base.convert("RGB").save(OUTPUT, quality=96)
    print(f"Saved: {OUTPUT} ({w}x{h})")


if __name__ == "__main__":
    main()

"""Render certificate preview v2: template + transparent logo + transparent signature."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "assets" / "certificate-template-v2.png"
LOGO = ROOT / "public" / "eest-logo.png"
SIGNATURE = ROOT / "assets" / "director-signature.png"
OUTPUT = ROOT / "assets" / "eest-certificate-preview-v2.png"

DATA = {
    "student_name": "Syed Tatheer Hussain",
    "program_line": "WEB DEVELOPMENT PROGRAM — MODULE CERTIFICATE",
    "completion_date": "11 JULY 2026",
    "certificate_id": "EEST-WD-2026-0042",
}


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (Path(rf"C:/Windows/Fonts/{name}"), Path(rf"C:/Windows/Fonts/{name.lower()}")):
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


def remove_near_white_bg(img: Image.Image, threshold: int = 235) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                pixels[x, y] = (255, 255, 255, 0)
            else:
                pixels[x, y] = (r, g, b, 255)
    return img


def trim_transparent(img: Image.Image) -> Image.Image:
    bbox = img.getbbox()
    return img.crop(bbox) if bbox else img


def paste_rgba(base: Image.Image, overlay: Image.Image, x: int, y: int) -> None:
    base.paste(overlay, (x, y), overlay)


def cover(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int]) -> None:
    draw.rectangle(box, fill=(255, 255, 255))


def center_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    y: int,
    font: ImageFont.ImageFont,
    width: int,
    fill: tuple[int, int, int] = (20, 20, 20),
) -> None:
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((width - tw) // 2, y), text, font=font, fill=fill)


def main() -> None:
    base = Image.open(TEMPLATE).convert("RGBA")
    w, _h = base.size
    draw = ImageDraw.Draw(base)

    # Old placeholder logo + name + course + dates + signature
    cover(draw, (392, 28, 632, 132))
    cover(draw, (40, 228, 984, 332))
    cover(draw, (60, 312, 964, 356))
    cover(draw, (392, 488, 632, 536))
    cover(draw, (68, 632, 300, 666))
    cover(draw, (368, 632, 640, 666))
    cover(draw, (676, 520, 980, 600))

    # EEST shield logo (transparent bg) — fits top circle slot
    logo = remove_near_white_bg(Image.open(LOGO), threshold=240)
    shield = trim_transparent(logo.crop((0, 0, int(logo.width * 0.36), logo.height)))
    shield_h = 78
    shield = shield.resize(
        (int(shield.width * (shield_h / shield.height)), shield_h),
        Image.Resampling.LANCZOS,
    )
    paste_rgba(base, shield, (w - shield.width) // 2, 52)

    font_name = load_font("timesbd.ttf", 42)
    font_course = load_font("arialbd.ttf", 21)
    font_date = load_font("arial.ttf", 17)
    font_footer = load_font("arialbd.ttf", 14)

    center_text(draw, DATA["student_name"], 272, font_name, w)
    center_text(draw, DATA["program_line"], 324, font_course, w)
    center_text(draw, DATA["completion_date"], 502, font_date, w)

    draw.text((116, 640), DATA["completion_date"], font=font_footer, fill=(20, 20, 20))
    draw.text((416, 640), DATA["certificate_id"], font=font_footer, fill=(20, 20, 20))

    sig = trim_transparent(remove_near_white_bg(Image.open(SIGNATURE), threshold=205))
    sig_w = 200
    sig = sig.resize((sig_w, int(sig.height * (sig_w / sig.width))), Image.Resampling.LANCZOS)
    paste_rgba(base, sig, 738, 532)

    base.convert("RGB").save(OUTPUT, quality=96)
    print(f"Saved: {OUTPUT}")


if __name__ == "__main__":
    main()

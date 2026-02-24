import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC_DIR = os.path.join(os.path.dirname(__file__), "..", "client", "public", "training", "simulator")
OUT_DIR = os.path.join(os.path.dirname(__file__), "output_images")

def blur(img, x, y, w, h, radius=30):
    iw, ih = img.size
    x1, y1 = max(0, x), max(0, y)
    x2, y2 = min(iw, x + w), min(ih, y + h)
    if x2 <= x1 or y2 <= y1:
        return img
    region = img.crop((x1, y1, x2, y2))
    blurred = region.filter(ImageFilter.GaussianBlur(radius=radius))
    img.paste(blurred, (x1, y1))
    return img


WEB_W, WEB_H = 2940, 1592
MOB_W = 1284

def web_header_name(img):
    blur(img, 2600, 8, 340, 60, 25)

PER_FILE_CONFIG = {
    "18.16.41.jpg": lambda img: [
        web_header_name(img),
        blur(img, 150, 120, 1200, 130, 40),
    ],
    "18.16.51.jpg": lambda img: [
        web_header_name(img),
    ],
    "18.17.30.jpg": lambda img: [
        web_header_name(img),
        blur(img, 1570, 270, 600, 360, 30),
    ],
    "18.17.39.jpg": lambda img: [
        web_header_name(img),
    ],
    "18.17.49.jpg": lambda img: [
        web_header_name(img),
        blur(img, 1050, 230, 650, 530, 35),
    ],
    "18.18.04.jpg": lambda img: [
        web_header_name(img),
    ],
    "18.18.12.jpg": lambda img: [
        web_header_name(img),
        blur(img, 1050, 360, 620, 70, 25),
    ],
    "18.18.48.jpg": lambda img: [
        web_header_name(img),
    ],
    "18.19.09.jpg": lambda img: [
        web_header_name(img),
    ],
    "18.19.17.jpg": lambda img: [
        web_header_name(img),
    ],
    "18.19.26.jpg": lambda img: [
        web_header_name(img),
    ],
    "18.20.07.jpg": lambda img: [
        web_header_name(img),
    ],

    "IMG_8926.PNG": lambda img: [
        blur(img, 30, 180, 1220, 90, 30),
        blur(img, 30, 275, 1220, 280, 40),
    ],
    "IMG_8929.jpg": lambda img: [
        blur(img, 130, 180, 850, 280, 40),
    ],
    "IMG_8932.jpg": lambda img: [
        blur(img, 25, 130, 900, 80, 28),
        blur(img, 25, 215, 350, 55, 20),
        blur(img, 25, 310, 900, 60, 22),
        blur(img, 25, 420, 900, 60, 22),
        blur(img, 25, 535, 900, 60, 22),
        blur(img, 25, 640, 900, 60, 22),
        blur(img, 25, 895, 600, 80, 28),
        blur(img, 25, 980, 350, 55, 20),
        blur(img, 25, 1080, 900, 60, 22),
        blur(img, 25, 1190, 900, 60, 22),
        blur(img, 25, 1300, 900, 60, 22),
    ],
    "IMG_8933.jpg": lambda img: [
        blur(img, 150, 15, 700, 60, 28),
    ],
    "IMG_8934.jpg": lambda img: [
        blur(img, 150, 15, 700, 60, 28),
    ],
}


def process_all():
    os.makedirs(OUT_DIR, exist_ok=True)
    print("Анонимизация скриншотов стоп-листа (blur)")
    print("=" * 50)
    processed = 0
    for filename, apply_fn in sorted(PER_FILE_CONFIG.items()):
        src_path = os.path.join(SRC_DIR, filename)
        if not os.path.exists(src_path):
            print(f"  {filename}: не найден")
            continue
        print(f"  {filename} ... ", end="")
        try:
            img = Image.open(src_path).convert("RGB")
            apply_fn(img)
            out_path = os.path.join(OUT_DIR, filename)
            if filename.lower().endswith(".png"):
                img.save(out_path, format="PNG")
            else:
                img.save(out_path, quality=95)
            print("готово")
            processed += 1
        except Exception as e:
            print(f"ошибка: {e}")
            import traceback; traceback.print_exc()
    print(f"\nОбработано: {processed} файлов → {OUT_DIR}/")


if __name__ == "__main__":
    process_all()

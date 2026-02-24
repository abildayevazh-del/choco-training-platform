import os
import glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

INPUT_DIR = os.path.join(os.path.dirname(__file__), "input_images")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output_images")


# ══════════════════════════════════════════════════════════════
#  КОНФИГУРАЦИЯ — НАСТРОЙТЕ ПОД СВОИ ЭКРАНЫ
# ══════════════════════════════════════════════════════════════
#
#  Каждый профиль — это набор зон для замены на конкретном типе экрана.
#
#  Параметры зоны:
#    label            — название зоны (для вашего удобства)
#    coords           — (x, y, width, height) области на скриншоте
#    replacement_text — текст, который будет наложен поверх
#    font_size        — размер шрифта (по умолчанию 28)
#    font_bold        — жирный шрифт (по умолчанию False)
#    text_color       — цвет текста (по умолчанию "#000000")
#    bg_color         — цвет заливки области (по умолчанию "#FFFFFF")
#    mode             — "fill" (заливка цветом) или "blur" (размытие)
#    blur_radius      — радиус размытия, если mode="blur" (по умолчанию 20)
#
# ══════════════════════════════════════════════════════════════

CONFIG = {
    "default": [
        {
            "label": "GuestName",
            "coords": (100, 200, 300, 50),
            "replacement_text": "Иван И.",
            "font_size": 28,
            "text_color": "#000000",
            "bg_color": "#FFFFFF",
            "mode": "fill",
        },
        {
            "label": "RestaurantName",
            "coords": (100, 80, 400, 40),
            "replacement_text": "Ресторан «Тестовый»",
            "font_size": 24,
            "text_color": "#333333",
            "bg_color": "#F5F5F5",
            "mode": "fill",
        },
    ],

    "order_screen": [
        {
            "label": "GuestName",
            "coords": (50, 150, 350, 50),
            "replacement_text": "Гость А.",
            "font_size": 28,
            "text_color": "#000000",
            "bg_color": "#FFFFFF",
            "mode": "fill",
        },
        {
            "label": "PhoneNumber",
            "coords": (50, 210, 300, 40),
            "replacement_text": "+7 (***) ***-**-**",
            "font_size": 24,
            "text_color": "#666666",
            "bg_color": "#FFFFFF",
            "mode": "fill",
        },
    ],

    "payment_screen": [
        {
            "label": "CardNumber",
            "coords": (80, 300, 350, 45),
            "replacement_text": "**** **** **** 1234",
            "font_size": 26,
            "text_color": "#000000",
            "bg_color": "#F0F0F0",
            "mode": "fill",
        },
    ],

    "blur_example": [
        {
            "label": "SensitiveData",
            "coords": (100, 200, 300, 100),
            "replacement_text": "",
            "mode": "blur",
            "blur_radius": 25,
        },
    ],
}

# ══════════════════════════════════════════════════════════════
#  Какой профиль использовать для обработки
#  Измените на нужный: "default", "order_screen", "payment_screen" и т.д.
# ══════════════════════════════════════════════════════════════
ACTIVE_PROFILE = "default"


def get_font(size, bold=False):
    path = FONT_BOLD_PATH if bold else FONT_PATH
    try:
        return ImageFont.truetype(path, size)
    except (OSError, IOError):
        return ImageFont.load_default()


def anonymize_screen(image_path, zones):
    img = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(img)

    for zone in zones:
        x, y, w, h = zone["coords"]
        mode = zone.get("mode", "fill")
        text = zone.get("replacement_text", "")

        if mode == "blur":
            radius = zone.get("blur_radius", 20)
            crop_box = (x, y, x + w, y + h)
            region = img.crop(crop_box)
            blurred = region.filter(ImageFilter.GaussianBlur(radius=radius))
            img.paste(blurred, (x, y))
            if text:
                draw = ImageDraw.Draw(img)
        else:
            bg_color = zone.get("bg_color", "#FFFFFF")
            draw.rectangle([x, y, x + w, y + h], fill=bg_color)

        if text:
            font_size = zone.get("font_size", 28)
            font_bold = zone.get("font_bold", False)
            text_color = zone.get("text_color", "#000000")
            font = get_font(font_size, font_bold)

            bbox = font.getbbox(text)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
            text_x = x + (w - text_w) // 2
            text_y = y + (h - text_h) // 2

            draw = ImageDraw.Draw(img)
            draw.text((text_x, text_y), text, fill=text_color, font=font)

    return img


def process_all():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    zones = CONFIG.get(ACTIVE_PROFILE, CONFIG["default"])
    print(f"Профиль: {ACTIVE_PROFILE}")
    print(f"Зон для замены: {len(zones)}")
    print(f"Папка входных файлов: {INPUT_DIR}")
    print(f"Папка выходных файлов: {OUTPUT_DIR}")
    print("─" * 50)

    images = glob.glob(os.path.join(INPUT_DIR, "*.jpg")) + \
             glob.glob(os.path.join(INPUT_DIR, "*.JPG")) + \
             glob.glob(os.path.join(INPUT_DIR, "*.png")) + \
             glob.glob(os.path.join(INPUT_DIR, "*.PNG"))

    if not images:
        print("Нет изображений в папке input_images/")
        print("Положите .jpg или .png файлы в папку anonymizer/input_images/")
        return

    print(f"Найдено изображений: {len(images)}\n")

    for image_path in sorted(images):
        filename = os.path.basename(image_path)
        print(f"  Обработка: {filename} ... ", end="")

        try:
            result = anonymize_screen(image_path, zones)
            output_path = os.path.join(OUTPUT_DIR, filename)
            result.save(output_path, quality=95)
            print("готово")
        except Exception as e:
            print(f"ошибка: {e}")

    print(f"\nГотово! Результаты в папке: {OUTPUT_DIR}")


if __name__ == "__main__":
    process_all()

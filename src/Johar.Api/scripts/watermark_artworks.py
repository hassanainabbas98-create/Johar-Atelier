import os
import sys
from PIL import Image, ImageDraw, ImageFont

WATERMARK_TEXT = "Art By Johar"

def apply_watermark(image_path: str, watermark_text: str = WATERMARK_TEXT) -> bool:
    if not os.path.isfile(image_path):
        print(f"File not found: {image_path}")
        return False

    try:
        # Open image and convert to RGBA for drawing alpha transparency
        with Image.open(image_path) as original:
            orig_format = original.format or "JPEG"
            img = original.convert("RGBA")
            width, height = img.size

            shortest_edge = min(width, height)
            font_size = max(16, min(56, int(shortest_edge * 0.026)))
            padding_x = int(font_size * 0.75)
            padding_y = int(font_size * 0.42)
            margin = int(shortest_edge * 0.025)

            # Font selection
            font = None
            font_candidates = [
                "C:/Windows/Fonts/georgiab.ttf",
                "C:/Windows/Fonts/georgia.ttf",
                "C:/Windows/Fonts/timesbd.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
            ]
            for fc in font_candidates:
                if os.path.exists(fc):
                    try:
                        font = ImageFont.truetype(fc, font_size)
                        break
                    except Exception:
                        pass
            if not font:
                font = ImageFont.load_default()

            # Measure text using getbbox
            bbox = font.getbbox(watermark_text)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]

            box_w = text_w + padding_x * 2
            box_h = text_h + padding_y * 2
            box_x = width - box_w - margin
            box_y = height - box_h - margin

            # Create transparent overlay
            overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)

            # Draw dark archival glass pill: rgba(6, 10, 16, 195)
            # with rounded corners
            corner_radius = int(box_h * 0.25)
            rect_coords = [box_x, box_y, box_x + box_w, box_y + box_h]
            draw.rounded_rectangle(
                rect_coords,
                radius=corner_radius,
                fill=(6, 10, 16, 195),
                outline=(213, 133, 31, 140), # Amber glow border
                width=max(1, int(font_size * 0.04))
            )

            # Subtle drop shadow for text: rgba(0, 0, 0, 180)
            text_x = box_x + padding_x
            text_y = box_y + padding_y - bbox[1] # baseline offset
            draw.text((text_x + 1, text_y + 1), watermark_text, font=font, fill=(0, 0, 0, 180))

            # Luminous parchment gold text: #F4D9A0 -> (244, 217, 160, 240)
            draw.text((text_x, text_y), watermark_text, font=font, fill=(244, 217, 160, 240))

            # Composite overlay with image
            watermarked = Image.alpha_composite(img, overlay)

            # Convert back to RGB for JPEG saving
            if orig_format.upper() in ["JPEG", "JPG"]:
                final_img = watermarked.convert("RGB")
                final_img.save(image_path, "JPEG", quality=95, optimize=True)
            else:
                watermarked.save(image_path, orig_format)

            print(f"Successfully watermarked: {os.path.basename(image_path)} ({width}x{height})")
            return True

    except Exception as ex:
        print(f"Error watermarking {image_path}: {ex}")
        return False

def watermark_directory(dir_path: str):
    if not os.path.isdir(dir_path):
        print(f"Directory not found: {dir_path}")
        return

    exts = {".jpg", ".jpeg", ".png", ".webp"}
    for fname in os.listdir(dir_path):
        ext = os.path.splitext(fname)[1].lower()
        if ext in exts:
            fpath = os.path.join(dir_path, fname)
            apply_watermark(fpath)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target = sys.argv[1]
        if os.path.isdir(target):
            watermark_directory(target)
        else:
            apply_watermark(target)
    else:
        # Default: process wwwroot/uploads/artworks
        script_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.dirname(script_dir)
        artworks_dir = os.path.join(root_dir, "src", "Johar.Api", "wwwroot", "uploads", "artworks")
        watermark_directory(artworks_dir)

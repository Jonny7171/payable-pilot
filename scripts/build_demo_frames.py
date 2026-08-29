from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
FRAME_DIR = ROOT / "output" / "devpost" / "video-frames"
SIZE = (1920, 1080)

INK = "#17201D"
CREAM = "#F4F0E7"
MINT = "#B8F2D0"
CORAL = "#F3A586"
BLUE = "#B8C8F2"
MUTED = "#66716C"

FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)


def centered(draw: ImageDraw.ImageDraw, text: str, y: int, style: ImageFont.FreeTypeFont, fill: str) -> None:
    box = draw.textbbox((0, 0), text, font=style)
    draw.text(((SIZE[0] - box[2] + box[0]) // 2, y), text, font=style, fill=fill)


def pill(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, color: str) -> None:
    style = font(25, bold=True)
    box = draw.textbbox((0, 0), text, font=style)
    width = box[2] - box[0] + 42
    draw.rounded_rectangle((x - width, y, x, y + 48), radius=24, fill=color)
    draw.text((x - width + 21, y + 9), text, font=style, fill=INK)


def intro() -> Image.Image:
    image = Image.new("RGB", SIZE, CREAM)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((110, 95, 1810, 985), radius=46, fill=INK)
    draw.rounded_rectangle((158, 143, 275, 260), radius=26, fill=MINT)
    draw.text((191, 154), "P", font=font(78, bold=True), fill=INK)
    centered(draw, "PayablePilot", 320, font(124, bold=True), CREAM)
    centered(draw, "Two packets processed. One needs review.", 485, font(46), CREAM)
    draw.rounded_rectangle((665, 625, 1255, 705), radius=40, fill=MINT)
    centered(draw, "STRANDS AGENT", 646, font(31, bold=True), INK)
    centered(draw, "Accounts payable exception desk", 790, font(31), "#CAD3CE")
    return image


def product_scene(asset_name: str, step: str, title: str, caption: str, crop: bool = False) -> Image.Image:
    image = Image.new("RGB", SIZE, CREAM)
    draw = ImageDraw.Draw(image)
    draw.text((70, 28), "PayablePilot", font=font(38, bold=True), fill=INK)
    draw.text((70, 76), title, font=font(25), fill=MUTED)
    pill(draw, step, 1850, 35, CORAL if crop else MINT)

    source = Image.open(DOCS / asset_name).convert("RGB")
    if crop:
        source = source.crop(
            (
                int(source.width * 0.44),
                int(source.height * 0.40),
                int(source.width * 0.96),
                int(source.height * 0.92),
            )
        )
    fitted = ImageOps.contain(source, (1680, 830), Image.Resampling.LANCZOS)
    x = (SIZE[0] - fitted.width) // 2
    y = 135 + (830 - fitted.height) // 2
    draw.rounded_rectangle((x - 8, y - 8, x + fitted.width + 8, y + fitted.height + 8), radius=20, fill="#D5D0C5")
    image.paste(fitted, (x, y))
    centered(draw, caption, 1005, font(29, bold=True), INK)
    return image


def architecture_scene() -> Image.Image:
    image = Image.new("RGB", SIZE, CREAM)
    draw = ImageDraw.Draw(image)
    draw.text((70, 28), "PayablePilot", font=font(38, bold=True), fill=INK)
    draw.text((70, 76), "The model controls sequence. Code controls money.", font=font(25), fill=MUTED)
    pill(draw, "03  CONTROLLED AGENT", 1850, 35, BLUE)
    source = Image.open(DOCS / "architecture.png").convert("RGB")
    fitted = ImageOps.contain(source, (1670, 830), Image.Resampling.LANCZOS)
    x = (SIZE[0] - fitted.width) // 2
    y = 138 + (830 - fitted.height) // 2
    image.paste(fitted, (x, y))
    centered(draw, "Strands chooses tools. Deterministic checks own every financial fact.", 1005, font(29, bold=True), INK)
    return image


def outro() -> Image.Image:
    image = Image.new("RGB", SIZE, INK)
    draw = ImageDraw.Draw(image)
    centered(draw, "The useful work gets done.", 245, font(82, bold=True), CREAM)
    centered(draw, "The decision stays human.", 350, font(82, bold=True), MINT)
    draw.rounded_rectangle((480, 550, 1440, 655), radius=52, fill=MINT)
    centered(draw, "jonny7171.github.io/payable-pilot", 579, font(35, bold=True), INK)
    centered(draw, "Built with Strands Agents SDK", 755, font(34, bold=True), CORAL)
    centered(draw, "Source: github.com/Jonny7171/payable-pilot", 815, font(28), "#B8C2BC")
    return image


def main() -> None:
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    scenes = [
        intro(),
        product_scene(
            "live-before.jpg",
            "01  AGENT RUN",
            "The agent works the queue",
            "PP-2087 clears. PP-2086 stops on a verified $200.00 price difference.",
        ),
        product_scene(
            "live-after.jpg",
            "02  LIVE RESULT",
            "The human decision changes the record",
            "One click: decision count 1 to 0. Invoice held. Audit event recorded.",
            crop=True,
        ),
        architecture_scene(),
        outro(),
    ]
    for index, scene in enumerate(scenes, start=1):
        scene.save(FRAME_DIR / f"scene-{index}.png", optimize=True)


if __name__ == "__main__":
    main()

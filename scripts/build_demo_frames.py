from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
FRAME_DIR = ROOT / "output" / "devpost" / "video-frames"
SIZE = (1920, 1080)

INK = "#17201D"
PAPER = "#F4F2EC"
FOREST = "#284638"
AMBER = "#B97827"
RULE = "#C9CCC5"
MUTED = "#66716C"

FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_MONO = "/System/Library/Fonts/Supplemental/Courier New.ttf"


def font(size: int, bold: bool = False, mono: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_MONO if mono else (FONT_BOLD if bold else FONT_REGULAR)
    return ImageFont.truetype(path, size)


def header(draw: ImageDraw.ImageDraw, step: str, note: str) -> None:
    draw.text((76, 48), "PayablePilot", font=font(38, bold=True), fill=INK)
    draw.text((76, 98), note, font=font(24), fill=MUTED)
    draw.text((1804, 58), step, anchor="ra", font=font(23, mono=True), fill=MUTED)
    draw.line((76, 140, 1844, 140), fill=RULE, width=2)


def intro() -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    draw.text((112, 90), "PayablePilot", font=font(42, bold=True), fill=FOREST)
    draw.text((112, 158), "AGENT RUN / PP-2086", font=font(24, mono=True), fill=MUTED)
    draw.line((112, 215, 1808, 215), fill=INK, width=3)
    draw.text((112, 270), "One price exception. One reviewer decision.", font=font(66, bold=True), fill=INK)

    rows = [
        ("SUPPLIER", "Everett Workplace Systems"),
        ("PO / INVOICE", "$94.00 / $119.00 per unit"),
        ("QUANTITY", "8 dual monitor arms"),
        ("HELD FROM PAYMENT", "$200.00"),
    ]
    top = 430
    for index, (label, value) in enumerate(rows):
        y = top + index * 120
        draw.line((112, y, 1808, y), fill=RULE, width=2)
        draw.text((112, y + 32), label, font=font(22, mono=True), fill=MUTED)
        draw.text((580, y + 24), value, font=font(35, bold=True), fill=AMBER if index == 3 else INK)
    draw.line((112, top + len(rows) * 120, 1808, top + len(rows) * 120), fill=RULE, width=2)
    return image


def product_scene(asset_name: str, step: str, note: str, caption: str) -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    header(draw, step, note)
    source = Image.open(DOCS / asset_name).convert("RGB")
    fitted = ImageOps.contain(source, (1760, 820), Image.Resampling.LANCZOS)
    x = (SIZE[0] - fitted.width) // 2
    y = 165 + (820 - fitted.height) // 2
    draw.rectangle((x - 2, y - 2, x + fitted.width + 2, y + fitted.height + 2), outline=RULE, width=2)
    image.paste(fitted, (x, y))
    draw.text((76, 1016), caption, font=font(27, bold=True), fill=INK)
    return image


def architecture_scene() -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    header(draw, "04 / 05", "The agent selects tools. Code verifies the amount.")
    source = Image.open(DOCS / "architecture.png").convert("RGB")
    fitted = ImageOps.contain(source, (1700, 800), Image.Resampling.LANCZOS)
    x = (SIZE[0] - fitted.width) // 2
    y = 185 + (800 - fitted.height) // 2
    image.paste(fitted, (x, y))
    draw.text((76, 1016), "Four explicit tools make the run inspectable and keep financial math deterministic.", font=font(27, bold=True), fill=INK)
    return image


def source_scene() -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    header(draw, "05 / 05", "The public demo replays the included fixture")
    rows = [
        ("AGENT", "Strands Agents SDK"),
        ("TOOLS", "list / inspect / hold / clear"),
        ("TESTS", "10 passing tests cover the agent, domain checks, and server"),
        ("FIXTURE", "PP-2086 and PP-2087 are included in the repository"),
    ]
    top = 250
    for index, (label, value) in enumerate(rows):
        y = top + index * 142
        draw.line((92, y, 1828, y), fill=RULE, width=2)
        draw.text((112, y + 40), f"0{index + 1}", font=font(23, mono=True), fill=FOREST)
        draw.text((220, y + 40), label, font=font(27, bold=True), fill=INK)
        draw.text((570, y + 37), value, font=font(29), fill=INK)
    draw.line((92, top + len(rows) * 142, 1828, top + len(rows) * 142), fill=RULE, width=2)
    draw.text((112, 900), "LIVE", font=font(20, mono=True), fill=MUTED)
    draw.text((300, 894), "jonny7171.github.io/payable-pilot", font=font(29, bold=True), fill=INK)
    draw.text((112, 970), "SOURCE", font=font(20, mono=True), fill=MUTED)
    draw.text((300, 964), "github.com/Jonny7171/payable-pilot", font=font(29, bold=True), fill=INK)
    return image


def main() -> None:
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    scenes = [
        intro(),
        product_scene(
            "live-before.jpg",
            "02 / 05",
            "The agent cleared PP-2087 and held PP-2086",
            "The four tool calls, source references, and $200.00 difference are visible together.",
        ),
        product_scene(
            "live-after.jpg",
            "03 / 05",
            "The reviewer approved the credit request and hold",
            "The pending count drops to zero and the decision becomes the fourth recorded event.",
        ),
        architecture_scene(),
        source_scene(),
    ]
    for index, scene in enumerate(scenes, start=1):
        scene.save(FRAME_DIR / f"scene-{index}.png", optimize=True)


if __name__ == "__main__":
    main()

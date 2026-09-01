from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
FRAME_DIR = ROOT / "output" / "webmcp" / "frames"
SIZE = (1920, 1080)

INK = "#17201D"
PAPER = "#F4F2EC"
FOREST = "#284638"
AMBER = "#B97827"
RULE = "#C9CCC5"
MUTED = "#66716C"
WHITE = "#FFFFFF"

FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_MONO = "/System/Library/Fonts/Supplemental/Courier New.ttf"


def font(size: int, bold: bool = False, mono: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_MONO if mono else (FONT_BOLD if bold else FONT_REGULAR)
    return ImageFont.truetype(path, size)


def wrapped(
    draw: ImageDraw.ImageDraw,
    text: str,
    box: tuple[int, int, int, int],
    size: int,
    *,
    bold: bool = False,
    fill: str = INK,
    spacing: int = 14,
) -> None:
    words = text.split()
    lines: list[str] = []
    line = ""
    face = font(size, bold=bold)
    max_width = box[2] - box[0]
    for word in words:
        candidate = f"{line} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=face)[2] <= max_width:
            line = candidate
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    y = box[1]
    for value in lines:
        draw.text((box[0], y), value, font=face, fill=fill)
        y += size + spacing


def header(draw: ImageDraw.ImageDraw, step: str, note: str) -> None:
    draw.text((76, 48), "PayablePilot", font=font(38, bold=True), fill=INK)
    draw.text((76, 98), note, font=font(24), fill=MUTED)
    draw.text((1804, 58), step, anchor="ra", font=font(23, mono=True), fill=MUTED)
    draw.line((76, 140, 1844, 140), fill=RULE, width=2)


def title_scene() -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((112, 90, 450, 150), radius=18, fill=FOREST)
    draw.text((138, 107), "WEBMCP CHALLENGE", font=font(22, bold=True), fill=WHITE)
    draw.text((112, 250), "PayablePilot", font=font(84, bold=True), fill=INK)
    wrapped(
        draw,
        "A browser agent can prepare the review. It cannot spend the money.",
        (112, 390, 1760, 650),
        58,
        bold=True,
    )
    draw.line((112, 790, 1808, 790), fill=RULE, width=2)
    draw.text((112, 850), "READ", font=font(23, mono=True), fill=MUTED)
    draw.text((350, 840), "Exact invoice evidence", font=font(34, bold=True), fill=FOREST)
    draw.text((112, 930), "STAGE", font=font(23, mono=True), fill=MUTED)
    draw.text((350, 920), "One visible draft for a person", font=font(34, bold=True), fill=AMBER)
    return image


def product_scene(asset_name: str, step: str, note: str, caption: str) -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    header(draw, step, note)
    source = Image.open(DOCS / asset_name).convert("RGB")
    fitted = ImageOps.contain(source, (1760, 800), Image.Resampling.LANCZOS)
    x = (SIZE[0] - fitted.width) // 2
    y = 165 + (800 - fitted.height) // 2
    draw.rectangle((x - 2, y - 2, x + fitted.width + 2, y + fitted.height + 2), outline=RULE, width=2)
    image.paste(fitted, (x, y))
    draw.text((76, 1010), caption, font=font(27, bold=True), fill=INK)
    return image


def tool_scene() -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    header(draw, "03 / 06", "The agent reads a typed contract instead of guessing at the interface")
    draw.rounded_rectangle((90, 210, 720, 900), radius=26, fill=FOREST)
    draw.text((135, 270), "READ-ONLY TOOL", font=font(21, mono=True), fill="#B8DFC5")
    wrapped(draw, "review_payables_queue", (135, 335, 670, 490), 39, bold=True, fill=WHITE)
    wrapped(
        draw,
        "Returns the current run, source document IDs, exact variance, allowed actions, and human decision state.",
        (135, 540, 670, 820),
        29,
        fill="#DCE6DF",
    )
    rows = [
        ("packet", "PP-2086"),
        ("purchase order", "$94 x 8"),
        ("invoice", "$119 x 8"),
        ("difference", "$200"),
        ("status", "human review required"),
    ]
    top = 220
    for index, (label, value) in enumerate(rows):
        y = top + index * 130
        draw.line((810, y, 1810, y), fill=RULE, width=2)
        draw.text((840, y + 36), label.upper(), font=font(20, mono=True), fill=MUTED)
        draw.text((1200, y + 27), value, font=font(34, bold=True), fill=AMBER if index == 3 else INK)
    draw.line((810, top + len(rows) * 130, 1810, top + len(rows) * 130), fill=RULE, width=2)
    return image


def boundary_scene() -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    header(draw, "05 / 06", "The tool stops where a financial decision begins")
    cards = [
        (
            92,
            "BROWSER AGENT",
            FOREST,
            ["Read the queue", "Explain the $200 variance", "Stage one allowed choice"],
        ),
        (
            1010,
            "PERSON",
            AMBER,
            ["Check the source evidence", "Confirm or dismiss the draft", "Own the payment decision"],
        ),
    ]
    for left, label, color, items in cards:
        draw.rounded_rectangle((left, 220, left + 818, 875), radius=28, fill=WHITE, outline=RULE, width=2)
        draw.text((left + 48, 278), label, font=font(24, mono=True), fill=color)
        for index, item in enumerate(items, start=1):
            y = 395 + (index - 1) * 145
            draw.rounded_rectangle((left + 48, y, left + 96, y + 48), radius=8, fill=color)
            draw.text((left + 72, y + 10), str(index), anchor="ma", font=font(22, bold=True), fill=WHITE)
            draw.text((left + 125, y + 5), item, font=font(31, bold=True), fill=INK)
    draw.text((92, 955), "No approval. No payment release. No supplier message.", font=font(36, bold=True), fill=INK)
    return image


def proof_scene() -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    header(draw, "06 / 06", "Live, public, and tested in a browser that supports WebMCP")
    rows = [
        ("LIVE", "jonny7171.github.io/payable-pilot"),
        ("SOURCE", "github.com/Jonny7171/payable-pilot"),
        ("TOOLS", "2 detected on the public page"),
        ("TESTS", "17 passing"),
    ]
    top = 235
    for index, (label, value) in enumerate(rows):
        y = top + index * 150
        draw.line((92, y, 1828, y), fill=RULE, width=2)
        draw.text((112, y + 47), label, font=font(22, mono=True), fill=MUTED)
        draw.text((430, y + 36), value, font=font(37, bold=True), fill=FOREST if index < 2 else INK)
    draw.line((92, top + len(rows) * 150, 1828, top + len(rows) * 150), fill=RULE, width=2)
    draw.text((112, 910), "HUMAN GATE", font=font(22, mono=True), fill=MUTED)
    draw.text((430, 900), "The agent can stage. Only a person can confirm.", font=font(37, bold=True), fill=AMBER)
    return image


def main() -> None:
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    scenes = [
        title_scene(),
        product_scene(
            "webmcp-live.jpg",
            "02 / 06",
            "Two packets processed. One exception needs a decision.",
            "The public page registers two WebMCP tools in a supported browser.",
        ),
        tool_scene(),
        product_scene(
            "webmcp-staged.jpg",
            "04 / 06",
            "The agent stages the credit-and-hold choice in the visible review panel",
            "Nothing is approved or sent. The reviewer can confirm or dismiss the draft.",
        ),
        boundary_scene(),
        proof_scene(),
    ]
    for index, scene in enumerate(scenes, start=1):
        scene.save(FRAME_DIR / f"scene-{index}.png", optimize=True)


if __name__ == "__main__":
    main()


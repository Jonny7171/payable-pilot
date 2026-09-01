from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
FRAME_DIR = ROOT / "output" / "agents-for-humans" / "frames"
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


def header(draw: ImageDraw.ImageDraw, step: str, note: str) -> None:
    draw.text((76, 48), "PayablePilot", font=font(38, bold=True), fill=INK)
    draw.text((76, 98), note, font=font(24), fill=MUTED)
    draw.text((1804, 58), step, anchor="ra", font=font(23, mono=True), fill=MUTED)
    draw.line((76, 140, 1844, 140), fill=RULE, width=2)


def wrapped(draw: ImageDraw.ImageDraw, text: str, box: tuple[int, int, int, int], size: int, *, bold: bool = False, fill: str = INK, spacing: int = 14) -> None:
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


def title_scene() -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((112, 90, 620, 150), radius=18, fill=FOREST)
    draw.text((138, 107), "PROFESSIONAL AGENTS", font=font(22, bold=True), fill=WHITE)
    draw.text((112, 250), "PayablePilot", font=font(84, bold=True), fill=INK)
    wrapped(
        draw,
        "The invoice queue that only calls you when money is at risk.",
        (112, 390, 1760, 650),
        60,
        bold=True,
    )
    draw.line((112, 790, 1808, 790), fill=RULE, width=2)
    draw.text((112, 840), "STRANDS AGENT", font=font(23, mono=True), fill=MUTED)
    draw.text((480, 830), "Clears the routine work", font=font(34, bold=True), fill=FOREST)
    draw.text((112, 920), "HUMAN REVIEW", font=font(23, mono=True), fill=MUTED)
    draw.text((480, 910), "Owns every payment exception", font=font(34, bold=True), fill=AMBER)
    return image


def problem_scene() -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    header(draw, "02 / 06", "The job is routine until one number is wrong")
    columns = [
        ("WHO", "Small finance teams and bookkeepers"),
        ("PROBLEM", "Clean invoices consume time, but exceptions cannot be guessed"),
        ("WHY", "A wrong unit price can quietly change a real payment"),
    ]
    lefts = [92, 670, 1248]
    for left, (label, body) in zip(lefts, columns):
        draw.rounded_rectangle((left, 245, left + 500, 805), radius=28, fill=WHITE, outline=RULE, width=2)
        draw.text((left + 42, 300), label, font=font(22, mono=True), fill=MUTED)
        wrapped(draw, body, (left + 42, 385, left + 458, 735), 39, bold=True)
    draw.text((92, 920), "One clean packet. One $200 exception. No model-written arithmetic.", font=font(39, bold=True), fill=INK)
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


def architecture_scene() -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    header(draw, "04 / 06", "Strands chooses the work step. TypeScript owns the money.")
    source = Image.open(DOCS / "architecture.png").convert("RGB")
    fitted = ImageOps.contain(source, (1660, 700), Image.Resampling.LANCZOS)
    x = (SIZE[0] - fitted.width) // 2
    y = 190 + (700 - fitted.height) // 2
    image.paste(fitted, (x, y))
    draw.rounded_rectangle((160, 895, 1760, 1000), radius=24, fill=WHITE, outline=RULE, width=2)
    draw.text((210, 925), "$94 PO", font=font(30, bold=True), fill=FOREST)
    draw.text((560, 925), "$119 invoice", font=font(30, bold=True), fill=AMBER)
    draw.text((980, 925), "8 units", font=font(30, bold=True), fill=INK)
    draw.text((1320, 925), "$200 held", font=font(30, bold=True), fill=AMBER)
    return image


def proof_scene() -> Image.Image:
    image = Image.new("RGB", SIZE, PAPER)
    draw = ImageDraw.Draw(image)
    header(draw, "06 / 06", "Public, reproducible, and honest about the proof")
    rows = [
        ("STRANDS", "Real SDK tool loop with six recorded calls"),
        ("TESTS", "14 passing tests"),
        ("RUNTIME", "AgentCore-compatible HTTP contract included"),
        ("SAFETY", "A person approves every exception"),
    ]
    top = 220
    for index, (label, value) in enumerate(rows):
        y = top + index * 145
        draw.line((92, y, 1828, y), fill=RULE, width=2)
        draw.text((112, y + 44), label, font=font(22, mono=True), fill=MUTED)
        draw.text((510, y + 35), value, font=font(35, bold=True), fill=INK)
    draw.line((92, top + len(rows) * 145, 1828, top + len(rows) * 145), fill=RULE, width=2)
    draw.text((112, 895), "LIVE", font=font(20, mono=True), fill=MUTED)
    draw.text((300, 889), "jonny7171.github.io/payable-pilot", font=font(29, bold=True), fill=FOREST)
    draw.text((112, 965), "SOURCE", font=font(20, mono=True), fill=MUTED)
    draw.text((300, 959), "github.com/Jonny7171/payable-pilot", font=font(29, bold=True), fill=FOREST)
    return image


def main() -> None:
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    scenes = [
        title_scene(),
        problem_scene(),
        product_scene(
            "serpapi-live.jpg",
            "03 / 06",
            "The agent finishes the clean packet and stops the exception",
            "The live view keeps the source values, supplier evidence, and $200 impact together.",
        ),
        architecture_scene(),
        product_scene(
            "serpapi-resolved.jpg",
            "05 / 06",
            "The person requests a credit, so the invoice remains on hold",
            "The agent gathered and queued the evidence. The reviewer made the money decision.",
        ),
        proof_scene(),
    ]
    for index, scene in enumerate(scenes, start=1):
        scene.save(FRAME_DIR / f"scene-{index}.png", optimize=True)


if __name__ == "__main__":
    main()

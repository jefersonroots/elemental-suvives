from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("image has no visible pixels")
    return bbox


def normalize_sprite(source: Path, destination: Path, size: int, padding: int) -> None:
    image = Image.open(source).convert("RGBA")
    cropped = image.crop(alpha_bbox(image))

    max_content_size = size - padding * 2
    scale = min(max_content_size / cropped.width, max_content_size / cropped.height)
    scaled_size = (
        max(1, round(cropped.width * scale)),
        max(1, round(cropped.height * scale)),
    )

    resized = cropped.resize(scaled_size, Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset = ((size - resized.width) // 2, (size - resized.height) // 2)
    canvas.alpha_composite(resized, offset)

    destination.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(destination)


def normalize_tree(source_dir: Path, destination_dir: Path, size: int, padding: int) -> None:
    for source in sorted(source_dir.glob("*.png")):
        normalize_sprite(source, destination_dir / source.name, size, padding)


def main() -> None:
    parser = argparse.ArgumentParser(description="Trim, scale, and center PNG sprites.")
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--size", type=int, required=True)
    parser.add_argument("--padding", type=int, default=2)
    args = parser.parse_args()

    if args.source.is_dir():
        normalize_tree(args.source, args.destination, args.size, args.padding)
    else:
        normalize_sprite(args.source, args.destination, args.size, args.padding)


if __name__ == "__main__":
    main()

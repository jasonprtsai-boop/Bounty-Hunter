from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw


VERSION = 5
SIZE = 17 + VERSION * 4
ECC_CODEWORDS = 22
DATA_BLOCK_LENGTHS = [11, 11, 12, 12]
EC_LEVEL_H_BITS = 0b10
ALIGNMENT_CENTERS = [6, 30]
REMAINDER_BITS = 7


def _gf_tables() -> tuple[list[int], list[int]]:
    exp = [0] * 512
    log = [0] * 256
    x = 1
    for i in range(255):
        exp[i] = x
        log[x] = i
        x <<= 1
        if x & 0x100:
            x ^= 0x11D
    for i in range(255, 512):
        exp[i] = exp[i - 255]
    return exp, log


GF_EXP, GF_LOG = _gf_tables()


def _gf_mul(a: int, b: int) -> int:
    if a == 0 or b == 0:
        return 0
    return GF_EXP[GF_LOG[a] + GF_LOG[b]]


def _reed_solomon_generator(degree: int) -> list[int]:
    result = [1]
    for i in range(degree):
        next_poly = [0] * (len(result) + 1)
        for j, coefficient in enumerate(result):
            next_poly[j] ^= _gf_mul(coefficient, GF_EXP[i])
            next_poly[j + 1] ^= coefficient
        result = next_poly
    return result


def _reed_solomon_remainder(data: list[int], degree: int) -> list[int]:
    generator = _reed_solomon_generator(degree)
    result = [0] * degree
    for byte in data:
        factor = byte ^ result.pop(0)
        result.append(0)
        for i, coefficient in enumerate(generator[1:]):
            result[i] ^= _gf_mul(coefficient, factor)
    return result


def _append_bits(bits: list[int], value: int, length: int) -> None:
    for i in range(length - 1, -1, -1):
        bits.append((value >> i) & 1)


def _encode_data(text: str) -> list[int]:
    raw = text.encode("utf-8")
    capacity = sum(DATA_BLOCK_LENGTHS)
    bits: list[int] = []
    _append_bits(bits, 0b0100, 4)
    _append_bits(bits, len(raw), 8)
    for byte in raw:
        _append_bits(bits, byte, 8)

    max_bits = capacity * 8
    if len(bits) > max_bits:
        raise ValueError(f"Text too long for fixed QR version {VERSION}: {text}")

    _append_bits(bits, 0, min(4, max_bits - len(bits)))
    while len(bits) % 8:
        bits.append(0)

    data = []
    for i in range(0, len(bits), 8):
        value = 0
        for bit in bits[i : i + 8]:
            value = (value << 1) | bit
        data.append(value)

    pad = [0xEC, 0x11]
    while len(data) < capacity:
        data.append(pad[len(data) % 2])
    return data


def _interleave_blocks(data: list[int]) -> list[int]:
    blocks = []
    offset = 0
    for length in DATA_BLOCK_LENGTHS:
        block = data[offset : offset + length]
        offset += length
        blocks.append((block, _reed_solomon_remainder(block, ECC_CODEWORDS)))

    result: list[int] = []
    for i in range(max(DATA_BLOCK_LENGTHS)):
        for block, _ in blocks:
            if i < len(block):
                result.append(block[i])
    for i in range(ECC_CODEWORDS):
        for _, ecc in blocks:
            result.append(ecc[i])
    return result


class Matrix:
    def __init__(self) -> None:
        self.modules = [[False for _ in range(SIZE)] for _ in range(SIZE)]
        self.function = [[False for _ in range(SIZE)] for _ in range(SIZE)]

    def set_function(self, x: int, y: int, dark: bool) -> None:
        if 0 <= x < SIZE and 0 <= y < SIZE:
            self.modules[y][x] = dark
            self.function[y][x] = True

    def set_data(self, x: int, y: int, dark: bool) -> None:
        self.modules[y][x] = dark


def _draw_finder(matrix: Matrix, x: int, y: int) -> None:
    for dy in range(-1, 8):
        for dx in range(-1, 8):
            xx, yy = x + dx, y + dy
            if not (0 <= xx < SIZE and 0 <= yy < SIZE):
                continue
            dark = (
                0 <= dx <= 6
                and 0 <= dy <= 6
                and (dx in (0, 6) or dy in (0, 6) or (2 <= dx <= 4 and 2 <= dy <= 4))
            )
            matrix.set_function(xx, yy, dark)


def _draw_alignment(matrix: Matrix, cx: int, cy: int) -> None:
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            dark = max(abs(dx), abs(dy)) != 1
            matrix.set_function(cx + dx, cy + dy, dark)


def _draw_function_patterns(matrix: Matrix) -> None:
    _draw_finder(matrix, 0, 0)
    _draw_finder(matrix, SIZE - 7, 0)
    _draw_finder(matrix, 0, SIZE - 7)

    for i in range(8, SIZE - 8):
        dark = i % 2 == 0
        matrix.set_function(6, i, dark)
        matrix.set_function(i, 6, dark)

    for cx in ALIGNMENT_CENTERS:
        for cy in ALIGNMENT_CENTERS:
            near_top = cy < 9
            near_left = cx < 9
            near_right = cx > SIZE - 10
            if (near_top and near_left) or (near_top and near_right) or (cy > SIZE - 10 and near_left):
                continue
            _draw_alignment(matrix, cx, cy)

    matrix.set_function(8, VERSION * 4 + 9, True)

    for i in range(9):
        if i != 6:
            matrix.set_function(8, i, False)
            matrix.set_function(i, 8, False)
    for i in range(8):
        matrix.set_function(SIZE - 1 - i, 8, False)
        matrix.set_function(8, SIZE - 1 - i, False)


def _mask(mask: int, x: int, y: int) -> bool:
    if mask == 0:
        return (x + y) % 2 == 0
    if mask == 1:
        return y % 2 == 0
    if mask == 2:
        return x % 3 == 0
    if mask == 3:
        return (x + y) % 3 == 0
    if mask == 4:
        return (y // 2 + x // 3) % 2 == 0
    if mask == 5:
        return (x * y) % 2 + (x * y) % 3 == 0
    if mask == 6:
        return ((x * y) % 2 + (x * y) % 3) % 2 == 0
    if mask == 7:
        return ((x + y) % 2 + (x * y) % 3) % 2 == 0
    raise ValueError(mask)


def _format_bits(mask: int) -> int:
    data = (EC_LEVEL_H_BITS << 3) | mask
    value = data << 10
    generator = 0x537
    for i in range(14, 9, -1):
        if (value >> i) & 1:
            value ^= generator << (i - 10)
    return ((data << 10) | value) ^ 0x5412


def _draw_format_bits(matrix: Matrix, mask: int) -> None:
    bits = _format_bits(mask)
    for i in range(6):
        matrix.set_function(8, i, ((bits >> i) & 1) == 1)
    matrix.set_function(8, 7, ((bits >> 6) & 1) == 1)
    matrix.set_function(8, 8, ((bits >> 7) & 1) == 1)
    matrix.set_function(7, 8, ((bits >> 8) & 1) == 1)
    for i in range(9, 15):
        matrix.set_function(14 - i, 8, ((bits >> i) & 1) == 1)

    for i in range(8):
        matrix.set_function(SIZE - 1 - i, 8, ((bits >> i) & 1) == 1)
    for i in range(8, 15):
        matrix.set_function(8, SIZE - 15 + i, ((bits >> i) & 1) == 1)
    matrix.set_function(8, VERSION * 4 + 9, True)


def _place_data(matrix: Matrix, codewords: list[int], mask: int) -> None:
    bits: list[int] = []
    for codeword in codewords:
        _append_bits(bits, codeword, 8)
    bits.extend([0] * REMAINDER_BITS)

    index = 0
    upward = True
    x = SIZE - 1
    while x > 0:
        if x == 6:
            x -= 1
        for step in range(SIZE):
            y = SIZE - 1 - step if upward else step
            for xx in (x, x - 1):
                if matrix.function[y][xx]:
                    continue
                bit = bits[index] if index < len(bits) else 0
                matrix.set_data(xx, y, bool(bit) ^ _mask(mask, xx, y))
                index += 1
        upward = not upward
        x -= 2


def _penalty(matrix: Matrix) -> int:
    score = 0
    for y in range(SIZE):
        run_color = matrix.modules[y][0]
        run_len = 1
        for x in range(1, SIZE):
            if matrix.modules[y][x] == run_color:
                run_len += 1
            else:
                if run_len >= 5:
                    score += 3 + run_len - 5
                run_color = matrix.modules[y][x]
                run_len = 1
        if run_len >= 5:
            score += 3 + run_len - 5

    for x in range(SIZE):
        run_color = matrix.modules[0][x]
        run_len = 1
        for y in range(1, SIZE):
            if matrix.modules[y][x] == run_color:
                run_len += 1
            else:
                if run_len >= 5:
                    score += 3 + run_len - 5
                run_color = matrix.modules[y][x]
                run_len = 1
        if run_len >= 5:
            score += 3 + run_len - 5

    for y in range(SIZE - 1):
        for x in range(SIZE - 1):
            color = matrix.modules[y][x]
            if (
                matrix.modules[y][x + 1] == color
                and matrix.modules[y + 1][x] == color
                and matrix.modules[y + 1][x + 1] == color
            ):
                score += 3

    pattern = [True, False, True, True, True, False, True]
    for y in range(SIZE):
        for x in range(SIZE - 6):
            if [matrix.modules[y][x + i] for i in range(7)] == pattern:
                left_ok = x >= 4 and not any(matrix.modules[y][x - i] for i in range(1, 5))
                right_ok = x + 11 <= SIZE and not any(matrix.modules[y][x + 7 + i] for i in range(4))
                if left_ok or right_ok:
                    score += 40
    for x in range(SIZE):
        for y in range(SIZE - 6):
            if [matrix.modules[y + i][x] for i in range(7)] == pattern:
                top_ok = y >= 4 and not any(matrix.modules[y - i][x] for i in range(1, 5))
                bottom_ok = y + 11 <= SIZE and not any(matrix.modules[y + 7 + i][x] for i in range(4))
                if top_ok or bottom_ok:
                    score += 40

    dark = sum(1 for row in matrix.modules for value in row if value)
    total = SIZE * SIZE
    score += (abs(dark * 20 - total * 10) // total) * 10
    return score


def make_qr(text: str) -> Matrix:
    data = _encode_data(text)
    codewords = _interleave_blocks(data)
    best: tuple[int, Matrix] | None = None
    for mask in range(8):
        matrix = Matrix()
        _draw_function_patterns(matrix)
        _place_data(matrix, codewords, mask)
        _draw_format_bits(matrix, mask)
        score = _penalty(matrix)
        if best is None or score < best[0]:
            best = (score, matrix)
    assert best is not None
    return best[1]


def save_qr(text: str, output: Path, scale: int = 10, border: int = 4) -> None:
    matrix = make_qr(text)
    pixels = (SIZE + border * 2) * scale
    image = Image.new("RGB", (pixels, pixels), "white")
    draw = ImageDraw.Draw(image)
    for y, row in enumerate(matrix.modules):
        for x, dark in enumerate(row):
            if dark:
                left = (x + border) * scale
                top = (y + border) * scale
                draw.rectangle((left, top, left + scale - 1, top + scale - 1), fill="black")
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output)


def main() -> None:
    base = Path("07_比賽交付") / "qr"
    save_qr("https://line.me/R/ti/p/%40983zhzni", base / "line-add-friend.png")
    save_qr("https://liff.line.me/2010938588-VJXpaoyH", base / "liff-demo.png")


if __name__ == "__main__":
    main()

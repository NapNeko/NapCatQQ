
import QRPolynomial from './QRPolynomial';
import QRMath from './QRMath';
import QRMaskPattern from './QRMaskPattern';
import QRCode from '.';
import QRMode from './QRMode';

export const PATTERN_POSITION_TABLE = [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170]
];
export const G15: number = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
export const G18: number = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
export const G15_MASK: number = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

export function getBCHTypeInfo(data: number): number {
    let d: number = data << 10;
    while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15)));
    }
    return ((data << 10) | d) ^ G15_MASK;
}

export function getBCHTypeNumber(data: number): number {
    let d: number = data << 12;
    while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18)));
    }
    return (data << 12) | d;
}

export function getBCHDigit(data: number): number {
    let digit: number = 0;
    while (data !== 0) {
        digit++;
        data >>>= 1;
    }
    return digit;
}

export function getPatternPosition(typeNumber: number): number[] {
    return PATTERN_POSITION_TABLE[typeNumber - 1]!;
}

export function getMask(maskPattern: number, i: number, j: number): boolean {
    switch (maskPattern) {
    case QRMaskPattern.PATTERN000: return (i + j) % 2 === 0;
    case QRMaskPattern.PATTERN001: return i % 2 === 0;
    case QRMaskPattern.PATTERN010: return j % 3 === 0;
    case QRMaskPattern.PATTERN011: return (i + j) % 3 === 0;
    case QRMaskPattern.PATTERN100: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case QRMaskPattern.PATTERN101: return (i * j) % 2 + (i * j) % 3 === 0;
    case QRMaskPattern.PATTERN110: return ((i * j) % 2 + (i * j) % 3) % 2 === 0;
    case QRMaskPattern.PATTERN111: return ((i * j) % 3 + (i + j) % 2) % 2 === 0;
    default: throw new Error('bad maskPattern:' + maskPattern);
    }
}

export function getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial {
    let a: QRPolynomial = new QRPolynomial([1], 0);
    for (let i = 0; i < errorCorrectLength; i++) {
        a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
    }
    return a;
}

export function getLengthInBits(mode: number, type: number): number {
    if (1 <= type && type < 10) {
        // 1 - 9
        switch (mode) {
        case QRMode.MODE_NUMBER: return 10;
        case QRMode.MODE_ALPHA_NUM: return 9;
        case QRMode.MODE_8BIT_BYTE: return 8;
        case QRMode.MODE_KANJI: return 8;
        default: throw new Error('mode:' + mode);
        }
    } else if (type < 27) {
        // 10 - 26
        switch (mode) {
        case QRMode.MODE_NUMBER: return 12;
        case QRMode.MODE_ALPHA_NUM: return 11;
        case QRMode.MODE_8BIT_BYTE: return 16;
        case QRMode.MODE_KANJI: return 10;
        default: throw new Error('mode:' + mode);
        }
    } else if (type < 41) {
        // 27 - 40
        switch (mode) {
        case QRMode.MODE_NUMBER: return 14;
        case QRMode.MODE_ALPHA_NUM: return 13;
        case QRMode.MODE_8BIT_BYTE: return 16;
        case QRMode.MODE_KANJI: return 12;
        default: throw new Error('mode:' + mode);
        }
    } else {
        throw new Error('type:' + type);
    }
}

export function getLostPoint(qrCode: QRCode): number {
    const moduleCount: number = qrCode.getModuleCount();
    let lostPoint: number = 0;

    // LEVEL1
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            let sameCount: number = 0;
            const dark: boolean = qrCode.isDark(row, col);
            for (let r = -1; r <= 1; r++) {
                if (row + r < 0 || moduleCount <= row + r) continue;
                for (let c = -1; c <= 1; c++) {
                    if (col + c < 0 || moduleCount <= col + c) continue;
                    if (r === 0 && c === 0) continue;
                    if (dark === qrCode.isDark(row + r, col + c)) sameCount++;
                }
            }
            if (sameCount > 5) lostPoint += (3 + sameCount - 5);
        }
    }

    // LEVEL2
    for (let row = 0; row < moduleCount - 1; row++) {
        for (let col = 0; col < moduleCount - 1; col++) {
            let count: number = 0;
            if (qrCode.isDark(row, col)) count++;
            if (qrCode.isDark(row + 1, col)) count++;
            if (qrCode.isDark(row, col + 1)) count++;
            if (qrCode.isDark(row + 1, col + 1)) count++;
            if (count === 0 || count === 4) lostPoint += 3;
        }
    }

    // LEVEL3
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount - 6; col++) {
            if (qrCode.isDark(row, col) &&
                !qrCode.isDark(row, col + 1) &&
                qrCode.isDark(row, col + 2) &&
                qrCode.isDark(row, col + 3) &&
                qrCode.isDark(row, col + 4) &&
                !qrCode.isDark(row, col + 5) &&
                qrCode.isDark(row, col + 6)) {
                lostPoint += 40;
            }
        }
    }

    for (let col = 0; col < moduleCount; col++) {
        for (let row = 0; row < moduleCount - 6; row++) {
            if (qrCode.isDark(row, col) &&
                !qrCode.isDark(row + 1, col) &&
                qrCode.isDark(row + 2, col) &&
                qrCode.isDark(row + 3, col) &&
                qrCode.isDark(row + 4, col) &&
                !qrCode.isDark(row + 5, col) &&
                qrCode.isDark(row + 6, col)) {
                lostPoint += 40;
            }
        }
    }

    // LEVEL4
    let darkCount: number = 0;
    for (let col = 0; col < moduleCount; col++) {
        for (let row = 0; row < moduleCount; row++) {
            if (qrCode.isDark(row, col)) darkCount++;
        }
    }
    const ratio: number = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
    lostPoint += ratio * 10;

    return lostPoint;
}
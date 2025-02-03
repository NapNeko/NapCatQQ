import QRCode from '../vendor/QRCode';
import { QRErrorCorrectLevel } from '../vendor/QRCode/QRErrorCorrectLevel';

const black = '\x1b[40m  \x1b[0m';
const white = '\x1b[47m  \x1b[0m';

const toCell = (value: boolean | null): string => {
    return value ? black : white;
};

const repeat = (color: string) => {
    return {
        times: (count: number): string => {
            return new Array(count + 1).join(color);
        }
    };
};

const fill = (length: number, value: boolean): boolean[] => {
    const arr = new Array(length);
    for (let i = 0; i < length; i++) {
        arr[i] = value;
    }
    return arr;
};

interface GenerateOptions {
    small?: boolean;
}

type Callback = (output: string) => void;

export default {
    error: QRErrorCorrectLevel.L,

    generate(input: string, opts: GenerateOptions | Callback, cb?: Callback): void {
        if (typeof opts === 'function') {
            cb = opts;
            opts = {};
        }

        const qrcode = new QRCode(-1, this.error);
        qrcode.addData(input);
        qrcode.make();

        let output = '';
        if (opts && (opts as GenerateOptions).small) {
            const BLACK = true, WHITE = false;
            const moduleCount = qrcode.getModuleCount();
            const moduleData = qrcode.modules ? qrcode.modules.slice() : [];

            const oddRow = moduleCount % 2 === 1;
            if (oddRow) {
                moduleData.push(fill(moduleCount, WHITE));
            }

            const platte = {
                WHITE_ALL: '\u2588',
                WHITE_BLACK: '\u2580',
                BLACK_WHITE: '\u2584',
                BLACK_ALL: ' ',
            };

            const borderTop = repeat(platte.BLACK_WHITE).times(moduleCount + 2); // 修改这里
            const borderBottom = repeat(platte.WHITE_BLACK).times(moduleCount + 2); // 修改这里
            output += borderTop + '\n';

            for (let row = 0; row < moduleCount; row += 2) {
                output += platte.WHITE_ALL;

                for (let col = 0; col < moduleCount; col++) {
                    if (moduleData[row]?.[col] === WHITE && moduleData[row + 1]?.[col] === WHITE) {
                        output += platte.WHITE_ALL;
                    } else if (moduleData[row]?.[col] === WHITE && moduleData[row + 1]?.[col] === BLACK) {
                        output += platte.WHITE_BLACK;
                    } else if (moduleData[row]?.[col] === BLACK && moduleData[row + 1]?.[col] === WHITE) {
                        output += platte.BLACK_WHITE;
                    } else {
                        output += platte.BLACK_ALL;
                    }

                }

                output += platte.WHITE_ALL + '\n';
            }

            if (!oddRow) {
                output += borderBottom;
            }
        } else {
            const border = repeat(white).times(qrcode.getModuleCount() + 2); // 修改这里

            output += border + '\n';
            if (qrcode.modules) {
                qrcode.modules.forEach((row: (boolean | null)[]) => {
                    output += white;
                    output += row.map(toCell).join('');
                    output += white + '\n';
                });
            }
            output += border;
        }

        if (cb) cb(output);
        else console.log(output);
    },

    setErrorLevel(error: keyof typeof QRErrorCorrectLevel): void {
        this.error = QRErrorCorrectLevel[error] || this.error;
    }
};
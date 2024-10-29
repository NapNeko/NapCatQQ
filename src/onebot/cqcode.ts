import { OB11MessageData } from './types';

const pattern = /\[CQ:(\w+)((,\w+=[^,\]]*)*)]/;

function unescape(source: string) {
    return String(source)
        .replace(/&#91;/g, '[')
        .replace(/&#93;/g, ']')
        .replace(/&#44;/g, ',')
        .replace(/&amp;/g, '&');
}

function from(source: string) {
    const capture = pattern.exec(source);
    if (!capture) return null;
    const [, type, attrs] = capture;
    const data: Record<string, any> = {};
    if (attrs) {
        attrs.slice(1).split(',').forEach((str) => {
            const index = str.indexOf('=');
            data[str.slice(0, index)] = unescape(str.slice(index + 1));
        });
    }
    return { type, data, capture };
}

function h(type: string, data: any) {
    return {
        type,
        data,
    };
}

export function decodeCQCode(source: string): OB11MessageData[] {
    const elements: any[] = [];
    let result: ReturnType<typeof from>;
    while ((result = from(source))) {
        const { type, data, capture } = result;
        if (capture.index) {
            elements.push(h('text', { text: unescape(source.slice(0, capture.index)) }));
        }
        elements.push(h(type, data));
        source = source.slice(capture.index + capture[0].length);
    }
    if (source) elements.push(h('text', { text: unescape(source) }));
    return elements;
}


export function encodeCQCode(data: OB11MessageData) {
    const CQCodeEscapeText = (text: string) => {
        return text.replace(/&/g, '&amp;')
            .replace(/\[/g, '&#91;')
            .replace(/]/g, '&#93;');

    };

    const CQCodeEscape = (text: string) => {
        return text.replace(/&/g, '&amp;')
            .replace(/\[/g, '&#91;')
            .replace(/]/g, '&#93;')
            .replace(/,/g, '&#44;');
    };

    if (data.type === 'text') {
        return CQCodeEscapeText(data.data.text);
    }

    let result = '[CQ:' + data.type;
    for (const name in data.data) {
        const value = (data.data as Record<string, unknown>)[name];
        if (value === undefined) {
            continue;
        }
        try {
            const text = value?.toString();
            if (text) result += `,${name}=${CQCodeEscape(text)}`;
        } catch (error) {
            // If it can't be converted, skip this name-value pair
        }
    }
    result += ']';
    return result;
}

/**
 * 运行时类型转换与检查类
 */
export class TypeCheck {
    static isEmpty(value: any): boolean {
        return value === null || value === undefined || value === '' ||
            (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0);
    }
}

export class TypeConvert {
    static toNumber(value: any): number {
        const num = Number(value);
        if (isNaN(num)) {
            throw new Error(`无法将输入转换为数字: ${value}`);
        }
        return num;
    }

    static toString(value: any): string {
        return String(value);
    }

    static toBoolean(value: any): boolean {
        return Boolean(value);
    }

    static toArray(value: any): any[] {
        return Array.isArray(value) ? value : [value];
    }
}
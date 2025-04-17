import { z } from "zod";
const boolean = () => z.preprocess(
    val => typeof val === 'string' && (val.toLowerCase() === 'false' || val === '0') ? false : Boolean(val),
    z.boolean()
);
const number = () => z.preprocess(
    val => typeof val !== 'number' ? Number(val) : val,
    z.number()
);
const string = () => z.preprocess(
    val => typeof val !== 'string' ? String(val) : val,
    z.string()
);
export const actionType = { boolean, number, string };
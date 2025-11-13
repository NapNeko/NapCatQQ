// minimal declaration for react-color so tsc stops complaining.
// you can expand types here if you need stricter typing.

declare module 'react-color' {
  export interface ColorRGB {
    r: number;
    g: number;
    b: number;
    a?: number;
  }

  export interface ColorResult {
    hex?: string;
    rgb?: ColorRGB;
    hsl?: any;
    hsv?: any;
  }

  // keep the picker components as `any` for now
  export const SketchPicker: any;
  export const ChromePicker: any;
  export const BlockPicker: any;
  export const CirclePicker: any;

  export default {
    SketchPicker: SketchPicker,
  } as any;
}

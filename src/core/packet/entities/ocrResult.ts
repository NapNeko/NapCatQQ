export interface ImageOcrResult {
    texts: TextDetection[];
    language: string;
}

export interface TextDetection {
    text: string;
    confidence: number;
    coordinates: Coordinate[];
}

export interface Coordinate {
    x: number;
    y: number;
}

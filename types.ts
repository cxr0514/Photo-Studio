
export enum AspectRatio {
    SQUARE = "1:1",
    PORTRAIT = "3:4",
    LANDSCAPE = "16:9",
}

export enum LightingStyle {
    STUDIO_SOFTBOX = "Studio Softbox",
    GOLDEN_HOUR = "Golden Hour Sunlight",
    DRAMATIC_RIM = "Dramatic Rim Lighting",
    NEON_PUNK = "Neon Punk",
    VIBRANT_COMMERCIAL = "Vibrant Commercial",
}

export enum CameraPerspective {
    EYE_LEVEL = "Eye-Level Shot",
    HIGH_ANGLE = "High-Angle Shot",
    LOW_ANGLE = "Low-Angle Shot",
    DUTCH_ANGLE = "Dutch Angle",
    MACRO_CLOSE_UP = "Macro Close-Up",
}

export interface ImageFile {
    file: File;
    base64: string;
    mimeType: string;
}


import { AspectRatio, LightingStyle, CameraPerspective } from './types';

export const ASPECT_RATIO_OPTIONS = [
    { value: AspectRatio.SQUARE, label: 'Square (1:1)' },
    { value: AspectRatio.PORTRAIT, label: 'Portrait (3:4)' },
    { value: AspectRatio.LANDSCAPE, label: 'Landscape (16:9)' },
];

export const LIGHTING_STYLE_OPTIONS = [
    { value: LightingStyle.STUDIO_SOFTBOX, label: 'Studio Softbox' },
    { value: LightingStyle.GOLDEN_HOUR, label: 'Golden Hour' },
    { value: LightingStyle.DRAMATIC_RIM, label: 'Dramatic Rim' },
    { value: LightingStyle.NEON_PUNK, label: 'Neon Punk' },
    { value: LightingStyle.VIBRANT_COMMERCIAL, label: 'Vibrant Commercial' },
];

export const CAMERA_PERSPECTIVE_OPTIONS = [
    { value: CameraPerspective.EYE_LEVEL, label: 'Eye-Level' },
    { value: CameraPerspective.HIGH_ANGLE, label: 'High-Angle' },
    { value: CameraPerspective.LOW_ANGLE, label: 'Low-Angle' },
    { value: CameraPerspective.DUTCH_ANGLE, label: 'Dutch Angle' },
    { value: CameraPerspective.MACRO_CLOSE_UP, label: 'Macro Close-Up' },
];

/**
 * Represents the data structure received directly from the Flask endpoint (snake_case).
 */
export interface GameConfigApiData {
    ranges: number;
    num_elements: number;
    num_containers: number;
    upward: boolean;
    sum: boolean;
}

/**
 * Represents the clean data structure ready for use in the Frontend (camelCase).
 */
export interface GameConfigFrontend {
    ranges: number;
    numElements: number;
    numContainers: number;
    upward: boolean;
    sum: boolean;
}


export interface Option {
    id: string,
    value: number
}

export const EMPTY_COLOR = '#D1D5DC';
export const CORRECT_COLOT = '#00C950';
export const ERROR_COLOR = '#FF0000';
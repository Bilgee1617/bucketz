// src/config/paths.ts
import path from 'path';

// Update this path to point to your local Instagram JSON files
export const INSTAGRAM_DATA_PATH = process.env.INSTAGRAM_DATA_PATH || path.join(process.cwd(), 'data/instagram');
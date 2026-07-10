/**
 * Speko sizzle — APP-NATIVE theme (v6). Faithful to the real Speko dashboard:
 * dark, mint accent, sharp 2px radii, Inter + mono.
 */
import { inter, mono } from './fonts';

// Dark app theme (default) + Light app theme (2nd version). Same keys → theme-swappable.
const dark = {
  bg: '#07090b', bg1: '#0b0e11', bg2: '#11151a', bg3: '#181d23',
  line: '#1f2630', line2: '#2a323d',
  ink: '#e7ecf2', ink2: '#aab2bd', ink3: '#6b7585', ink4: '#424b58',
  mint: '#7cf2c8', mintDim: '#2f5b4d', mintGlow: 'rgba(124,242,200,0.15)',
  info: '#7cb8f2', warn: '#f2c97c', bad: '#f27c8a', onMint: '#051712',
  radius: 9, radiusLg: 18,
} as const;

const light = {
  bg: '#eceae4', bg1: '#ffffff', bg2: '#f6f7f5', bg3: '#eef0ed',
  line: '#e5e7e2', line2: '#d6dad3',
  ink: '#14181c', ink2: '#4b525b', ink3: '#7b828c', ink4: '#aab0b8',
  mint: '#1f6b54', mintDim: '#aedcc8', mintGlow: 'rgba(31,107,84,0.10)',
  info: '#2c5b9c', warn: '#a06a14', bad: '#b04050', onMint: '#ffffff',
  radius: 9, radiusLg: 18,
} as const;

export type Tokens = typeof dark;
export const THEMES: Record<'dark' | 'light', Tokens> = { dark, light };
export const APP = dark; // back-compat / brand logo mint

// Clean WHITE canvas that the dark app windows float on
export const CANVAS = {
  bg: '#fbfdfc',
  bgCore: '#ffffff',
  bgEdge: '#f1f5f3',
  ink: '#14181c',
  ink2: '#565d67',
  ink3: '#9aa1ab',
  line: 'rgba(20,30,26,0.10)',
  mint: '#0fae7e', // mint that reads on white (accent text / underline)
} as const;

export const FONT = { sans: inter, mono } as const;

export const TYPE = {
  hero: 60,
  h1: 40,
  h2: 30,
  lead: 24,
  body: 20,
  label: 16,
  small: 14,
  micro: 12,
} as const;

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);

export const EASE = {
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.3, 0, 1, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

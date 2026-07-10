import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

// App uses Geist → Inter is the practical, faithful stand-in; JetBrains Mono for data/mono.
export const inter = loadInter('normal', { weights: ['400', '500', '600', '700'] }).fontFamily;
export const mono = loadMono('normal', { weights: ['400', '500', '600'] }).fontFamily;

import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('png'); // crisp frames, no jpeg artifacts
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
Config.setCrf(16); // high-quality h264

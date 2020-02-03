import { homedir } from 'os';
import { join } from 'path';

import Traefik from './traefik';

interface Config {
  paths: {
    appdata: string;
    media: string;
    downloads: string;
  };
  traefik: Traefik;
}

const config: Config = {
  paths: {
    appdata: join(homedir(), '.getholo', 'framework', 'apps'),
    media: join(homedir(), '.getholo', 'framework', 'media'),
    downloads: join(homedir(), '.getholo', 'framework', 'downloads')
  },
  traefik: new Traefik()
};

export default config;

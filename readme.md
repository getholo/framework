# Holo Framework
**NOTE:** documentation is being worked on. For now please check out the **@getholo/apps** repository for a working example.

## Features
- simple config files
- dynamic environment values and label fetching
- tight integration support with event listeners

## Examples
```ts
import App from '@getholo/framework';

const traefik = new App({
  name: 'traefik',
  image: 'traefik:latest',
  network: {
    port: 8080,
    exposePorts: [
      {
        container: 80,
        host: 80,
      },
      {
        container: 443,
        host: 443,
      }
    ]
  },
});

export default traefik;
```

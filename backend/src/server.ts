import { buildApp } from './app';
import { config } from './config';

const app = buildApp();

app.listen(config.port, () => {
  console.log(`NGO website backend listening on http://localhost:${config.port}`);
});


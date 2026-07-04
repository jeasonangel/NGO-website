import axios from 'axios';
import { config } from './config';

// The one place the Census Data Portal API key is ever held. It's attached
// here, server-side, and never forwarded to a browser.
export const censusClient = axios.create({
  baseURL: config.censusApiUrl,
  headers: { 'X-API-Key': config.censusApiKey },
  timeout: 10000,
});

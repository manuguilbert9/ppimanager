import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// In App Hosting, the API key is automatically available in the environment.
// The googleAI() plugin will find and use it without explicit configuration.

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-pro-latest',
});

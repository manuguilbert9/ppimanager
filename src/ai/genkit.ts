import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const geminiApiKey =
  process.env.GEMINI_API_KEY ??
  process.env.GOOGLE_API_KEY ??
  process.env.GOOGLE_GENAI_API_KEY ??
  process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error(
    "Aucune clé API Gemini trouvée. Définissez GEMINI_API_KEY (ou GOOGLE_API_KEY) dans les variables d'environnement."
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: geminiApiKey,
    }),
  ],
  model: googleAI.model('gemini-1.5-pro-latest', {
    apiKey: geminiApiKey,
  }),
});

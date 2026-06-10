import { genkit } from 'genkit';
import { deepSeek } from '@genkit-ai/compat-oai/deepseek';

const deepseekApiKey =
  process.env.DEEPSEEK_API_KEY ??
  process.env.DEEPSEEK_V4_API_KEY ??
  process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

if (!deepseekApiKey) {
  throw new Error(
    "Aucune clé API DeepSeek trouvée. Définissez DEEPSEEK_API_KEY dans les variables d'environnement."
  );
}

// DeepSeek expose une API compatible OpenAI.
// `deepseek-chat` est le modèle de chat rapide (alias pointant toujours vers la
// dernière version du modèle DeepSeek), utilisé ici en remplacement de Gemini.
export const ai = genkit({
  plugins: [
    deepSeek({
      apiKey: deepseekApiKey,
    }),
  ],
  model: deepSeek.model('deepseek-chat'),
});

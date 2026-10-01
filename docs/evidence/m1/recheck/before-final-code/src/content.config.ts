import { defineCollection } from 'astro:content';
import { loadCanonicalCorpus } from './lib/content';
import { entrySchema } from './lib/content-schema';
// The same schema and source adapters serve collections, CLI checks and route consumers.
const canonical = defineCollection({ loader: async () => [...loadCanonicalCorpus().entries.values()], schema: entrySchema });
export const collections = { canonical };

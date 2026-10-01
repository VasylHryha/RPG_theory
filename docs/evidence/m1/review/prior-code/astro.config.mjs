import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import { activeConfig } from './src/lib/site-config.ts';
import { safeMarkdown, strictMath } from './src/lib/markdown.ts';

const config = activeConfig();
export default defineConfig({
  site: config.origin,
  base: config.basePath,
  output: 'static',
  compressHTML: true,
  trailingSlash: 'always',
  outDir: process.env.UNITY_OUTPUT_DIR ?? './dist/preview',
  devToolbar: { enabled: false },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, [safeMarkdown, { basePath: config.basePath }]],
      rehypePlugins: [rehypeSlug, strictMath]
    })
  },
  vite: { build: { sourcemap: false } }
});

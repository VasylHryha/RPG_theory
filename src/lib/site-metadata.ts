import type { Entry } from './content-schema.js';
import type { SiteConfig } from './site-config.js';
import { canonicalURL } from './urls.js';
import { publicationCredit } from './publication-policy.js';
import { stableJSON } from './identity.js';

export function pageMetadata(title:string,description:string,route:string,config:SiteConfig,entry?:Entry) {
  const credit=publicationCredit();
  return {'@context':'https://schema.org','@type':entry?.kind==='article' && entry.publicationState==='published'?'Article':'WebPage',name:title,description,url:canonicalURL(route,config),inLanguage:'en',isPartOf:{'@type':'WebSite',name:credit.title,url:canonicalURL('/',config)},...(entry?{dateModified:entry.updatedAt,...(entry.publicationState==='published'?{datePublished:entry.publishedAt}:{}),...(credit.approvedCredit?{author:{name:credit.approvedCredit.name}}:{})}:{})};
}
export const metadataJSON=(value:unknown)=>stableJSON(value).replace(/</g,'\\u003c');
export function sitemapXML(selection:{entries:Entry[];manifest:{sitemapIds:string[]}},config:SiteConfig) {
  const xml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${selection.entries.filter(e=>selection.manifest.sitemapIds.includes(e.id)).map(e=>`<url><loc>${xml(canonicalURL(e.route,config))}</loc><lastmod>${e.updatedAt}</lastmod></url>`).join('')}</urlset>\n`;
}

import { activePublication } from '../lib/publication';
import { activeConfig } from '../lib/site-config';
import { rssXML } from '../lib/publication-assets';
export function GET(){return new Response(rssXML(activePublication(),activeConfig()),{headers:{'Content-Type':'application/rss+xml; charset=utf-8'}});}

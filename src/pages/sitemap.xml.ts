import { activePublication } from '../lib/publication';
import { activeConfig } from '../lib/site-config';
import { sitemapXML } from '../lib/site-metadata';
export function GET(){return new Response(sitemapXML(activePublication(),activeConfig()),{headers:{'Content-Type':'application/xml; charset=utf-8'}});}

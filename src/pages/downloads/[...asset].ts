import { activePublication } from '../../lib/publication';
import { activeConfig } from '../../lib/site-config';
import { publicationAssets } from '../../lib/publication-assets';
let cached:ReturnType<typeof publicationAssets>;
function assets(){return cached ??= publicationAssets(activePublication(),activeConfig());}
export function getStaticPaths(){return [...assets().files.keys()].map(path=>({params:{asset:path.slice('/downloads/'.length)},props:{path}}));}
export function GET({props}:{props:{path:string}}){const raw=assets().files.get(props.path)!;return new Response(new Uint8Array(raw),{headers:{'Content-Type':props.path.endsWith('.zip')?'application/zip':props.path.endsWith('.json')?'application/json':'text/plain; charset=utf-8'}});}

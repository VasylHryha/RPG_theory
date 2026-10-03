import { ContractError } from '../src/lib/errors.js';

// Explicitly supported static syntax. New resource-bearing functions/at-rules
// require an adapter rather than silently becoming an unchecked loading path.
const functions = new Set([
  'calc','clamp','min','max','var','env','counter','counters','format','local',
  'inset','minmax','not','is','where','has','nth-child','nth-last-child','repeat',
  'rgb','rgba','hsl','hsla','hwb','lab','lch','oklab','oklch','color','color-mix',
  'linear-gradient','radial-gradient','conic-gradient','repeating-linear-gradient',
  'repeating-radial-gradient','repeating-conic-gradient',
  'translate','translatex','translatey','translatez','translate3d',
  'scale','scalex','scaley','scalez','scale3d','rotate','rotatex','rotatey','rotatez',
  'rotate3d','skew','skewx','skewy','matrix','matrix3d','perspective',
  'blur','brightness','contrast','drop-shadow','grayscale','hue-rotate','invert',
  'opacity','saturate','sepia','cubic-bezier','steps','linear'
]);
const atRules = new Set(['font-face','layer','media','supports','keyframes',
  '-webkit-keyframes','container','scope','starting-style','property']);
const whitespace = (c: string | undefined) => c !== undefined && /[\t\n\f\r ]/.test(c);
const nameCharacter = (c: string | undefined) => c !== undefined && /[-\w\u0080-\uffff]/.test(c);

export function cssResourceURLs(raw: string, from: string): string[] {
  let i=0;
  const urls: string[]=[], closing: string[]=[];
  const invalid=(): never => { throw new ContractError('UNSAFE_OUTPUT_CSS',from); };
  function comment() {
    const end=raw.indexOf('*/',i+2);if(end<0)invalid();i=end+2;
  }
  function trivia() {
    while(i<raw.length) {
      if(whitespace(raw[i]))i++;
      else if(raw.startsWith('/*',i))comment();
      else break;
    }
  }
  function escape(inString=false): string {
    i++;if(i>=raw.length)invalid();
    if(/[\n\r\f]/.test(raw[i])) {
      if(!inString)invalid();
      if(raw[i]==='\r' && raw[i+1]==='\n')i++;i++;return '';
    }
    if(/[\da-f]/i.test(raw[i])) {
      const start=i;while(i-start<6 && i<raw.length && /[\da-f]/i.test(raw[i]))i++;
      const code=parseInt(raw.slice(start,i),16);
      if(whitespace(raw[i])) {if(raw[i]==='\r' && raw[i+1]==='\n')i++;i++;}
      return String.fromCodePoint(code===0 || code>0x10ffff || code>=0xd800 && code<=0xdfff?0xfffd:code);
    }
    return raw[i++].replace(/\0/g,'\ufffd');
  }
  function string(): string {
    const quote=raw[i++];let value='';
    while(i<raw.length) {
      if(raw[i]===quote) {i++;return value;}
      if(/[\n\r\f]/.test(raw[i]))invalid();
      value+=raw[i]==='\\'?escape(true):raw[i++].replace(/\0/g,'\ufffd');
    }
    return invalid();
  }
  function name(): string {
    let value='';
    while(i<raw.length) {
      if(nameCharacter(raw[i]))value+=raw[i++];
      else if(raw[i]==='\\')value+=escape();
      // Conservatively refuse loading keywords split by comments, retaining
      // the predecessor contract without touching comment-like string bytes.
      else if(raw.startsWith('/*',i))comment();
      else break;
    }
    return value.toLowerCase();
  }
  function url(): string {
    i++;while(whitespace(raw[i]))i++;let value='';
    if(raw[i]==='"' || raw[i]==="'") {value=string();trivia();}
    else {
      while(i<raw.length && raw[i]!==')' && !whitespace(raw[i])) {
        if(/["'(\u0000-\u0008\u000b\u000e-\u001f\u007f]/.test(raw[i]))invalid();
        // Inside an unquoted URL, /*...*/ is literal URL data, not a comment.
        value+=raw[i]==='\\'?escape():raw[i++];
      }
      while(whitespace(raw[i]))i++;
    }
    if(raw[i]!==')' || !value)invalid();i++;return value;
  }
  while(i<raw.length) {
    const c=raw[i];
    if(whitespace(c)) {i++;continue;}
    if(raw.startsWith('/*',i)) {comment();continue;}
    if(c==='"' || c==="'") {string();continue;}
    if(c==='@') {i++;if(!atRules.has(name()))invalid();continue;}
    if(/[-_a-z\u0080-\uffff]/i.test(c) || c==='\\') {
      const value=name();
      if(raw[i]==='(') {
        if(value==='url')urls.push(url());
        else {if(!functions.has(value))invalid();closing.push(')');i++;}
      }
      continue;
    }
    if('({['.includes(c))closing.push(c==='('?')':c==='{'?'}':']');
    else if(')}]'.includes(c) && closing.pop()!==c)invalid();
    else if(/[\u0000-\u0008\u000b\u000e-\u001f\u007f]/.test(c))invalid();
    i++;
  }
  if(closing.length)invalid();
  return urls;
}

import { load } from 'cheerio';
import { ContractError } from './errors.js';
import { withBase } from './urls.js';

// Text lives in DOC-HOME. This renderer only groups that text and adds static
// schematic marks. Both page output and the fidelity auditor use renderEntry.
const escapeText=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const stepIds = [
  'hot-quantum-fields--quarkgluon-plasma', 'protons-and-neutrons', 'light-nuclei',
  'neutral-atoms-and-the-first-molecule', 'stars', 'heavy-elements',
  'planets-and-rich-chemistry', 'prebiotic-networks', 'cells',
  'multicellular-organisms', 'nervous-systems', 'humans-technology--ai'
];
function drawing(step: number, title:string, description:string) {
  const dot = (x: number, y: number, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  const seed = (x: number, y: number) => dot(x - 4, y + 3) + dot(x + 4, y + 3) + dot(x, y - 4);
  const atom = (x: number, y: number) => `<circle class="ladder-outline" cx="${x}" cy="${y}" r="12"/>${seed(x,y)}`;
  const molecule = (x: number, y: number) => `<path d="M${x-17} ${y}h34"/>${atom(x-17,y)}${atom(x+17,y)}`;
  const nerve = (x:number,y:number) => `<circle class="ladder-outline" cx="${x}" cy="${y}" r="15"/>${atom(x,y)}`;
  const star = `<path class="ladder-outline" d="m100 12 9 20 22-4-12 20 12 20-22-4-9 20-9-20-22 4 12-20-12-20 22 4Z"/>${atom(100,48)}`;
  const cell = (x: number, y: number) => `<ellipse class="ladder-outline" cx="${x}" cy="${y}" rx="27" ry="22"/>${molecule(x,y)}`;
  const drawings = [
    `<path class="ladder-outline" d="M15 40q12-28 24 0t24 0t24 0t24 0t24 0t24 0t24 0M15 64q12-24 24 0t24 0t24 0t24 0t24 0t24 0t24 0"/>`,
    seed(68,48)+seed(132,48)+`<circle class="ladder-outline" cx="68" cy="48" r="18"/><circle class="ladder-outline" cx="132" cy="48" r="18"/>`,
    `<circle class="ladder-outline" cx="100" cy="48" r="29"/>`+seed(90,43)+seed(109,54),
    molecule(100,48),
    star,
    star+`<path class="ladder-outline" d="M131 48h17m-5-5 5 5-5 5"/>`+atom(171,48)+atom(38,48),
    `<circle class="ladder-outline" cx="100" cy="48" r="40"/>`+molecule(100,48)+dot(82,24)+dot(123,73),
    `<path class="ladder-outline" d="M39 22h122v54H39zM65 48h70M65 48l35-25 35 25-35 25Z"/>`+atom(65,48)+atom(135,48)+dot(100,23)+dot(100,73),
    cell(100,48),
    `<path class="ladder-outline" d="M26 15h148v67H26z"/>`+cell(67,48)+cell(133,48),
    `<path class="ladder-outline" d="M30 18h140v66H30zM45 60l35-35 40 45 36-40"/>`+nerve(45,60)+nerve(80,25)+nerve(120,70)+nerve(156,30),
    `<circle class="ladder-outline" cx="54" cy="25" r="12"/><path class="ladder-outline" d="M54 37v36m-25-22h50M54 73l-19 18m19-18 19 18M99 18h78v59H99zM120 90h37m-18-13v13M79 51h20"/>`+nerve(120,36)+nerve(156,59)+`<path d="m120 36 36 23"/>`
  ];
  return `<svg viewBox="0 0 200 100" role="img" aria-labelledby="ladder-${step}-title ladder-${step}-desc" class="ladder-sketch"><title id="ladder-${step}-title">${escapeText(title)}</title><desc id="ladder-${step}-desc">${escapeText(description)}</desc>${drawings[step]}</svg>`;
}

export function renderHomeBody(html: string, base = '/') {
  const $ = load(html, null, false);
  // Keep one top-down order for sighted readers, screen readers and exports.
  const section = (id: string) => {
    const heading = $(`#${id}`);
    if (heading.length !== 1) throw new ContractError('HOME_LAYOUT_MISMATCH', id);
    const wrapper = $('<section></section>').addClass('home-section').attr('aria-labelledby',id);
    const contents = heading.nextUntil('h2');
    heading.before(wrapper); wrapper.append(heading, contents);
    return wrapper;
  };
  const rules = section('the-name-is-the-rules').addClass('home-rules');
  const ruleGrid = $('<div class="rule-grid"></div>');
  const ruleMarks = [
    '<path d="M15 50q17-35 34 0t34 0t34 0t34 0t34 0"/>',
    '<circle cx="100" cy="50" r="38"/><path d="M65 50q17-30 35 0t35 0M67 22l-8 13 15-2M134 79l8-13-15 2"/>',
    '<circle cx="45" cy="50" r="14"/><circle cx="95" cy="50" r="14"/><ellipse cx="70" cy="50" rx="48" ry="31"/><path d="M122 50h36m-7-7 7 7-7 7"/><circle cx="176" cy="50" r="17"/>'
  ];
  // These marks repeat the adjacent rule text and are decorative.
  rules.find('h3').first().before(ruleGrid);
  rules.find('h3').each((i, el) => {
    const h=$(el), copy=h.next('p');
    ruleGrid.append($('<div class="rule-card"></div>').append(
      `<svg viewBox="0 0 200 100" class="ladder-sketch ladder-outline" aria-hidden="true">${ruleMarks[i]}</svg>`, h, copy));
  });
  rules.children('p').filter((_i,el)=>$(el).find('strong').length>0).addClass('rule-cycle');
  rules.children('p').last().addClass('rule-note');
  const two = section('two-ways-to-open-the-next-step').addClass('two-ways');
  const ways = $('<div class="way-grid"></div>');
  two.find('h3').each((_i, el) => {
    const h = $(el), content = h.nextUntil('h3');
    ways.append($('<div class="way-card"></div>').append(h, content));
  });
  two.append(ways);

  const ladder = section('the-ladder').addClass('home-ladder');
  const bands = $('<div class="ladder-bands"></div>');
  const branchHeading = ladder.find('h3').last();
  const branch = $('<aside class="ladder-branch"></aside>').append(branchHeading.nextUntil('h3').addBack());
  const branchTitle = branch.find('h3');
  branchTitle.replaceWith($('<h5></h5>').attr('id',branchTitle.attr('id')!).text(branchTitle.text()));
  // Two arrangements of the same nine marks: a layered and a connected form.
  branch.prepend(`<svg viewBox="0 0 200 70" class="ladder-sketch" aria-hidden="true"><path class="ladder-outline" d="M12 16h64M12 35h64M12 54h64M127 15l-20 20 20 20 20-20Zm0 0 40 0 20 20-20 20-20-20"/>${[16,35,54].map(y=>[20,44,68].map(x=>`<circle cx="${x}" cy="${y}" r="3"/>`).join('')).join('')}${[[127,15],[147,15],[167,15],[107,35],[147,35],[187,35],[127,55],[147,55],[167,55]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</svg>`);
  let step = 0;
  ladder.find('h3').each((_i, el) => {
    const heading = $(el), contents = heading.nextUntil('h3');
    const band = $('<section class="ladder-band"></section>').attr('aria-labelledby',heading.attr('id')!);
    const list = $('<ol class="ladder-steps"></ol>').attr('start',String(step+1));
    contents.filter('h4').each((_j, title) => {
      const h = $(title), lines = h.nextUntil('h4,h3');
      if (h.attr('id') !== stepIds[step]) throw new ContractError('HOME_LAYOUT_MISMATCH', 'Unexpected ladder order');
      const copy = $('<div class="ladder-copy"></div>').append(h,lines);
      copy.find('p').last().addClass('way-tag');
      const item = $('<li class="ladder-step"></li>').append(drawing(step,h.text(),copy.find('p').first().text()), copy);
      if (step === 5) item.append(branch);
      list.append(item); step++;
    });
    band.append(heading,list); bands.append(band);
  });
  if (step !== 12) throw new ContractError('HOME_LAYOUT_MISMATCH', 'Expected twelve ladder steps');
  ladder.append(bands);
  const journey = section('one-carbon-atoms-journey').addClass('carbon-journey');
  const path=journey.find('p').first().addClass('journey-path');
  const labels=path.find('strong').first(), stages=labels.text().split(' → ');
  if (stages.length !== 4) throw new ContractError('HOME_LAYOUT_MISMATCH', 'Expected four carbon stages');
  const carbon='<circle class="journey-carbon" cx="100" cy="48" r="8"/>';
  const journeyMarks=[
    '<path class="ladder-outline" d="m100 6 12 23 25-4-13 23 13 23-25-4-12 23-12-23-25 4 13-23-13-23 25 4Z"/>',
    '<path class="ladder-outline" d="m65 30 35 18 35-18m-35 18v30"/><circle class="ladder-outline" cx="65" cy="30" r="10"/><circle class="ladder-outline" cx="135" cy="30" r="10"/><circle class="ladder-outline" cx="100" cy="78" r="10"/>',
    '<ellipse class="ladder-outline" cx="100" cy="48" rx="53" ry="36"/><path class="ladder-outline" d="m75 30 25 18 25-18m-25 18v25"/>',
    '<circle class="ladder-outline" cx="100" cy="15" r="10"/><path class="ladder-outline" d="M100 25v49M70 42h60m-30 32-22 20m22-20 22 20"/>'
  ];
  labels.empty();
  stages.forEach((label,i)=>labels.append(`<span class="journey-stage"><svg viewBox="0 0 200 100" class="ladder-sketch" aria-hidden="true">${journeyMarks[i]}${carbon}</svg><span>${escapeText(label)}${i<3?' <span class="journey-arrow" aria-hidden="true">→</span>':''}</span></span> `));
  section('life-is-a-late-part-of-the-same-ladder');
  const closer = section('look-closer').addClass('home-accordions');
  closer.find('h3').each((_i, el) => {
    const heading=$(el), contents=heading.nextUntil('h3');
    const details=$('<details></details>');
    heading.before(details);details.append($('<summary></summary>').attr('id',heading.attr('id')!).text(heading.text()),contents);heading.remove();
  });
  section('choose-your-next-step').addClass('home-doors').append($('<p class="all-pages-link"></p>').append($('<a>See all pages →</a>').attr('href', withBase('/contents/', base))));
  return $.html();
}

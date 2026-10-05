const form = document.querySelector('[data-search-form]');
const input = document.querySelector('#search-query');
const resultStatus = document.querySelector('#search-status');
const results = document.querySelector('#search-results');
let modulePromise;
let generation = 0;
form.addEventListener('submit', async event => {
  event.preventDefault();
  const request = ++generation;
  results.replaceChildren();
  const query = input.value.trim();
  if (!query) { resultStatus.textContent = 'Enter a word or phrase to search.'; return; }
  if (form.dataset.count === '0') { resultStatus.textContent = 'No published readings yet. Browse the topic and document indexes below.'; return; }
  resultStatus.textContent = 'Searching…';
  try {
    modulePromise ??= import(form.dataset.bundle).then(async pagefind => {
      await pagefind.options({baseUrl: form.dataset.base, basePath: form.dataset.base + 'pagefind/', excerptLength: 24});
      return pagefind;
    }).catch(error => { modulePromise = undefined; throw error; });
    const pagefind = await modulePromise;
    const found = await pagefind.search(query);
    const items = await Promise.all(found.results.slice(0,20).map(result => result.data()));
    if (request !== generation) return;
    for (const item of items) {
      const destination = new URL(item.url, location.href);
      if (destination.origin !== location.origin || !destination.pathname.startsWith(form.dataset.base)) throw new Error('Unexpected search destination');
      const li = document.createElement('li'), link = document.createElement('a');
      link.href = destination.href; link.textContent = item.meta.title;
      const context = document.createElement('p');
      context.className = 'reading-note'; context.textContent = item.meta.status + '. ' + item.meta.scope;
      const excerpt = document.createElement('p');
      // Extract text from Pagefind's highlight markup without injecting HTML.
      excerpt.textContent = new DOMParser().parseFromString(item.excerpt, 'text/html').body.textContent;
      li.append(link, context, excerpt); results.append(li);
    }
    resultStatus.textContent = found.results.length ? `${found.results.length} result${found.results.length === 1 ? '' : 's'}${found.results.length > 20 ? '; showing the first 20' : ''}.` : 'No results. Try a different word or browse the indexes below.';
  } catch {
    if (request === generation) resultStatus.textContent = 'Search is unavailable. Browse the topic and document indexes below.';
  }
});

export {};

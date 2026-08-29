interface HighlightResult {
  value: string;
  language?: string;
}

interface HighlightApi {
  listLanguages(): string[];
  highlight(code: string, options: { language: string; ignoreIllegals: boolean }): HighlightResult;
  highlightAuto(code: string, languageSubset?: string[]): HighlightResult;
}

let highlightApi: Promise<HighlightApi> | null = null;

function loadHighlightApi(): Promise<HighlightApi> {
  highlightApi ??= import('highlight.js').then((module: { default?: HighlightApi }) => {
    const api = module.default ?? (module as unknown as HighlightApi);
    if (!api?.highlight) {
      throw new Error('highlight.js did not load');
    }
    return api;
  });
  return highlightApi;
}

export async function highlightAnswerHtml(html: string): Promise<string> {
  if (!html?.trim() || typeof DOMParser === 'undefined') {
    return html ?? '';
  }

  const parsed = new DOMParser().parseFromString(normalizeAnswerHtml(html), 'text/html');

  parsed.querySelectorAll('pre').forEach((pre: HTMLPreElement) => {
    if (!pre.querySelector('code')) {
      const code = parsed.createElement('code');
      code.innerHTML = pre.innerHTML;
      pre.replaceChildren(code);
    }
  });

  const blocks = parsed.querySelectorAll<HTMLElement>('pre code, code[class*="language-"]');
  if (!blocks.length) {
    return parsed.body.innerHTML;
  }

  const hljs = await loadHighlightApi();
  const languages = hljs.listLanguages();

  for (const block of Array.from(blocks)) {
    const source = block.textContent ?? '';
    if (!source.trim()) {
      continue;
    }

    const language = readLanguage(block, languages);
    const result = language
      ? hljs.highlight(source, { language, ignoreIllegals: true })
      : hljs.highlightAuto(source, languages);

    block.innerHTML = result.value;
    block.classList.add('hljs');
    if (result.language) {
      block.classList.add(`language-${result.language}`);
    }
  }

  return parsed.body.innerHTML;
}

function normalizeAnswerHtml(html: string): string {
  let value = decodeEscapedCodeTags(html).replace(/<br\s*\/?>/gi, '\n');

  if (hasRealCodeMarkup(value)) {
    return value;
  }

  if (value.includes('```') || /```/.test(stripTags(value))) {
    return convertMarkdownFences(stripBlockWrappers(value));
  }

  return value;
}

function hasRealCodeMarkup(html: string): boolean {
  return /<(pre|code)\b/i.test(html);
}

function decodeEscapedCodeTags(html: string): string {
  return html.replace(
    /&lt;(\/?)(pre|code)((?:(?!&gt;).)*)&gt;/gi,
    (_match: string, slash: string, tag: string, attrs: string) => {
      const decodedAttrs = attrs
        .replace(/&quot;/gi, '"')
        .replace(/&#0*39;/g, "'");
      return `<${slash}${tag}${decodedAttrs}>`;
    },
  );
}

function stripBlockWrappers(html: string): string {
  return html
    .replace(/<\/(div|p|li)>/gi, '\n')
    .replace(/<(div|p|li)[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '');
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

function readLanguage(block: HTMLElement, languages: string[]): string | undefined {
  const fromClass = [...block.classList, ...Array.from(block.parentElement?.classList ?? [])]
    .map((className: string) => className.replace(/^(language-|lang-)/, ''))
    .find((className: string) => languages.includes(className));
  return fromClass;
}

function convertMarkdownFences(html: string): string {
  return html.replace(/```(\w+)?\r?\n([\s\S]*?)```/g, (_match: string, language: string | undefined, code: string) => {
    const className = language ? ` class="language-${language}"` : '';
    return `<pre><code${className}>${escapeHtml(code)}</code></pre>`;
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

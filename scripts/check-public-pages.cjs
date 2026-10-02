// HTTP/HTML smoke test, not a replacement for browser interaction or visual QA.
// Example: npm run test:public -- https://sports-tech-intelligence.vercel.app
const { JSDOM } = require('jsdom');
const base = process.argv[2] || 'http://localhost:3000';
const pages = ['/contact', '/terms', '/refunds', '/privacy', '/pricing'];

(async () => {
  for (const path of pages) {
    const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
    const dom = new JSDOM(await response.text());
    const document = dom.window.document;
    // RSC scripts contain strings of content even when SSR is disabled. They
    // must not count as rendered HTML. Streamed HTML segments do count.
    document.querySelectorAll('script, style, template').forEach(element => element.remove());
    const htmlText = document.body.textContent || '';
    const links = [...document.querySelectorAll('footer a')].map(link => link.getAttribute('href'));
    const result = {
      path, status: response.status,
      heading: document.querySelector('h1')?.textContent || null,
      policyLinks: ['/contact', '/terms', '/refunds', '/privacy'].every(href => links.includes(href)),
      support: !!document.querySelector('a[href="mailto:beanliao00@163.com"]'),
      operator: htmlText.includes('东莞市中堂天姆德电商店'),
      refundWindow: htmlText.includes('7 days'),
      obsoleteEmail: htmlText.includes('privacy@sportstechintelligence.com'),
    };
    console.log(JSON.stringify(result));
    if (!response.ok || !result.heading || !result.policyLinks || result.obsoleteEmail ||
      (path !== '/pricing' && (!result.support || !result.operator)) ||
      (['/terms', '/refunds', '/pricing'].includes(path) && !result.refundWindow)) process.exitCode = 1;
    dom.window.close();
  }
})().catch(error => { console.error('Public-page check failed:', error.name); process.exitCode = 1; });

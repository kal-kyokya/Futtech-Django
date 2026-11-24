import { readFileSync } from 'node:fs';
const previewImage =
  'data:image/webp;base64,' +
  readFileSync(
    new URL('./assets/football-preview.webp', import.meta.url),
  ).toString('base64');
export const video = {
  id: 'clip-1',
  slug: 'match-analysis',
  title: 'A different perspective',
  description:
    'Movement, positioning, and the moments that make the difference.',
  status: 'ready',
  category: 'training',
  thumbnail: previewImage,
  owner: 1,
  embed_url:
    'https://iframe.mediadelivery.net/embed/library/clip?token=test&expires=123',
};
export const profile = {
  id: 1,
  username: 'player',
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'player@example.test',
  profession: 'Footballer',
  position: 'striker',
  sex: 'female',
  birthday: '1995-01-01',
  phone: '+254712345678',
  location: 'Nairobi',
  profilePic: '/BlankProfile.png',
};

export async function preparePage(page, member = false) {
  // Provider and API fixtures deliberately isolate layout checks from credentials,
  // live payments, and third-party playback availability.
  await page.addInitScript(() => {
    window.google = {
      accounts: {
        id: {
          initialize() {},
          renderButton(container) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Continue with Google';
            button.style.cssText =
              'background:#fff;color:#1f2937;width:100%;border-radius:4px;min-height:44px';
            container.appendChild(button);
          },
        },
      },
    };
  });
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (
      url.hostname === 'vz-6d210aca-5d4.b-cdn.net' &&
      url.pathname.endsWith('.jpg')
    )
      return route.fulfill({
        contentType: 'image/webp',
        body: Buffer.from(previewImage.split(',')[1], 'base64'),
      });
    if (url.hostname === 'iframe.mediadelivery.net')
      return route.fulfill({
        contentType: 'text/html',
        body: `<!doctype html><html lang="en"><head><title>Video preview fixture</title><style>body{margin:0;background:#111b2e}img{width:100vw;height:100vh;object-fit:cover}</style></head><body><img src="${previewImage}" alt="Football training footage preview"></body></html>`,
      });
    if (url.hostname !== '127.0.0.1') return route.abort();
    if (!url.pathname.startsWith('/api/v2/')) return route.continue();
    const path = url.pathname.replace('/api/v2', '');
    const json = (body, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    if (path.includes('/token/refresh/'))
      return member ? json({ access: 'browser-access' }) : json({}, 401);
    if (path === '/auth/me/' || path.startsWith('/users/'))
      return json(profile);
    if (path === '/auth/logout/') return json({});
    if (path === '/auth/register/')
      return json({ access: 'browser-access', user: profile }, 201);
    if (path === '/videos/featured/' || path === '/public/showcase/')
      return json([video]);
    if (path.startsWith('/public/showcase/')) return json(video);
    if (path.includes('/playback/'))
      return json({ embed_url: video.embed_url, status: 'ready' });
    if (path.startsWith('/video/')) return json(video);
    if (path.startsWith('/playlists')) {
      if (request.method() === 'POST')
        return json(
          { id: 3, ...request.postDataJSON(), owner: 1, videos: [] },
          201,
        );
      return json({
        count: 2,
        next: null,
        results: [
          {
            id: 1,
            name: 'Training review',
            description: 'Build on every session.',
            owner: 1,
            videos: [video],
          },
          {
            id: 2,
            name: 'Match day',
            description: 'The moments worth another look.',
            owner: 2,
            videos: [video],
          },
        ],
      });
    }
    if (path === '/futtech-xi/analyze')
      return json({
        status: 'completed',
        agents: [
          'researcher',
          'tactician',
          'content-strategist',
          'chief-analyst',
        ],
        report: {
          match: 'FC Barcelona (curated demonstration profile)',
          confidence: 0.9,
          key_findings: ['Structured possession creates space.'],
          tactical_story: 'A curated analysis example.',
          content_opportunities: [],
          limitations: ['Curated data; not live match information.'],
        },
      });
    if (path.includes('/checkout/initiate/'))
      return json(
        {
          transaction_id: 'payment-1',
          amount: '1500.00',
          message: 'Check your phone and enter your M-Pesa PIN.',
        },
        202,
      );
    if (path.includes('/checkout/status/'))
      return json({ status: 'SUCCEEDED' });
    throw new Error(`Missing browser API fixture: ${request.method()} ${path}`);
  });
}

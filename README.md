# bella-website-static

Bella App's marketing site — `bellaapp.au`. Static HTML + Tailwind, served by GitHub Pages.

The companion API (contact form + Android waitlist) lives in a separate repo: [bella-api](https://github.com/elysee-dubois/bella-api), deployed to Vercel at `https://bella-website-api-bella-app.vercel.app`.

## Local dev

```
npm install      # first time
npm run dev      # http://localhost:5173 with live-reload + Tailwind watch
```

You'll also want the API running locally:
```
cd ../api        # or wherever you cloned bella-api
npm run dev      # listens on :8787
```

The site auto-detects localhost and posts forms to the dev API. See [`assets/js/config.js`](assets/js/config.js).

## Build

```
npm run build    # rebuilds HTML + Tailwind CSS
```

The built `assets/css/styles.css` is committed so GitHub Pages can serve it without a build step. Run `npm run build` before any push.

## Project layout

```
site/
├── pages/                # *.html source — edit these
├── partials/             # head, nav, footer, layout-start, layout-end, etc.
├── assets/
│   ├── css/input.css     # Tailwind source (theme tokens, custom CSS)
│   ├── css/styles.css    # built — committed, don't edit
│   ├── js/               # vanilla JS (config, nav, reveal, faq, forms, etc.)
│   └── img/              # images
├── build.mjs             # tiny Node builder: pages + partials → root HTML
├── CNAME                 # bellaapp.au — required by Pages custom domain
├── .nojekyll             # tells Pages to skip Jekyll
├── sitemap.xml
├── robots.txt
└── (built output: index.html, business/index.html, blog/, etc.)
```

## Editing pages

Each file in `pages/` starts with a metadata directive:

```html
<!-- meta title: Contact | description: ... | path: /contact | active: contact | audience: consumer -->
{{> layout-start}}
... page body ...
{{> layout-end}}
```

Available `{{> partial}}` includes: `layout-start`, `layout-end`, `head`, `nav`, `footer`, `scripts`, `store-badges`. The `audience` value (`consumer` | `business`) controls which set of nav links shows.

## Adding a blog post

1. Create `pages/blog/<slug>/index.html` (copy an existing post for the template).
2. Add a card in `pages/blog/index.html` and (optionally) `pages/index.html`.
3. Add the URL to `sitemap.xml`.
4. `npm run build`, commit, push.

## Deployment

Pushing to `main` is the deploy — GitHub Pages serves whatever's at the root of `main`. The `CNAME` and `.nojekyll` files are already configured.

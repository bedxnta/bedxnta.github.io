# MarkPlane — Markdown, made simple

MarkPlane is a responsive, client-side Markdown editor in the PlaneStudios family. Its landing page and editor are separate pages. It is built with plain HTML, CSS, and JavaScript and requires no build step or server-side service.

## Features

- Live Markdown preview with headings, paragraphs, lists, task lists, quotes, links, inline emphasis, code, and fenced code blocks.
- Local autosave, document naming, and `.md` downloads.
- Toolbar helpers, Markdown copy, keyboard shortcuts, and a loadable example.
- Light and dark themes with saved preference.
- Markdown is rendered locally; raw HTML is escaped, and preview links are restricted to HTTP(S), mailto, or relative URLs.

## Run locally

From the repository root, serve the static site with any local HTTP server and open `/markplane/` for the landing page or `/markplane/editor.html` to write. For example:

```bash
python -m http.server 8000
```

The editor works without a build step. Its current document and theme preference are stored in browser local storage.

# Bloom Ayyappa Vratham Guide

A static, YAML-driven guide to the Sabarimala Mandala Vratham journey. The site presents the journey from mala dharanam through the 41-day observance, Irumudi preparation, pilgrimage and darshan, and mala vimochanam.

## Requirements

- Node.js 14.6 or newer
- npm

## Getting started

Install the dependencies:

```bash
npm install
```

Build the site:

```bash
npm run build
```

Or install the locked dependencies and build in one step:

```bash
./build.sh
```

The build script reads [`config.yaml`](./config.yaml) and the Markdown files in [`content/`](./content/), then generates the landing page at `index.html` and one page per stage in [`docs/`](./docs/).

## Project structure

- `config.yaml` - Site metadata, observance dates, and the ordered journey stages.
- `content/` - Markdown source for each journey stage.
- `scripts/build-site.js` - Static site generator.
- `styles.css` - Site styling.
- `ayyappa.png` - Site logo.
- `index.html` and `docs/` - Generated website output.

To update the guide, edit the configuration or Markdown source files and run `npm run build` again. Generated `docs/` pages are ignored by Git because they can be recreated from the source.

## Deployment

The generated static files can be served by any static web host. The included [`CNAME`](./CNAME) file configures the custom domain used by GitHub Pages.

Pushes to the `master` branch run the GitHub Actions workflow in [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml). The workflow invokes the same `build.sh` script used locally, packages the generated site, and deploys it to GitHub Pages. It can also be started manually from the Actions tab.

## Disclaimer

This guide is informational. Devotees should follow the guidance of their temple, priest, or Guruswamy for local observance, ritual, travel, and pilgrimage requirements.

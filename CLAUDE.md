# CLAUDE.md - Kvartirnik-site

## Project Overview

Hugo-based website for "KAMIN" (КАМИН) - a creative space in Nizhny Novgorod hosting acoustic concerts ("kvartirniki"). Live at: https://kvartirniknn.ru/

## Quick Start

```bash
# Dev server
hugo server -D

# Build
hugo --minify --cleanDestinationDir

# Create new event
hugo new kvartirniki/YYYY-MM-DD.md
```

## Tech Stack

- **SSG:** Hugo (>= 0.128.0, extended)
- **Theme:** Ananke (git submodule in `themes/ananke/`)
- **CSS:** Tachyons (from theme) + custom CSS (`assets/css/custom.css`)
- **JS:** Vanilla JavaScript (inline in layouts)
- **Forms:** Yandex Forms (external integration)
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)
- **Language:** Russian (ru-ru)

## Project Structure

```
/
├── hugo.toml                    # Main config
├── content/
│   ├── _index.html              # Homepage content
│   ├── kvartirniki/             # Events (YYYY-MM-DD.md)
│   ├── history/                 # Archive page
│   ├── about/                   # About page
│   ├── register/                # Registration (Yandex Form embed)
│   └── policy/                  # Privacy policy
├── layouts/
│   ├── index.html               # Homepage template (dynamic event display)
│   ├── kvartirniki/single.html  # Event detail (754 lines, gallery, participants)
│   ├── _default/history.html    # Archive grid
│   ├── about/single.html        # About with team cards
│   ├── register/single.html     # Form embed with JS
│   ├── policy/single.html       # Minimal layout
│   └── partials/                # head.html, head-additions.html, creative-meta.html
├── assets/css/custom.css        # Custom styles (706 lines)
├── static/
│   ├── images/                  # All images (~1.3GB)
│   │   ├── headers/             # Header images
│   │   ├── kv_list/             # Event photos by date
│   │   ├── about/               # About page assets
│   │   ├── team_photos/         # Team member photos
│   │   └── utils/               # Social icons (vk, telegram SVG)
│   ├── CNAME                    # Custom domain config
│   └── site.webmanifest         # PWA manifest
└── .github/workflows/           # CI/CD deployment
```

## Key Conventions

### Events (Kvartirniki)
- Files: `content/kvartirniki/YYYY-MM-DD.md`
- Rich frontmatter: date, time, location, address, maps_link, participants (name, instrument, songs), program, photos, price, contacts, registration_deadline
- Homepage auto-shows nearest future event; falls back to last past event
- `buildFuture = true` in config allows future-dated content

### Color Palette
- Primary browns: #5a1700, #8B4513, #654321, #50280b
- Used throughout custom CSS and inline styles

### Content Language
- All content in Russian
- Site targets Russian-speaking audience in Nizhny Novgorod

### Images
- Formats: webp, avif preferred (with jpg/png fallback)
- Event photos stored in `static/images/kv_list/YYYY-MM-DD/`
- Lazy loading used in galleries

## Important Notes

- `public/` directory is generated output - do not edit directly
- Theme is a git submodule - do not edit files in `themes/ananke/`
- Large layouts (kvartirniki/single.html) contain inline CSS and JS
- `writeStats = true` in config generates `hugo_stats.json`
- Two workflow files exist; `deploy.yml` is the active one

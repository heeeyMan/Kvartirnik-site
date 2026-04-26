# CLAUDE.md - Kvartirnik-site

## Project Overview

Hugo-based website for "KAMIN" (КАМИН) — a creative space in Nizhny Novgorod hosting acoustic concerts ("kvartirniki"). Live at: https://kvartirniknn.ru/

## Quick Start

```bash
hugo server -D                       # Dev server
hugo --minify --cleanDestinationDir  # Build
./scripts/new-event.sh               # Create new event (interactive)
```

## Tech Stack

- **SSG:** Hugo (v0.147.9 extended)
- **Theme:** Ananke (git submodule, NOT actively used — all layouts are custom overrides)
- **CSS:** Custom (`assets/css/custom.css`, ~2950 lines), brown palette (#5a1700, #8B4513)
- **JS:** `assets/js/interactions.js` (cursor, tilt, counters, scroll-reveal) + `assets/js/gallery.js` (modal lightbox)
- **Forms:** Yandex Forms (iframe embed, form ID: 69eb9f8a95add51d5d7d08d2)
- **Analytics:** Yandex Metrika (counter 108755174, production only)
- **Hosting:** GitHub Pages, CI/CD via `.github/workflows/deploy.yml`
- **Language:** Russian (ru-ru)

## Project Structure

```
├── hugo.toml                       # Main config
├── scripts/
│   └── new-event.sh                # Interactive script to create new events
├── docs/
│   └── creating-events.md          # Event creation guide and rules
├── content/
│   ├── _index.html                 # Homepage content
│   ├── kvartirniki/                # Events (YYYY-MM-DD.md)
│   ├── history/                    # Archive page
│   ├── about/                      # About page
│   ├── register/                   # Registration (Yandex Form + VPN detection)
│   └── policy/                     # Privacy policy
├── layouts/
│   ├── index.html                  # Homepage (dynamic event, counters, social)
│   ├── 404.html                    # Custom 404
│   ├── kvartirniki/single.html     # Event detail (map, gallery, share, participants)
│   ├── _default/
│   │   ├── baseof.html             # Base template (SEO, Metrika, critical CSS, preload)
│   │   └── history.html            # Archive grid
│   ├── about/single.html           # About with team cards
│   ├── register/single.html        # Form embed with VPN detection
│   └── partials/
│       ├── site-header.html        # Header with dynamic hero
│       ├── site-navigation.html    # Navigation
│       ├── site-footer.html        # Footer
│       ├── register-menu-item.html # Conditional "Регистрация" menu item
│       ├── creative-meta.html      # OG meta for events
│       └── critical-css.html       # Inline critical CSS
├── assets/
│   ├── css/custom.css              # All styles (~2950 lines)
│   └── js/
│       ├── interactions.js         # UI interactions (cursor, tilt, counters, scroll)
│       └── gallery.js              # Photo gallery + modal lightbox
├── static/
│   ├── images/                     # All images (WebP, ~53MB)
│   │   ├── headers/                # Header images
│   │   ├── kv_list/YYYY-MM-DD/     # Event photos by date
│   │   ├── team_photos/            # Team member photos
│   │   └── utils/                  # Social icons (vk, telegram SVG)
│   ├── CNAME                       # Custom domain
│   └── site.webmanifest            # PWA manifest
└── .github/workflows/deploy.yml    # CI/CD
```

## Event Frontmatter

```yaml
title: "Квартирник в Venue"
date: YYYY-MM-DDT19:00:00+03:00
deadline_reg_date: YYYY-MM-DDT18:55:00+03:00  # when registration closes
draft: false
featured_image: "/images/kv_list/YYYY-MM-DD/1.webp"
time: "18:30"
location: "Venue Name"
address: "г. Нижний Новгород, ул. Example, 1"
yandex_maps_link: "https://yandex.ru/maps/..."
price: "0"
contacts: "+7 (910) 387-27-47"
duration: "3 часа"
description: "SEO description"
eventFormat: |
  - Markdown rules list
participants:
  - name: "Name"
    instrument: "вокал, гитара"
    songs: ["Song 1"]
program:
  - time: "19:00"
    title: "Opening"
photos:
  - "/images/kv_list/YYYY-MM-DD/1.webp"
```

## Key Conventions

- **Images:** WebP only, stored in `static/images/kv_list/YYYY-MM-DD/`, lazy loading
- **Content:** All in Russian, targets Nizhny Novgorod audience
- **Homepage:** Auto-shows nearest future event; falls back to last past event
- **Registration menu:** Appears only when future events have open registration (deadline not passed)
- **buildFuture = true** allows future-dated event pages

## Important Rules

- `public/` is generated output — do not edit or commit
- `themes/ananke/` is a git submodule — do not edit
- `hugo_stats.json` is auto-generated — do not commit
- All commit messages and UI text in Russian
- Yandex Metrika code runs only in production (`hugo.IsProduction`)
- SEO: Schema.org Event on each event page, WebSite+Organization site-wide
- After completing changes, update the memory system (`~/.claude/projects/.../memory/`) to reflect what was done

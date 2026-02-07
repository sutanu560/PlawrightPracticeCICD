# Playwright Demo Project

A small Playwright end-to-end test project with an **industrial-style structure**, targeting the [TodoMVC demo](https://demo.playwright.dev/todomvc/) (official Playwright demo app).

## Project structure

```
PlaywrightPracticeCICD/
├── playwright.config.ts    # Playwright config (baseURL, projects, reporters)
├── package.json
├── tsconfig.json
├── src/
│   ├── pages/              # Page Object Model
│   │   ├── BasePage.ts     # Base class for all pages
│   │   └── TodoPage.ts     # TodoMVC page object
│   ├── fixtures/           # Custom test fixtures
│   │   └── test.ts         # Extended test with todoPage fixture
│   └── utils/
│       └── constants.ts    # App URLs and constants
├── tests/
│   └── todo.spec.ts        # TodoMVC test specs
├── playwright-report/      # HTML report (generated)
└── test-results/           # Artifacts (generated)
```

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

```bash
npm install
npx playwright install
```

## Run tests

```bash
# Run all tests (Chromium, Firefox, WebKit)
npm test

# Run in headed mode
npm run test:headed

# Run with UI mode
npm run test:ui

# Debug
npm run test:debug
```

## View report

After a run:

```bash
npm run report
```

## Configuration

- **Base URL**: `https://demo.playwright.dev` (override with `BASE_URL` env var).
- **Browsers**: Chromium, Firefox, WebKit (see `playwright.config.ts`).
- **Artifacts**: Trace/screenshot/video on first retry or failure.

## Test app

Tests run against the official Playwright TodoMVC demo:  
[https://demo.playwright.dev/todomvc/](https://demo.playwright.dev/todomvc/)

No login or API keys required.

# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: tabbable — a small utility that identifies tabbable/focusable DOM nodes.

Commands

- Install deps (clean install)
  - npm ci
- Build all bundles (CJS, ESM, UMD)
  - npm run build
- Build a specific bundle format
  - ESM: npm run compile:esm
  - CJS: npm run compile:cjs
  - UMD: npm run compile:umd
- Lint and formatting
  - Check formatting: npm run format:check
  - Auto-format: npm run format
  - Lint: npm run lint
  - Lint with autofix: npm run lint -- --fix
- Tests
  - Run everything (format check, lint, types, unit, e2e): npm test
  - Type definitions only: npm run test:types
  - Unit tests (Jest/jsdom): npm run test:unit
  - E2E tests (Cypress): npm run test:e2e
  - E2E with coverage: npm run test:coverage
- Running a single test
  - Jest by file: npm run test:unit -- test/unit/unit.test.js
  - Jest by name (pattern): npm run test:unit -- -t "should throw with no input node"
  - Cypress by spec: npm run test:e2e -- --spec test/e2e/isTabbable.cy.js
  - Open Cypress runner (interactive): npm run test:e2e:dev
- Local debug harness (browser demo)
  - npm start
  - Starts a budo dev server on test/debug.js after building the CJS bundle

Notes from README and configs that affect development

- JSDom and displayCheck
  - Unit tests run under jsdom. When writing tests that call tabbable()/focusable()/isTabbable()/isFocusable(), pass options with displayCheck: 'none' to avoid false negatives due to incomplete layout APIs in jsdom. Existing tests do this; follow that pattern for new ones.
- Node version
  - CI runs the main job on Node “latest” and releases on Node 18. Use Node 18+ locally for consistency.

High-level architecture

- Public API (named exports from src/index.js)
  - tabbable(container, options?) → Element[]
    - Returns tabbable elements in tab order. Respects includeContainer, displayCheck, and getShadowRoot.
  - focusable(container, options?) → Element[]
    - Returns focusable elements in DOM order (not tab order). Same options as above.
  - isTabbable(node, options?) → boolean
  - isFocusable(node, options?) → boolean
  - getTabIndex(node) → number
- Candidate discovery
  - Core CSS selector list (candidateSelectors) targets inputs, anchors with href, buttons, [tabindex], contenteditable, audio/video with controls, details/summary, etc. JSDom selector limitations are handled by JS checks (e.g., inert, contenteditable) rather than advanced selectors.
  - Two traversal modes:
    - getCandidates: simple querySelectorAll + filter
    - getCandidatesIteratively: walks light DOM, slots, and shadow DOM; supports undisclosed (closed) shadows via the getShadowRoot option. When a closed shadow is indicated (function returns true), the code treats the host as a scope and approximates contents for sorting.
- Visibility and display
  - isHidden(node, { displayCheck, getShadowRoot }) implements visibility heuristics:
    - 'full' (default): requires attachment to the main document and a non-empty client rect; respects undisclosed shadow fallback with a non-zero-area test.
    - 'legacy-full': same as 'full' but treats detached nodes as visible (legacy behavior).
    - 'non-zero-area': considers zero client-rect area as hidden (attached or not).
    - 'none': skips display checks entirely (assume visible).
  - isNodeAttached climbs through shadow hosts to determine if a node is effectively in the main document.
- Sorting (tab order)
  - sortByOrder groups positive tabindex elements first (ascending tabindex and source order), then zero-tabindex/default-focus elements in source order. getSortOrderTabIndex normalizes sort behavior for scoped elements (custom elements/slots with implicit -1 tabindex unless explicitly set).
- Semantics and special cases
  - Radio groups: only the checked radio in a group is tabbable; otherwise behavior follows browser norms. CSS.escape is used when available (fallback includes error handling for invalid names).
  - details/summary: summary gets the focus when present; children of closed details are hidden.
  - Disabled fieldsets: descendants are excluded except elements in the first legend of the top-most disabled fieldset.
  - inert support: attribute-based checks are used (JSDom lacks full inert and some selector support); ancestry is inspected to exclude inert descendants.
- Build system
  - Rollup (rollup.config.mjs) produces dist/index.{js,esm.js,umd.js} plus minified variants. Babel envs:
    - BABEL_ENV=es5 for CJS/UMD, BABEL_ENV=esm for ESM, BABEL_ENV=test for Jest/Cypress. The banner preserves license/version.
  - package.json sets main/module/types for consumers and marks sideEffects: false for tree-shaking.
- Testing setup
  - Jest (jest.config.js): environment jsdom, coverage from src/*.js, setup @testing-library/jest-dom via setupTests.js, testMatch test/**/*.test.js.
  - Cypress (cypress.config.js): spec pattern test/e2e/**/*.cy.js with plugins for coverage. CI runs Chrome/Firefox in a Cypress container.
- Types
  - index.d.ts is validated via npm run test:types (tsc index.d.ts). ESLint flat config is present and includes TS support for types where needed.

Repository conventions

- Commit/release flow uses Changesets (npm run release). Prepublish hooks run tests and builds.


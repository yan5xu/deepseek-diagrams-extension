# chatgpt-diagrams

[![main](https://github.com/dwmkerr/chatgpt-diagrams-extension/actions/workflows/main.yaml/badge.svg)](https://github.com/dwmkerr/chatgpt-diagrams-extension/actions/workflows/main.yaml)
[![codecov](https://codecov.io/gh/dwmkerr/chatgpt-diagrams-extension/branch/main/graph/badge.svg?token=6Wj5EwCVqf)](https://codecov.io/gh/dwmkerr/chatgpt-diagrams-extension)

A Chrome browser extension that renders diagrams in the ChatGPT and DeepSeek Chat websites inline:

![Demo Recording of ChatGPT Diagrams Extension](./docs/demo-recording.gif)

Chrome Web Store: [Install ChatGPT Diagrams](https://chrome.google.com/webstore/detail/chatgpt-diagrams/gllophmfnbdpgfnbmbndlihdlcgohcpn)

<!-- vim-markdown-toc GFM -->

- [Quickstart](#quickstart)
- [Developer Guide](#developer-guide)
  - [Developer Commands](#developer-commands)
  - [Code Structure](#code-structure)
  - [Mermaid.js Hacks and Notes](#mermaidjs-hacks-and-notes)
  - [Running the Sample Pages](#running-the-sample-pages)
  - [Manifest](#manifest)
  - [Formatting and Code Quality Rules](#formatting-and-code-quality-rules)
  - [Pre-Commit Hooks](#pre-commit-hooks)
  - [Testing](#testing)
  - [Debugging](#debugging)
  - [Reloading the Extension](#reloading-the-extension)
  - [Verifying Pull Requests](#verifying-pull-requests)
- [Versioning](#versioning)
- [Releasing](#releasing)
  - [Extension Screenshots](#extension-screenshots)
- [Useful Resources](#useful-resources)
- [Task List](#task-list)
  - [Version 0.2 Features](#version-02-features)
  - [Cosmetic Improvements](#cosmetic-improvements)
  - [Performance Improvements / Developer Experience](#performance-improvements--developer-experience)
  - [Options Page](#options-page)
  - [Extension Popup](#extension-popup)

<!-- vim-markdown-toc -->

## Quickstart

Clone, install dependencies and build the extension:

```bash
git clone git@github.com:dwmkerr/chatgpt-diagrams-extension.git
npm install
npm run build
```

Open [Chrome Extensions](chrome://extensions), choose 'Load Unpacked' and select the `./dist` folder. Now open https://chat.openai.com/ or https://chat.deepseek.com/ and enter a prompt such as:

> Use mermaid.js to create a sequence diagram showing how state can be persisted for a chrome extension, and how state can be passed between files.

Press the 'Show Diagram' button in the code sample to render the diagram inline:

![Screenshot of the 'Show Diagram' button and the inline diagram](./docs/demo-show-diagram.png)

## Developer Guide

[Node Version Manager](https://github.com/nvm-sh/nvm) is recommended to ensure that you are using the latest long-term support version of node.

Ensure you are using Node LTS, then install dependencies:

```bash
nvm use --lts
npm install
```

To run in local development mode, which will automatically reload when changes are made, use:

```bash
npm start
```

Load the unpacked extension in your browser from the `./dist` folder.

### Developer Commands

The following commands can be used to help development:

| Command                    | Description                                                                     |
| -------------------------- | ------------------------------------------------------------------------------- |
| `npm start`                | Run in development mode. Updates `./dist` on changes to `./src`.                |
| `npm run build`            | Build the production bundle to `./dist`.                                        |
| `npm run tsc`              | Run the TypeScript compiler, verifies the correctness of the TypeScript code.   |
| -------------------------- | ------------------------------------------------------------------------------- |
| `npm test`                 | Run unit tests, output coverage to `./coverage`.                                |
| `npm run test:watch`       | Run unit tests, coverage only on files that test run on, watch mode.            |
| `npm run test:debug`       | Run unit tests, with the Chrome Inspector, initially 'break', watch mode.       |
| `npm run prettier`         | Check formatting of all files.                                                  |
| `npm run prettier:fix`     | Fix formatting of all files.                                                    |
| `npm run lint`             | Check linting of all files.                                                     |
| `npm run lint:fix`         | Fix linting issues in all files.                                                |
| -------------------------- | ------------------------------------------------------------------------------- |
| `make build`               | Create the release package.                                                     |
| `make test`                | Validate the code, running `tsc` and unit tests.                                |

### Code Structure

The code is structured in such a way that you should be able to immediately see the key files that make up the extension.

At root level are the essential files that make up an extension, all other code is kept in the [`./lib`](./lib) folder.

```
manifest.json  # the extension definition and metadata
content.ts     # the content script, runs on chatgpt browser tabs, renders the diagrams
options.html   # the UI for the options page
options.ts     # the logic for the options page
setup-jest.js  # utility to configure testing environment
lib/           # bulk of the logic for the extension
```

### Mermaid.js Hacks and Notes

When Mermaid.js encounters an error, it attempts to render error content visually in the DOM. It is possible to provide an HTML Element that will be the container for this output. However, it does not appear to be possible to set this container to an element created with the JSDOM virtual DOM.

This means that when Mermaid.js encounters rendering errors, we copy the raw HTML of the error content it writes from the global document object, and then move it into our own container - this works both in the browser and for unit tests.

You can see this approach by searching for the text 'Hack' in the `./src/lib/chatgpt-dom.ts` code. There may be a better way but this managed to solve some issues like https://github.com/dwmkerr/chatgpt-diagrams-extension/issues/20 and others, quickly and without too much complexity in the tests.

### Running the Sample Pages

The following command runs a local webserver, serving the content at [`./samples`](./samples). This makes it easy to test locally, without internet connectivity and without having to regularly log into ChatGPT:

```bash
make serve-samples
```

The sample page is served at `http://localhost:3000`.

### Manifest

Note that the `version` field is omitted from [`manifest.json`](./src/manifest.json). The version in the manifest file is set to the current value in the [`package.json`](package.json) file as part of the build process.

### Formatting and Code Quality Rules

[Prettier](https://prettier.io/) is used for formatting. Pre-commit hooks are used to enforce code style.

[ESLint](https://eslint.org/) is used for code-quality checks and rules.

To understand why both are used, check ["Prettier vs Linters"](https://prettier.io/docs/en/comparison.html).

### Pre-Commit Hooks

[Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) are used to run formatting and code quality checks on staged changes before they are committed.

The configuration for lint-staged is in the [`package.json`](./package.json) file.

### Testing

[Jest](https://jestjs.io/) is used as the testing framework. ChatGPT sample pages are loaded into the environment using [js-dom](https://github.com/jsdom/jsdom) and we then verify that the ChatGPT code elements are identified and processed correctly.

Check the [Developer Commands](#developer-commands) section to see the various test commands that can be run. It is possible to watch tests, run tests in the debugger, and so on.

### Debugging

In development mode, open source maps by navigating to the "Sources > Content Scripts > chatgpt-diagrams" folder. These are inline source maps. You can also use "Command + P" and search for a file such as `content.ts`.

In production mode, source maps are generated as standalone files in the `./dist` folder.

### Reloading the Extension

There is no 'live reload' on file changes. The fastest way to reload is to run locally with `npm start`. Webpack will rebuild the extension on file changes. Then just press the "Refresh" button in the `chrome://extensions` page and reload the site you are debugging.

### Verifying Pull Requests

To verify that the code builds, the tests pass and the release package can be created run the commands below:

```bash
make build
make test
make release
```

These commands will be executed for pull requests.

## Versioning

The version of the extension is defined in the [`package.json`](./package.json) file.

Releasing in managed via [Release Please](https://github.com/googleapis/release-please) in the [`main.yaml`](./.github/workflows/main.yaml) workflow file.

If you need to manually trigger a release, run:

```bash
git commit --allow-empty -m "chore: release 2.0.0" -m "Release-As: 2.0.0"
```

## Releasing

When uploading a new version, follow the steps below.

### Extension Screenshots

If needed, update the screenshots. Screenshots should be 1280x800 pixels, set this in the Developer Tools (which can also be used to capture the screenshot to the Downloads folder.

Currently screenshots do not include a browser frame.

Screenshots do not have the ChatGPT sidebar, avoiding distractions.

Screenshots after the first one do not have the code sample, avoiding distractions.

Open Developer Tools, use the 'device size' button to set the responsive screen size, adjust the size to 1280x800, delete the sidebar from the nodes view, press Command+Shift+P and select 'Capture Screenshot'.

Prompts for screenshots so far are:

1. Render a flowchart showing how a browser makes a web request and a server responds. Use mermaid.js.
2. Create a UML class diagram showing relationships for the data model for a simple food delivery database. Use mermaid.js.
3. Create an architecture diagram that would show the key components in an instant messaging application, use mermaidjs.
4. Create a sequence diagram showing how retry logic with retry queues is typically implemented when using Apache Kafka, use mermaidjs for the diagram

Resize screenshots with:

```bash
brew install imagemagick

new_width=1280
for input in ./docs/screenshots/*.png; do
    [[ -f "$input" ]] || continue
    output="${input/\.png/-${new_width}.png}"
    echo "Convert: ${input} -> ${output}"
    convert "${input}" -resize "${new_width}x" "${output}"
done
```

## Useful Resources

https://joshisa.ninja/2021/10/22/browser-extension-with-rollup-omnibox-chatter.html

## Task List

A quick-and-dirty list of improvements and next steps:

- [ ] bug: button is inserted multiple times while chatgpt is writing (add the class to the dom element _before_ start processing? note that the code language text (e.g. 'mermaid') is overwritten
- [x] build: test to ensure that mermaid doesn't add error content - or if it does that we at least control it better.
- [x] improvement: render DOM using this method: https://crxjs.dev/vite-plugin/getting-started/vanilla-js/content-script-hmr#vite-hmr-for-javascript
- [x] build: slow bundling, debugging fails: https://github.com/dwmkerr/chatgpt-diagrams-extension/issues/10
- [x] bug: debugger doesn't work on chrome, seems to be a sourcemaps issue (raised as https://github.com/crxjs/chrome-extension-tools/issues/691)
- [x] build: basic test for DOM manipulation
- [x] build: coverage badge
- [x] build: eslint for code quality rules
- [x] build: pipeline to create package
- [x] build: prettier for formatting
- [x] build: release please
- [x] build: resolve test issues https://github.com/dwmkerr/chatgpt-diagrams-extension/issues/6
- [x] build: tests
- [x] create a much more representative sample page, use the examples from the description, no sidebar, use as a fixture for tests, update queries to use selectors to find elements.
- [x] docs: better icon - just a simple 50/50 split of the two logos down the middle, or diagonal
- [x] docs: table of local commands
- [x] refactor: change xpath queries to query selectors, add tests, fixtures
- [x] testing: better sample that doesn't have sidebar and includes more representative group of diagrams
- [x] build: commitlint

### Version 0.2 Features

- [ ] bug: tab container is not initially hidden
- [ ] refactor: hide 'options' page
- [ ] feat: 'copy' button for diagrams
- [ ] feat: Lightbox for diagrams
- [ ] feat: more descriptive error messages and improved error presentation
- [ ] build: auto deploy to chrome webstore: https://jam.dev/blog/automating-chrome-extension-publishing/
- [ ] feat: share feedback link (GH issue, or Chrome Web Store, grab some content from the DOM?)
- [ ] feat: hints on the error screen (e.g. "Did you include "use mermaid.js" in the text")
- [ ] chore: issue template (prompt text, code output, screenshot)

### Cosmetic Improvements

- [ ] improvement: icon for 'show diagram' button

### Performance Improvements / Developer Experience

- [ ] consider webpack dev server to serve sample page in local dev mode
- [ ] build: Create script to open a new chrome window, with the appropriate command line flags to load the dist unpacked
- [ ] feat: start/stop/pause buttons
- [ ] improvement: use the mutation observer (see ./src/observe.js) to watch for new code samples, rather than scanning the DOM on a timer

### Options Page

- [ ] feat: options based, based on popup code extracted from options script
- [ ] check options UI works in extension screen as well as inline in tab
- [ ] feat: edit xpath queries via options page
- [ ] refactor: MD5 diagram text, use as a key for diagrams in a background page so that we don't recreate each time
- [ ] refactor: move rendering logic to background page (so error content is hidden in tabs)

### Extension Popup

- [ ] feat: counter for extension icon that shows number of diagrams processed

### Other

- [] fix: review the fix to the mermaidjs issue and see if it helps with bundling/packaging etc https://github.com/parcel-bundler/parcel/issues/8935#event-14676821933

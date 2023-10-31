# Voici Changelog

## 0.5.0 - Highlights

Below are the major highlights in Voici 0.5.0

- Voici frontend is updated to JupyterLab 4, Voila 0.5.0 components.
- Tree page is now a Lab remix app.
- New argument `--classic-tree` to use the jinja2-based tree page instead of the Lab-based one.
- Voici CLI can be used in the same way as Voila, e.g:
  - `voici .`
  - `voici notebook.ipynb`
- Voici now supports the [`files` directory](https://jupyterlite.readthedocs.io/en/latest/howto/content/files.html#content-with-the-cli) to copy additional files to the Voici deployment.
- Latex expressions are rendered by `@jupyterlab/mathjax-extension` instead of relying on MathJax 2 coming from CDN.

<!-- <START NEW CHANGELOG ENTRY> -->

## 0.5.0rc0

([Full Changelog](https://github.com/voila-dashboards/voici/compare/v0.5.0a0...dc6c1d041083215e429ab0853d6e5d07b76756fa))

### Enhancements made

- Wait for service worker on start up [#97](https://github.com/voila-dashboards/voici/pull/97) ([@trungleduc](https://github.com/trungleduc))
- Bump jupyterlite [#96](https://github.com/voila-dashboards/voici/pull/96) ([@trungleduc](https://github.com/trungleduc))

### Maintenance and upkeep improvements

- Bump jupyterlite [#96](https://github.com/voila-dashboards/voici/pull/96) ([@trungleduc](https://github.com/trungleduc))
- Enable Playwright trace [#95](https://github.com/voila-dashboards/voici/pull/95) ([@jtpio](https://github.com/jtpio))

### Documentation improvements

- Wait for service worker on start up [#97](https://github.com/voila-dashboards/voici/pull/97) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-09-29&to=2023-10-31&type=c))

[@github-actions](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Agithub-actions+updated%3A2023-09-29..2023-10-31&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Ajtpio+updated%3A2023-09-29..2023-10-31&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Atrungleduc+updated%3A2023-09-29..2023-10-31&type=Issues)

<!-- <END NEW CHANGELOG ENTRY> -->

## 0.5.0a0

([Full Changelog](https://github.com/voila-dashboards/voici/compare/@voila-dashboards/voici@0.4.6...8573f886cc0235dceb1616e942a5873fe8d19289))

### Enhancements made

- Voila 0.5 migration [#89](https://github.com/voila-dashboards/voici/pull/89) ([@trungleduc](https://github.com/trungleduc))

### Maintenance and upkeep improvements

- Update galata bot [#93](https://github.com/voila-dashboards/voici/pull/93) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-08-28&to=2023-09-29&type=c))

[@github-actions](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Agithub-actions+updated%3A2023-08-28..2023-09-29&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Atrungleduc+updated%3A2023-08-28..2023-09-29&type=Issues)

## 0.4.6

([Full Changelog](https://github.com/voila-dashboards/voici/compare/@voila-dashboards/voici@0.4.5...0377a3b3068a315be6274b638b8f00e630249485))

### Enhancements made

- Update xeus-python [#82](https://github.com/voila-dashboards/voici/pull/82) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Update jupyterlite packages [#90](https://github.com/voila-dashboards/voici/pull/90) ([@martinRenou](https://github.com/martinRenou))

### Documentation improvements

- Update the demo to a nicer one [#87](https://github.com/voila-dashboards/voici/pull/87) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-07-20&to=2023-08-28&type=c))

[@github-actions](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Agithub-actions+updated%3A2023-07-20..2023-08-28&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3AmartinRenou+updated%3A2023-07-20..2023-08-28&type=Issues)

## 0.4.5

([Full Changelog](https://github.com/voila-dashboards/voici/compare/@voila-dashboards/voici@0.4.4...429caa514b916cfd68786098633e7612517603ed))

### Bugs fixed

- Pin hard Voila [#85](https://github.com/voila-dashboards/voici/pull/85) ([@martinRenou](https://github.com/martinRenou))

### Documentation improvements

- Fix launch lite link in the documentation [#81](https://github.com/voila-dashboards/voici/pull/81) ([@jtpio](https://github.com/jtpio))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-05-04&to=2023-07-20&type=c))

[@github-actions](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Agithub-actions+updated%3A2023-05-04..2023-07-20&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Ajtpio+updated%3A2023-05-04..2023-07-20&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3AmartinRenou+updated%3A2023-05-04..2023-07-20&type=Issues)

## 0.4.4

([Full Changelog](https://github.com/voila-dashboards/voici/compare/v0.4.3...a8c9f8559318c28938f1b1a75c967a66b28e1f8f))

### Enhancements made

- Import all lumino packages [#77](https://github.com/voila-dashboards/voici/pull/77) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-05-03&to=2023-05-04&type=c))

[@trungleduc](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Atrungleduc+updated%3A2023-05-03..2023-05-04&type=Issues)

## 0.4.3

([Full Changelog](https://github.com/voila-dashboards/voici/compare/@voila-dashboards/voici@0.4.2...3e2048cfb78a2a340f3ef4e8fab179060168deb8))

### Bugs fixed

- Hotfix: Fix resize event not being triggered and some CSS issues [#75](https://github.com/voila-dashboards/voici/pull/75) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-05-03&to=2023-05-03&type=c))

[@github-actions](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Agithub-actions+updated%3A2023-05-03..2023-05-03&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3AmartinRenou+updated%3A2023-05-03..2023-05-03&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Atrungleduc+updated%3A2023-05-03..2023-05-03&type=Issues)

## 0.4.2

([Full Changelog](https://github.com/voila-dashboards/voici/compare/@voila-dashboards/voici@0.4.1...3af43dac56a9f9e26d6a2161e0b0cdbd1573949a))

### Bugs fixed

- Fix outputs DOM structure [#74](https://github.com/voila-dashboards/voici/pull/74) ([@martinRenou](https://github.com/martinRenou))
- Remove custom styling [#71](https://github.com/voila-dashboards/voici/pull/71) ([@martinRenou](https://github.com/martinRenou))
- Fix version printing [#72](https://github.com/voila-dashboards/voici/pull/72) ([@martinRenou](https://github.com/martinRenou))

### Documentation improvements

- Update WIP comment [#73](https://github.com/voila-dashboards/voici/pull/73) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-04-21&to=2023-05-03&type=c))

[@github-actions](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Agithub-actions+updated%3A2023-04-21..2023-05-03&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3AmartinRenou+updated%3A2023-04-21..2023-05-03&type=Issues)

## 0.4.1

([Full Changelog](https://github.com/voila-dashboards/voici/compare/@voila-dashboards/voici@0.4.0...417746aff5b4f3faa7b254e8c516a46e59a67155))

### Enhancements made

- Add missing `react-dom` module to Webpack shared scope [#67](https://github.com/voila-dashboards/voici/pull/67) ([@trungleduc](https://github.com/trungleduc))

### Maintenance and upkeep improvements

- Remove old logic for installing piplite packages [#68](https://github.com/voila-dashboards/voici/pull/68) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-04-18&to=2023-04-21&type=c))

[@github-actions](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Agithub-actions+updated%3A2023-04-18..2023-04-21&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3AmartinRenou+updated%3A2023-04-18..2023-04-21&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Atrungleduc+updated%3A2023-04-18..2023-04-21&type=Issues)

## 0.4.0

([Full Changelog](https://github.com/voila-dashboards/voici/compare/v0.3.3...3fb43ef1d143a3e78939e7e35d293cda01d58867))

### Enhancements made

- Update CLI [#65](https://github.com/voila-dashboards/voici/pull/65) ([@trungleduc](https://github.com/trungleduc))

### Documentation improvements

- Update readme [#66](https://github.com/voila-dashboards/voici/pull/66) ([@trungleduc](https://github.com/trungleduc))
- Add badges to the README [#64](https://github.com/voila-dashboards/voici/pull/64) ([@jtpio](https://github.com/jtpio))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-04-13&to=2023-04-18&type=c))

[@github-actions](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Agithub-actions+updated%3A2023-04-13..2023-04-18&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Ajtpio+updated%3A2023-04-13..2023-04-18&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3AmartinRenou+updated%3A2023-04-13..2023-04-18&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Atrungleduc+updated%3A2023-04-13..2023-04-18&type=Issues)

## 0.3.3

([Full Changelog](https://github.com/voila-dashboards/voici/compare/@voila-dashboards/voici@0.3.2...1e5b08a398d89d69bcdd746ec47fb09be5b8f0df))

### Enhancements made

- Fix handling of the base url to enable the Service Worker [#59](https://github.com/voila-dashboards/voici/pull/59) ([@jtpio](https://github.com/jtpio))

### Bugs fixed

- Fetch theme name from the body data attribute [#63](https://github.com/voila-dashboards/voici/pull/63) ([@jtpio](https://github.com/jtpio))
- Fix extra network theme requests [#62](https://github.com/voila-dashboards/voici/pull/62) ([@jtpio](https://github.com/jtpio))

### Maintenance and upkeep improvements

- Add workflow to try Voici on ReadTheDocs [#61](https://github.com/voila-dashboards/voici/pull/61) ([@jtpio](https://github.com/jtpio))
- Use Playwright `webServer` option [#58](https://github.com/voila-dashboards/voici/pull/58) ([@jtpio](https://github.com/jtpio))

### Documentation improvements

- Update the documentation [#60](https://github.com/voila-dashboards/voici/pull/60) ([@jtpio](https://github.com/jtpio))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-04-12&to=2023-04-13&type=c))

[@jtpio](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Ajtpio+updated%3A2023-04-12..2023-04-13&type=Issues)

## 0.3.2

([Full Changelog](https://github.com/voila-dashboards/voici/compare/@voila-dashboards/voici@0.3.1...db3b22a3d267337ee8dbded091948ac574588c66))

### Enhancements made

- Create `__main__.py` [#56](https://github.com/voila-dashboards/voici/pull/56) ([@jtpio](https://github.com/jtpio))

### Maintenance and upkeep improvements

- Troubleshoot CI [#55](https://github.com/voila-dashboards/voici/pull/55) ([@jtpio](https://github.com/jtpio))
- Update to `jupyterlite-core>=0.1.0,<0.2.0` [#50](https://github.com/voila-dashboards/voici/pull/50) ([@jtpio](https://github.com/jtpio))
- Use `ruff` instead of `flake8`, run `black` [#49](https://github.com/voila-dashboards/voici/pull/49) ([@jtpio](https://github.com/jtpio))

### Documentation improvements

- Create CONTRIBUTING.md [#52](https://github.com/voila-dashboards/voici/pull/52) ([@jtpio](https://github.com/jtpio))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-03-23&to=2023-04-12&type=c))

[@jtpio](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Ajtpio+updated%3A2023-03-23..2023-04-12&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3AmartinRenou+updated%3A2023-03-23..2023-04-12&type=Issues)

## 0.3.1

([Full Changelog](https://github.com/voila-dashboards/voici/compare/v0.3.0...9ff7f63d4c31d3562a0cfb8ba8e714c4bb7cce20))

### Maintenance and upkeep improvements

- Simplify the script for bumping versions [#47](https://github.com/voila-dashboards/voici/pull/47) ([@jtpio](https://github.com/jtpio))
- Remove the `reset_stable.sh` script [#45](https://github.com/voila-dashboards/voici/pull/45) ([@jtpio](https://github.com/jtpio))
- Update to Voila 0.5.0a3 [#44](https://github.com/voila-dashboards/voici/pull/44) ([@jtpio](https://github.com/jtpio))
- Update dev dependencies, TypeScript 5 [#42](https://github.com/voila-dashboards/voici/pull/42) ([@jtpio](https://github.com/jtpio))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-03-22&to=2023-03-23&type=c))

[@jtpio](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Ajtpio+updated%3A2023-03-22..2023-03-23&type=Issues)

## 0.3.0

([Full Changelog](https://github.com/voila-dashboards/voici/compare/v0.2.0...49c441b4953d12135f84bee5f54869526ddfbef3))

### Enhancements made

- Add Voila config aliases [#33](https://github.com/voila-dashboards/voici/pull/33) ([@martinRenou](https://github.com/martinRenou))

### Bugs fixed

- Fix custom template support [#34](https://github.com/voila-dashboards/voici/pull/34) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Update to `jupyterlite-core>=0.1.0b20` [#41](https://github.com/voila-dashboards/voici/pull/41) ([@jtpio](https://github.com/jtpio))
- Add `yarn watch` command to voici package [#39](https://github.com/voila-dashboards/voici/pull/39) ([@trungleduc](https://github.com/trungleduc))
- Expose the widget manager promise from the `VoiciApp` [#38](https://github.com/voila-dashboards/voici/pull/38) ([@jtpio](https://github.com/jtpio))
- Depend on `jupyterlite-core` [#37](https://github.com/voila-dashboards/voici/pull/37) ([@jtpio](https://github.com/jtpio))
- Test custom template in ui-tests [#35](https://github.com/voila-dashboards/voici/pull/35) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-03-06&to=2023-03-22&type=c))

[@jtpio](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Ajtpio+updated%3A2023-03-06..2023-03-22&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3AmartinRenou+updated%3A2023-03-06..2023-03-22&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Atrungleduc+updated%3A2023-03-06..2023-03-22&type=Issues)

## 0.2.0

([Full Changelog](https://github.com/voila-dashboards/voici/compare/@voila-dashboards/voici@0.2.1...96e793cfde26e39affbb9ea33cbc0223dd296829))

### Enhancements made

- Require latest voila [#31](https://github.com/voila-dashboards/voici/pull/31) ([@martinRenou](https://github.com/martinRenou))

### Documentation improvements

- Update README instructions [#32](https://github.com/voila-dashboards/voici/pull/32) ([@martinRenou](https://github.com/martinRenou))
- Minor edits to the README [#30](https://github.com/voila-dashboards/voici/pull/30) ([@jtpio](https://github.com/jtpio))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-03-03&to=2023-03-06&type=c))

[@jtpio](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Ajtpio+updated%3A2023-03-03..2023-03-06&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3AmartinRenou+updated%3A2023-03-03..2023-03-06&type=Issues)

## 0.1.2

([Full Changelog](https://github.com/voila-dashboards/voici/compare/@voila-dashboards/voici@0.2.0...7b047500ec3c3aaa81b44fedc6946fb546d663cc))

### Bugs fixed

- Compute base_url as relative path [#27](https://github.com/voila-dashboards/voici/pull/27) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- UI-tests: test breadcrumbs click [#26](https://github.com/voila-dashboards/voici/pull/26) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-03-03&to=2023-03-03&type=c))

[@martinRenou](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3AmartinRenou+updated%3A2023-03-03..2023-03-03&type=Issues)

## 0.1.1

([Full Changelog](https://github.com/voila-dashboards/voici/compare/@voila-dashboards/voici@0.2.0-alpha.0...e829aa589743aa75d0e9be3902bf87a70a08ad2c))

### Bugs fixed

- Fix `voici build --contents notebooks/ --output-dir dist` use case [#25](https://github.com/voila-dashboards/voici/pull/25) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- More ui-tests [#23](https://github.com/voila-dashboards/voici/pull/23) ([@martinRenou](https://github.com/martinRenou))

### Documentation improvements

- Uncomment the "Getting Started" section in the README [#22](https://github.com/voila-dashboards/voici/pull/22) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-03-02&to=2023-03-03&type=c))

[@martinRenou](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3AmartinRenou+updated%3A2023-03-02..2023-03-03&type=Issues)

## 0.1.0

([Full Changelog](https://github.com/voila-dashboards/voici/compare/49c13dd07e3f37c5c5090e3bfa1139c392487530...5c82a5e40e9c2ca88001d8af49ba2c38be7bf4af))

### Enhancements made

- Turn into a JupyterLite Addon + support any kernel [#12](https://github.com/voila-dashboards/voici/pull/12) ([@martinRenou](https://github.com/martinRenou))

### Bugs fixed

- Playwright bot: Setup the micromamba env properly [#16](https://github.com/voila-dashboards/voici/pull/16) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Debump versions so that the releaser can make 0.1.0 [#21](https://github.com/voila-dashboards/voici/pull/21) ([@martinRenou](https://github.com/martinRenou))
- Add releaser workflows to the repo [#15](https://github.com/voila-dashboards/voici/pull/15) ([@jtpio](https://github.com/jtpio))
- Pin on `yarn=1` in `environment.yml` for now [#14](https://github.com/voila-dashboards/voici/pull/14) ([@jtpio](https://github.com/jtpio))
- Add `publishConfig` to `package.json` [#13](https://github.com/voila-dashboards/voici/pull/13) ([@jtpio](https://github.com/jtpio))
- Simple UI tests [#10](https://github.com/voila-dashboards/voici/pull/10) ([@martinRenou](https://github.com/martinRenou))
- Update Github action workflows [#8](https://github.com/voila-dashboards/voici/pull/8) ([@martinRenou](https://github.com/martinRenou))

### Documentation improvements

- Add README [#18](https://github.com/voila-dashboards/voici/pull/18) ([@martinRenou](https://github.com/martinRenou))

### Other merged PRs

- Add bot for updating Playwright references [#9](https://github.com/voila-dashboards/voici/pull/9) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/voila-dashboards/voici/graphs/contributors?from=2023-02-20&to=2023-03-02&type=c))

[@jtpio](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Ajtpio+updated%3A2023-02-20..2023-03-02&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3AmartinRenou+updated%3A2023-02-20..2023-03-02&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Avoila-dashboards%2Fvoici+involves%3Atrungleduc+updated%3A2023-02-20..2023-03-02&type=Issues)

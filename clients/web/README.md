# project-oakwood web client

## CSS

Requires Node12 or later. Run `nvm use` in the root directory to switch.

Uses [CRACO](https://github.com/gsoft-inc/craco#craco) to override Create React App's configuration to use PostCSS as a preprocessor. Options for this can be found in `craco.config.js`.

Uses [TailwindCSS](https://tailwindcss.com) for styling which has a bunch of built-in classes and can be fully customized. It requires the build scripts to be overridden to use `craco` instead of `npm`. Imported in `src/index.css` and initiazlied in `src/index.js`.
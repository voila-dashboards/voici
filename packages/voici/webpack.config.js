// Copyright (c) Jupyter Development Team.
// Copyright (c) Voila Development Team.
// Distributed under the terms of the Modified BSD License.

const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge').default;
const { ModuleFederationPlugin } = webpack.container;
const Build = require('@jupyterlab/builder').Build;
const baseConfig = require('@jupyterlab/builder/lib/webpack.config.base');

const data = require('./package.json');

/**
 * A helper for filtering deprecated webpack loaders, to be replaced with assets
 */
function filterDeprecatedRule(rule) {
  if (typeof rule.use === 'string' && rule.use.match(/^(file|url)-loader/)) {
    return false;
  }
  return true;
}

baseConfig.module.rules = [
  {
    test: /\.json$/,
    use: ['json-loader'],
    type: 'javascript/auto',
  },
  ...baseConfig.module.rules.filter(filterDeprecatedRule),
];

const names = Object.keys(data.dependencies).filter((name) => {
  const packageData = require(path.join(name, 'package.json'));
  return packageData.jupyterlab !== undefined;
});

// Ensure a clear build directory.
const buildDir = path.resolve(__dirname, 'build');
if (fs.existsSync(buildDir)) {
  fs.removeSync(buildDir);
}
fs.ensureDirSync(buildDir);

// Copy files to the build directory
const libDir = path.resolve(__dirname, 'lib');

fs.copySync(libDir, buildDir);

const distRoot = path.resolve(
  __dirname,
  '..',
  '..',
  'voici',
  'static',
  'build'
);

const extras = Build.ensureAssets({
  packageNames: names,
  output: buildDir,
  staticOutput: path.resolve(distRoot),
});

// Make a bootstrap entrypoint
const entryPoint = path.join(buildDir, 'bootstrap.js');
const treeEntryPoint = path.join(buildDir, 'treebootstrap.js');

if (process.env.NODE_ENV === 'production') {
  baseConfig.mode = 'production';
}

module.exports = [
  merge(baseConfig, {
    mode: 'development',
    entry: {
      voici: ['./publicpath.js', './' + path.relative(__dirname, entryPoint)],
      treepage: [
        './publicpath.js',
        './' + path.relative(__dirname, treeEntryPoint),
      ],
    },
    output: {
      path: distRoot,
      library: {
        type: 'var',
        name: ['_JUPYTERLAB', 'CORE_OUTPUT'],
      },
      filename: '[name].js',
    },
    module: {
      rules: [
        // just keep the woff2 fonts from fontawesome
        {
          test: /fontawesome-free.*\.(svg|eot|ttf|woff)$/,
          loader: 'ignore-loader',
        },
        {
          test: /\.(jpe?g|png|gif|ico|eot|ttf|map|woff2?)(\?v=\d+\.\d+\.\d+)?$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        // Needed for Blueprint. See https://github.com/palantir/blueprint/issues/4393
        'process.env': '{}',
        // Needed for various packages using cwd(), like the path polyfill
        process: { cwd: () => '/' },
      }),
      new ModuleFederationPlugin({
        library: {
          type: 'var',
          name: ['_JUPYTERLAB', 'CORE_LIBRARY_FEDERATION'],
        },
        name: 'CORE_FEDERATION',
        shared: {
          ...data.dependencies,
        },
      }),
    ],
  }),
].concat(extras);

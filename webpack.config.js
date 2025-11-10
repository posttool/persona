const path = require('path');

const rootConfig = {
  mode: 'development',
  optimization: {
    usedExports: true, 
  },
  devtool: 'eval-source-map'
};

const appConfig = {
  ...rootConfig,
  entry: './websrc/main.js',
  output: {
    filename: '_main.js',
    path: path.resolve(__dirname, 'public/src'),
  },
};

// const serviceWorkerConfig = {
//   ...rootConfig,
//   entry: './src/firebase-messaging-sw.js',
//   // TODO(jhuleatt): Remove this once https://github.com/firebase/firebase-js-sdk/issues/5314 is resolved
//   module: {
//     rules: [
//       {
//         test: /\.m?js/,
//         resolve: {
//           fullySpecified: false,
//         },
//       },
//     ],
//   },
//   output: {
//     filename: 'firebase-messaging-sw.js',
//     path: path.resolve(__dirname, 'public'),
//   },
// };

module.exports = [appConfig]; //, serviceWorkerConfig

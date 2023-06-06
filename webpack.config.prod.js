const { merge } = require("webpack-merge")

global.INSPECTOR = false;
global.CONTROLS = true;

const common = require("./webpack.config.common")

module.exports = merge(common, {
  mode: "production",
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
})

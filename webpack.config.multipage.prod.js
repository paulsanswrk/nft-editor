const {merge} = require("webpack-merge")

global.INSPECTOR = false;
global.CONTROLS = true;

const common = require("./webpack.config.common")

module.exports = merge(common, {
    entry: "./src/MultiPage.ts",
    mode: "production",
    stats: {warnings: false},
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
})

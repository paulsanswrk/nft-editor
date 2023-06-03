const {merge} = require("webpack-merge")

const common = require("../../webpack.config.dev")
const path = require("path");

module.exports = merge(common, {
    entry: "./src/bot_6_rot/SpiralViewBot6.ts",
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        compress: true,
        port: 9001,
    },
})



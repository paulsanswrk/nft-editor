const {merge} = require("webpack-merge")

const common = require("../../webpack.config.dev")
const path = require("path");

module.exports = merge(common, {
    entry: "./src/bot_6_rot/init.ts",
    devServer: {
        port: 9006,
    },
})



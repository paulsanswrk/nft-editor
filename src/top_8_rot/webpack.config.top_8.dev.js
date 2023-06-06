const {merge} = require("webpack-merge")

const common = require("../../webpack.config.dev")

module.exports = merge(common, {
    entry: "./src/top_8_rot/init.ts",
    devServer: {
        port: 9008,
    },
})



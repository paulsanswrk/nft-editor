const {merge} = require("webpack-merge")

const common = require("../../webpack.config.dev")

module.exports = merge(common, {
    entry: "./src/top_8_rot/SpiralViewTop8.ts",
})



const {merge} = require("webpack-merge")

const common = require("../../webpack.config.prod")

module.exports = merge(common, {
    entry: "./src/top_8_rot/init.ts",
})



const {merge} = require("webpack-merge")

const common = require("../../webpack.config.dev")
const path = require("path");
const fs = require("fs");

module.exports = merge(common, {
    entry: "./src/plain/plain.ts",
    devServer: {
        https: {
            key: fs.readFileSync(path.join(__dirname, '../../cert/localhost-key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '../../cert/localhost.pem')),
        },
        port: 9009,
    },
})



const {merge} = require("webpack-merge")

global.INSPECTOR = false;
global.CONTROLS = false;

const common = require("./webpack.config.common")

var WebpackObfuscator = require('webpack-obfuscator');
const {join} = require("path");

module.exports = merge(common, {
    mode: "production",
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|mjs)$/,
                exclude: [
                    join(__dirname, '/node_modules/'),
                ],
                enforce: 'post',
                use: {
                    loader: WebpackObfuscator.loader,
                    options: {
                        reservedStrings: ['\s*'],
                        rotateStringArray: true
                    }
                }
            }
        ],
    },
    plugins: [
        new WebpackObfuscator({rotateStringArray: true, reservedStrings: ['\s*']}, [])
    ],
})

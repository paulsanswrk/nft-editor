const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

global.__basedir = __dirname;

module.exports = {
    entry: "./src/bot_6_rot/SpiralViewBot6.ts",
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: '[name].[contenthash].js',
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".glsl"],
    },
    module: {
        rules: [
            {test: /\.tsx?$/, loader: "ts-loader"},
            {
                test: /\.tsx?$/, loader: "ifdef-loader", options: {
                    CONTROLS: global.CONTROLS,
                    INSPECTOR: global.INSPECTOR,
                }
            }
            // { test: /\.glsl$/, loader: "webpack-glsl-loader" },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: "public"},
            ],
        }),
        new HtmlWebpackPlugin({
            template: "!!handlebars-loader!src/index.hbs",
        }),
        // new BundleAnalyzerPlugin(),
    ],
}

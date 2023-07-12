const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const {VueLoaderPlugin} = require("vue-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

global.__basedir = __dirname;

module.exports = {
    mode: "development",
    entry: "./src/full_control/main.ts",
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
            },
            {
                test: /\.vue$/i,
                exclude: /(node_modules)/,
                use: {
                    loader: "vue-loader",
                },
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: 'style-loader'
                },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            }
            // { test: /\.glsl$/, loader: "webpack-glsl-loader" },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin(),
        /*new CopyPlugin({
            patterns: [
                {from: "public"},
            ],
        }),*/
        new HtmlWebpackPlugin({
            template: "!!handlebars-loader!src/full_control/index.hbs",
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        port: 9020,
    }
}

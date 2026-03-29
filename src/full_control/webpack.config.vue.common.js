const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const {VueLoaderPlugin} = require("vue-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

global.__basedir = __dirname;

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/full_control/main.ts",
    output: {
        path: path.resolve(__dirname, "../../dist"),
        filename: '[name].[contenthash].js',
        clean: true,
    },
    optimization: {
        splitChunks: {chunks: "all"}
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.vue$/i,
                exclude: /(node_modules)/,
                use: {
                    loader: "vue-loader",
                },
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {appendTsSuffixTo: [/\.vue$/]}
            },
            {
                test: /\.tsx?$/, loader: "ifdef-loader", options: {
                    CONTROLS: global.CONTROLS,
                    INSPECTOR: global.INSPECTOR,
                }
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
        // new BundleAnalyzerPlugin(),
        new NodePolyfillPlugin()
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        port: 9020,
    }
}

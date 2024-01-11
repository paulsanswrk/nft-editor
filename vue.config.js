const {resolve} = require("path");

module.exports = {
    configureWebpack: {
        resolve: {
            alias: {
                vue$: resolve('./node_modules/vue/dist/vue.runtime.esm.js'),
            },
        },
    },
    chainWebpack: config => {
        config.module
            .rule('vue')
            .use('vue-loader')
            .tap(options => {
                // modify the options...
                return options
            })

        config.resolve.symlinks(false)
        config.resolve.alias.set('vue', resolve('./node_modules/vue'))
    }
}


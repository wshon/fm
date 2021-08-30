module.exports = {
    transpileDependencies: [
        'vuetify'
    ],
    chainWebpack: config => {
        config.plugin('html')
            .tap(args => {
                args[0].title = "FileManager";
                return args;
            })
        config.optimization
            .minimizer('terser')
            .tap(args => {
                Object.assign(args[0].terserOptions.compress, { // 生产模式 console.log 去除
                    // drop_console: true,
                    pure_funcs: [
                        'console.debug',
                    ]
                })
                return args
            })
    }
}

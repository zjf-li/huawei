const path = require('path')
const glob = require('glob');
const webpack = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');


const SetMap = () => {
    const entry = {};
    const htmlWebpackPlugins = [];
    const entryFiles = glob.sync(path.join(__dirname, './src/pages/*/index.js'));
    const urlLinks = Object.keys(entryFiles).map(index => {
        const entryFile = entryFiles[index];
        const match = entryFile.match(/src\/pages\/(.*)\/index\.js/);
        const pageName = match && match[1];
        entry[pageName] = entryFile;

        htmlWebpackPlugins.push(new HtmlWebpackPlugin({
            template: path.join(__dirname, `./src/pages/${pageName}/index.html`),
            filename: `${pageName}.html`,
            chunks: [pageName],
            inject: 'body',
            minify: {
                html5: true,
                collapseWhitespace: true,
                preserveLineBreaks: false,
                minifyCSS: true,
                minifyJS: true,
                removeComments: false
            }
        }))
        return `${pageName}: http://localhost:8080/${pageName}.html`
    })

    return {entry, htmlWebpackPlugins, urlLinks}

}



const {entry, htmlWebpackPlugins, urlLinks} = SetMap()

module.exports = {
    entry: entry,
    mode: 'development',
    watch: true,
    watchOptions: {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 1000
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader',{
                    loader: 'style-resources-loader',
                    options: {
                        patterns: [ // ??????????????????????????????????????????
                            path.resolve(__dirname, './src/asset/global.less')
                        ],
                        injector: 'append' // ???????????????????????????????????????????????????
                    }
                }]
            },
            {
                test: /.(png|jpg|git|jpeg)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10240
                    }
                }
            }, {
                test: /.(htm|html)$/,
                use: 'raw-loader'
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(), new CleanWebpackPlugin(), new FriendlyErrorsWebpackPlugin(
            { // ?????????????????????
                compilationSuccessInfo: {
                    messages: [`?????????????????????????????? here: http://localhost:8080`].concat(urlLinks)
                }
            }
        ),
        new webpack.ProvidePlugin({
            _: 'lodash',
            $:path.join(__dirname,'./src/asset/js/jquery.js')
      })
    ].concat(htmlWebpackPlugins),

    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        hot: true,
        stats: 'errors-only',
        host: 'localhost',
        port: 8080,
    },
    devtool: 'source-map',
    cache: true

}

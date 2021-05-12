const path = require('path')
const glob = require('glob');
const webpack = require('webpack');
const { CleanWebpackPlugin }= require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const SetMap = () => {
    const entry = {};
    const htmlWebpackPlugin = [];
    const entryFiles = glob.sync(path.join(__dirname, './src/pages/*/index.js'));
   const urlLinks = Object.keys(entryFiles).map(index => {
        const entryFile = entryFiles[index];
        const match = entryFile.match(/src\/pages\/(.*)\/index\.js/);
        const pageName = match && match[1];
        entry[pageName] = entryFile;

        htmlWebpackPlugin.push(
            new HtmlWebpackPlugin({
                template: path.join(__dirname, `src//pages/${pageName}/index.html`),
                filename: `${pageName}.html`,
                chunks: [pageName],
                inject: true,
                minify: {
                    html5: true,
                    collapseWhitespace: true,
                    preserveLineBreaks: false,
                    minifyCSS: true,
                    minifyJS: true,
                    removeComments: false
                }
            })
        )
        return `${pageName}: http://localhost:8080/${pageName}.html`
    })

    return {entry, htmlWebpackPlugin,urlLinks}

}

const {entry, htmlWebpackPlugin,urlLinks} = SetMap()

module.exports = {
    entry: entry,
    mode: 'development',
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
            }, {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            }, {
                test: /.(png|jpg|git|jpeg)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10240
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(), 
        new CleanWebpackPlugin(), 
        new FriendlyErrorsWebpackPlugin({
            // 成功的时候输出
            compilationSuccessInfo: {
              messages: [
                `您的应用程序正在运行 here: http://localhost:8080`
            ].concat(urlLinks)
            }
        })
    ]
    .concat(htmlWebpackPlugin)
    ,

    devServer: {
        contentBase: './dist',
        hot:true,
        stats: 'errors-only',
        host: 'localhost',
        port: 8080
    }

}

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        popup: './frontend/popup.js',
        content: './frontend/content.js',
        background: './frontend/background.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { 
                    from: "public", 
                    to: "." 
                },
                {
                    from: "assets",
                    to: "assets"
                },
                {
                    from: 'manifest.json',
                    to: 'manifest.json'
                },
                {
                    from: 'frontend/styles',
                    to: 'styles',
                    noErrorOnMissing: true
                }
            ]
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx'],
        fallback: {
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "buffer": require.resolve("buffer/"),
            "process": require.resolve("process/browser")
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    }
}; 
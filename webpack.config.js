const path = require('path')
const webpack = require('webpack')
const BundleTracker = require('webpack-bundle-tracker')

module.exports = {
    entry: [
        './frontend/src/frontend.app.js'
    ],
    output: {
        path: path.resolve(__dirname, 'frontend', 'static', 'frontend'),
        filename: 'frontend.bundle.js'
    },
    plugins: [
        new BundleTracker({filename: './webpack-stats.json'})
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    }
};
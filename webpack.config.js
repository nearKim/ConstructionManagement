const path = require('path')
const webpack = require('webpack')
const BundleTracker = require('webpack-bundle-tracker')

module.exports = {
    entry: {
        main: './frontend/src/frontend.app.js',
        plannedSchedule: './frontend/src/planned_schedule.app.js'
    },
    output: {
        path: path.resolve(__dirname, 'frontend', 'static', 'frontend'),
        filename: '[name].bundle.js'
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
            },
            {
                test: /\.css$/,
                use: [
                    {loader: "style-loader"},
                    {loader: "css-loader"}
                ]
            }
        ]
    }
};
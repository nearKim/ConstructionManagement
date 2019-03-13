const path = require('path')

module.exports = {
    entry: './frontend/src/frontend.app.js',
    output: {
        path: path.resolve(__dirname, 'frontend', 'static', 'frontend'),
        filename: 'frontend.bundle.js'
    },
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
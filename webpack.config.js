// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');

const config = {
    mode: 'production',
    target: 'node',
    entry: './src/Main/index.ts',
    externals: {
        'discord.js': `require('discord.js');`
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: 'ts-loader',
                exclude: ['/node_modules/'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', 'json'],
        modules: ['node_modules'],
        mainFields: ['module', 'main']
    },
};

module.exports = () => {
    return config;
};

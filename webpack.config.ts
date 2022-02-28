import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import webpack from 'webpack';

const config: webpack.Configuration = {
    mode: 'production',
    context: path.normalize(`${__dirname}/live-example`),
    entry: ['./main.ts', './main.css'],
    output: {
        path: path.resolve(__dirname, 'docs/examples'),
        filename: 'live-example.[contenthash].js',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './live-example/index.html'),
        }),
    ],
};

export default config;

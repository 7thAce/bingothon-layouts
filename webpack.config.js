const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const globby = require('globby');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

const config = (name) => {
	const entry = globby
		.sync('*/main.ts', {cwd: `src/${name}`})
		.reduce((prev, curr) => {
			prev[path.basename(path.dirname(curr))] = `./${curr}`;
			return prev;
		}, {});

	const miniCSSOpts = {
		loader: MiniCssExtractPlugin.loader,
		options: {
			hmr: !isProd,
			publicPath: '../',
		},
	};

	let plugins = [];
	if (!isProd) {
		plugins.push(
			new LiveReloadPlugin({
				port: 0,
				appendScriptTag: true,
			})
		);
	}
	plugins = plugins.concat(
		[
			new HardSourceWebpackPlugin(),
			new VueLoaderPlugin(),
			...Object.keys(entry).map(
				(entryName) =>
					new HtmlWebpackPlugin({
						filename: `${entryName}.html`,
						chunks: [entryName],
						title: entryName,
						template: 'template.html',
					}),
			),
			new ForkTsCheckerWebpackPlugin({
				typescript: {
					extensions: {
						vue: true,
					},
				},
			}),
		]
	);
	if (isProd) {
		plugins.push(
			new MiniCssExtractPlugin({
				filename: 'css/[name].css',
			})
		);
	}
	if (name === 'dashboard') {
		plugins.push(
			new VuetifyLoaderPlugin(),
		);
	}
	if (name === 'graphics') {
		plugins.push(
			new CopyPlugin({patterns:[
			  { from: './_misc/common.css', to: './', flatten: true },
			]}),
		  );
	}

	return {
		context: path.resolve(__dirname, `src/${name}`),
		mode: isProd ? 'production' : 'development',
		target: 'web',
		// devtool: isProd ? undefined : 'cheap-source-map',
		entry,
		output: {
			path: path.resolve(__dirname, name),
			filename: 'js/[name].js',
		},
		resolve: {
			extensions: ['.js', '.ts', '.tsx', '.json'],
			alias: {
				vue: 'vue/dist/vue.esm.js',
			},
			plugins: [
				new TsConfigPathsPlugin({
					configFile: 'tsconfig.browser.json',
				}),
			],
		},
		module: {
			rules: [
				{
					test: /\.vue$/,
					loader: 'vue-loader',
				},
				{
					test: /\.css$/,
					use: [
						(isProd) ? miniCSSOpts : 'vue-style-loader',
						{
							loader: 'css-loader',
							options: {
								esModule: false,
							},
						},
					],
				},
				{
					test: /\.s(c|a)ss$/,
					use: [
						(isProd) ? miniCSSOpts : 'vue-style-loader',
						{
							loader: 'css-loader',
							options: {
								esModule: false,
							},
						},
						{
							loader: 'sass-loader',
							options: {
								implementation: require('sass'),
								sassOptions: {
								},
							},
						},
					],
				},
				{
					test: /\.(woff(2)?|ttf|eot)$/,
					loader: 'file-loader',
					options: {
						name: 'font/[name].[ext]',
						esModule: false,
					},
				},
				{
					test: /\.svg?$/,
					include: [
						path.resolve(__dirname, `src/${name}/_misc/fonts`),
					],
					loader: 'file-loader',
					options: {
						name: 'font/[name].[ext]',
						esModule: false,
					},
				},
				{
                    test: /\.(png|svg|jpg)?$/,
                    exclude: [
                        path.resolve(__dirname, `src/${name}/_misc/fonts`),
                    ],
                    loader: 'file-loader',
                    options: {
                        name: 'img/[name]-[contenthash].[ext]',
                        esModule: false,
                    },
                },
				{
					test: /\.tsx?$/,
					loader: 'ts-loader',
					options: {
						transpileOnly: true, // ForkTsCheckerWebpackPlugin will do type checking
						appendTsSuffixTo: [/\.vue$/],
					},
				},
			],
		},
		plugins,
		optimization: (isProd) ? {
			splitChunks: {
				chunks: 'all',
				cacheGroups: {
					common: {
						minChunks: 2,
					},
					vendors: false,
					default: false,
				},
			},
		} : undefined,
	};
}

module.exports = [
	config('dashboard'),
	config('graphics'),
];

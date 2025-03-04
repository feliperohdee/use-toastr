import dts from 'vite-plugin-dts';
import { defineConfig, UserConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig(env => {
	const config: UserConfig = {
		plugins: [react()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src')
			}
		}
	};

	if (env.mode === 'export') {
		config.build = {
			copyPublicDir: false,
			lib: {
				entry: './src/index.ts',
				fileName: 'index',
				formats: ['es']
			},
			rollupOptions: {
				external: ['react-dom', 'react', 'react/jsxRuntime'],
				output: {
					entryFileNames: '[name].js'
				}
			}
		};

		config.plugins = [
			...config.plugins!,
			dts({
				include: ['./src/sonner/*', './src/index.ts'],
				rollupTypes: true,
				tsconfigPath: './tsconfig.app.json'
			})
		];
	}

	return config;
});

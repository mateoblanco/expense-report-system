import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false,
                        cleanupIds: false,
                      },
                    },
                  },
                  'prefixIds',
                  'removeDimensions',
                ],
              },
            },
          },
        ],
        as: '*.js',
      },
    },
  },
};


export default nextConfig;

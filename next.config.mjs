// next.config.js
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude all modules in node_modules from the server bundle
      config.externals = [
        ...config.externals,
        nodeExternals({
          allowlist: [/^next/, /^@/, /^jotform/],
        }),
      ];
    } else {
      // For client builds, ignore Knex optional dependencies
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^knex\/lib\/dialects\/(.*)$/,
        })
      );
    }
    return config;
  },
};

export default nextConfig;

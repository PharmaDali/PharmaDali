module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@assets': './assets',
            '@shared': './src/shared',
            '@components': './src/components',
            '@customer': './app/customer',
            '@pharmacist': './app/pharmacist',
            '@src': './src',
            '@features': './src/features',
          }
        }
      ]
    ],
  };
};
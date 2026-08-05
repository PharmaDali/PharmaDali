module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel"
    ],
    plugins: [
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
      ],
      'react-native-reanimated/plugin'
    ],
  };
};
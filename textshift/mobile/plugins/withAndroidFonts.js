const { withDangerousMod } = require('expo/config-plugins');
const path = require('path');
const fs = require('fs');

function withAndroidFonts(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const fontsDir = path.resolve(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'assets',
        'fonts'
      );
      fs.mkdirSync(fontsDir, { recursive: true });

      const fontSource = path.resolve(
        __dirname,
        '..',
        'node_modules',
        '@expo',
        'vector-icons',
        'build',
        'vendor',
        'react-native-vector-icons',
        'Fonts',
        'Ionicons.ttf'
      );

      fs.copyFileSync(fontSource, path.resolve(fontsDir, 'Ionicons.ttf'));
      fs.copyFileSync(fontSource, path.resolve(fontsDir, 'ionicons.ttf'));

      return config;
    },
  ]);
}

module.exports = withAndroidFonts;

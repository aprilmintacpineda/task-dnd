const alias = require('./importAliases');

module.exports = {
  presets: ['@babel/preset-react'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias
      }
    ]
  ]
};

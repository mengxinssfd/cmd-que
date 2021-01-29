module.exports = {
  exclude: [
    /node_modules/,
    /\.git/,
    /\.idea/,
  ],
  test: /\.styl$/,
  command: [
    "stylus <$FilePath$> $FileDir$\\$FileNameWithoutAllExtensions$.wxss",
  ]
};
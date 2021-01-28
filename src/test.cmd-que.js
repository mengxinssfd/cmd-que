module.exports = {
  exclude: [
    /node_modules/,
    /\.git/,
    /\.idea/,
  ],
  command: [
    "stylus $FileDir$\\test1.styl",
    "stylus $FileDir$\\test2.styl",
  ]
};
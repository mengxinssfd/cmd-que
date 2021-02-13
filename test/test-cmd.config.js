module.exports = {
    exclude: [
        /node_modules/,
        /\.git/,
        /\.idea/,
    ],
    rules: [
        {
            test: /\.styl$/,
            command: [
                "stylus <$FilePath$> $FileDir$\\$FileNameWithoutAllExtensions$.wxss",
                "node -v"
            ]
        }
    ]
};
// node src/index.js -c=test/watch-cmd.config.js -w
module.exports = {
    beforeEnd() {
        console.log("end")
    },
    rules: [
        {
            test: /\.styl$/,
            command: [
                "stylus $FilePath$",
                "node -v"
            ]
        },
    ],
    exclude: [
        /node_modules/,
        /\.git/,
        /\.idea/,
        /src/,
        /bin/,
    ],
    include: ["./test"],
};
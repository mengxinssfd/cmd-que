module.exports = {
    rules: [
        {
            test: /\.(styl|ts)$/,
            on(path, ext, exec) {
                const types = {
                    styl: "styl",
                    ts: "ts",
                };
                const command = {
                    [types.styl]: "stylus $FilePath$",
                    [types.ts]: "tsc $FilePath$",
                };
                return exec(command[ext], path);
            }
        },
        {
            test: /\.pug$/,
            on(path, ext, exec) {
                return exec("pug $FileDir$", path)
            }
        }
    ],
    exclude: [
        /node_modules/,
        /\.git/,
        /\.idea/,
        /src/,
        /bin/,
    ],
    include: ["./test/watch"],
};
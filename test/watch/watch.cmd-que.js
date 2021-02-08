module.exports = {
    exclude: [
        /node_modules/,
        /\.git/,
        /\.idea/,
        /src/,
        /bin/,
    ],
    include: ["./test/watch"],
    test: [/\.(styl|ts)$/, /\.pug$/],
    async on(path, ext, exec) {
        const types = {
            styl: "styl",
            ts: "ts",
            pug: "pug"
        };
        const command = {
            [types.styl]: "stylus $FilePath$",
            [types.ts]: "tsc $FilePath$",
            [types.pug]: "pug $FileDir$",
        };
        switch (ext) {
            case types.styl:
            case types.ts:
                await exec(command[ext], path);
                break;
            case types.pug:
                await exec(command[types.pug], path);
                break;
        }
    }
};
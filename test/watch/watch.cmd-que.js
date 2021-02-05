module.exports = {
    exclude: [
        /node_modules/,
        /\.git/,
        /\.idea/,
    ],
    // include: ["./test", "./test2"],
    test: /\.(styl|ts|pug)$/,
    async on(path, ext, exec) {
        const types = {
            styl: "styl",
            ts: "ts",
            pug: "pug"
        };
        const command = {
            [types.styl]: "stylus $FilePath$",
            [types.ts]: "tsc $FilePath$",
            [types.pug]: "pug ./",
        };
        switch (ext) {
            case types.styl:
            case types.ts:
                await exec(command[ext], path);
            case types.pug:
                await exec(command[types.pug], path);
                break;
        }
    }
};
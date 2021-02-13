module.exports = {
    beforeEnd(exec) {
        return exec("pug $Cwd$")
    },
    exclude: [
        /node_modules/,
        /\.git/,
        /\.idea/,
        /src/,
        /bin/,
    ],
    include: ["./test"],
    rules: [
        {
            test: /\.styl$/,
            on: (eventName, path, ext, exec) => {
                if (eventName === "delete") return;
                return exec("stylus $FilePath$");
            }
        },
        {
            test: /\.ts$/,
            on: (eventName, path, ext, exec) => {
                if (eventName === "delete") return;
                return exec("tsc $FilePath$");
            }
        },
    ]
};
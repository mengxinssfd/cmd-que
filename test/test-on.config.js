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
            on: async (eventName, path, ext, exec) => {
                if (eventName === "delete") return;
                const result = await exec("stylus $FilePath$");
                console.log(result)
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
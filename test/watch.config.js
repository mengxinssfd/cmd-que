// node src/index.js -c=test/watch.config.js -w -log
module.exports = {
    beforeStart() {
        // console.log("start", debounce)
    },
    beforeEnd() {
        console.log("end")
    },
    rules: [
        {
            test: /\.(styl|ts)$/,
            on: (eventName, path, ext, exec) => {
                if (eventName === "delete") return;
                const types = {
                    styl: "styl",
                    ts: "ts",
                };
                const command = {
                    [types.styl]: "stylus $FilePath$",
                    [types.ts]: "tsc $FilePath$",
                };
                return exec(command[ext]);
            }
        },
        {
            test: /\.styl$/,
            on: async (eventName, path, ext, exec) => {
                return exec("node -v");
            }
        },
        {
            test: /\.styl$/,
            on: (eventName, path, ext, exec) => {
                console.log("test styl2")
            }
        },
        {
            test: /\.styl$/,
            on: (eventName, path, ext, exec) => {
                console.log("test styl3")
            }
        },
        /*  {
              test: /\.pug$/,
              on(eventName, path, ext, exec) {
                  if (eventName === "delete") return;
                  return exec("pug $FileDir$")
              }
          }*/
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
// node src/index.js -c=test/watch/cmd-que.js -w -log
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
                console.log(path, ext)
                if (eventName === "delete") return;
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
            test: /\.styl$/,
            on: (eventName, path, ext, exec) => {
                console.log("test styl")
            }
        },
        /*  {
              test: /\.pug$/,
              on(eventName, path, ext, exec) {
                  if (eventName === "delete") return;
                  return exec("pug $FileDir$", path)
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
    include: ["./test/watch"],
};
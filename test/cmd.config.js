module.exports = {
    beforeStart() {
        console.time("time");
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log("start");
                resolve();
            }, 1000);
        });
    },
    beforeEnd() {
        console.log("end");
        console.timeEnd("time");
    },
    command: [
        // "stylus D:\\project\\cmd-que\\test\\test.styl",
        "stylus E:\\project\\cmd-que\\test\\test.styl",
        "stylus test/test1.styl",
    ]
};
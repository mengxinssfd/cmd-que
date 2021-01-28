/**
 * 防抖函数
 * @param callback 回调
 * @param delay 延时
 * @returns {Function}
 */
export function debounce(callback: (...args: any[]) => void, delay: number) {
    let timer: any = null;
    return function (...args: any[]) {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => {
            timer = null;
            callback.apply(this, args);
        }, delay);
    };
}

/**
 * 防抖装饰器
 * @param delay
 * @constructor
 */
export function Debounce(delay: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // 在babel的网站编译的是target包含key，descriptor
        if (target.descriptor) {
            descriptor = target.descriptor;
        }
        descriptor.value = debounce(descriptor.value, delay);
    };
}

process.on('exit', function (code) {
    console.log(code);
});
process.stdin.setEncoding('utf8');

// 控制台输入
function input(tips: string): Promise<string> {
    process.stdout.write(tips);
    return new Promise((res) => {
        process.stdin.on('data', (input: Buffer) => {
            res(input.toString().trim());
            // if ([ 'NO', 'no'].indexOf(input) > -1) process.exit(0);
        });
    });
}

/**
 * 控制台循环输入，
 * @param tips
 * @param conditionFn 若返回false则一直输入
 * @returns {Promise<*>}
 */
async function inputLoop(
    tips: string,
    conditionFn: (words: string) => boolean | Promise<boolean>,
): Promise<string> {
    let words;
    do {
        words = await input(tips);
    } while (!await conditionFn(words));
    return words;
}

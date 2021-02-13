type execFn = (command: string) => Promise<void>;

/**
 * @param eventName 事件名
 * @param path 触发改动事件的路径
 * @param ext 触发改动事件的文件后缀
 * @param exec 执行命令函数
 */
type onFn = (eventName: string, path: string, ext: string, exec: execFn) => Promise<void>


type Rule = {
    test: RegExp,
    on: onFn,
    command: string[];
};

type RuleOn = Omit<Rule, "command">;
type RuleCmd = Omit<Rule, "on">;
type Rules = Array<RuleOn | RuleCmd>;

export interface Config {
    beforeStart: (exec: execFn) => void;
    beforeEnd: (exec: execFn) => void;
}

export interface ExecCmdConfig extends Config {
    command: string[]; // 直接执行命令列表 占位符会被替换
}


export interface WatchConfig extends Config {
    exclude?: RegExp[]; // 遍历时忽略的文件夹
    include?: string[] | string; // 要遍历/监听的文件夹路径 // 默认为当前文件夹
    rules: Rules
}

export function isRuleOn(rule: RuleOn | RuleCmd): rule is RuleOn {
    return (rule as RuleOn).on !== undefined;
}
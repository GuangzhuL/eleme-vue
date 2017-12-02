// 将时间戳转换为我们的正常时间
export function formatDate(date, fmt) {
    // ()括号的使用是为了让其可被匹配，c从而可以在下面使用RegExp.$1找到匹配部分
    if (/(y+)/.test(fmt)) {
        // 个人认为后面代码多此一举，因为用的是4位减去匹配到的yyyy四位，也就是最终是.substr(0),
        // 那么哪怕我不要这段代码也可以达到同样的效果，因为已经把年份的数字类型转换为字符串类型
        // console.log(RegExp.$1); //yyyy
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        // console.log(fmt);
    }
    let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    };
    for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
            // 若键匹配，则值变字符串
            let str = o[k] + '';
            // 若匹配的字符村是一位,则原样返回,否则就补领式返回
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
        }
    }
    return fmt;
};

function padLeftZero(str) {
    // 将月份等用两位表示出来,不足一位用0补上
    return ('00' + str).substr(str.length);
}

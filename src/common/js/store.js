// 本地存储模型
export function saveToLocal(id, key, value) {
    // 双下划线
    // 用到eslint的时候，要指明空间，例如localStorage,要加上window
    let seller = window.localStorage.__seller__;
    // console.log(seller);
    // 第一次开辟命名空间的时候，seller是undefined
    if (!seller) {
        // console.log(1);
        seller = {};
        seller[id] = {};
    } else {
        // 创建过后，若非删除，seller便一直存在
        // console.log(2);
        // json变成对象
        seller = JSON.parse(seller);
        if (!seller[id]) {
            seller[id] = {};
        }
    }
    seller[id][key] = value;
    // 一切数据存储好后，将对象变回json
    window.localStorage.__seller__ = JSON.stringify(seller);
};

export function loadFromLocal(id, key, def) {
    let seller = window.localStorage.__seller__;
    if (!seller) {
        return def;
    }
    seller = JSON.parse(seller)[id];
    if (!seller) {
        return def;
    }
    let ret = seller[key];
    return ret || def;
}

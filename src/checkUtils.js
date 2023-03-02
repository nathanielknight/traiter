function pathExists(obj, path) {
    let item = obj;
    for (const nm in path) {
        if (item[nm] == undefined) {
            return false;
        }
        item = item[nm];
    }
    return true;
}


module.exports = {
    pathExists,
};
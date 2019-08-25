
export function UID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};

// export function arrayToObject(array) {
//     return array.reduce((obj, item) => {
//         obj[item.name] = item
//         return obj
//     }, {})
// };

export const arrayToObject = (array, keyField) =>
    array.reduce((obj, item) => {
        obj[item[keyField]] = item
        return obj
    }, {});

export function loopObject(obj, cb) {
    var res = [];
    for (var prop in obj) {
        var r = cb(obj[prop], prop);
        res.push(r);
    }
    return res;
};

export function isAlphanumeric(str) {
    var patt = /^[0-9a-zA-Z_.-]*$/g;
    return patt.test(str);
}
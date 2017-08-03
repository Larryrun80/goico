function friendlyNumber(num) {
  var parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

// by函数接受一个对象的key和排序方式（asc, desc）做为参数
// 并返回一个可以用来包含该成员的对象数组进行排序的比较函数
// 使用： xxxx.sort(by('age', 'desc'));
function by(key, sort_direction = "asc") {
  return function (o, p) {
    var a, b;
    if (typeof o === "object" && typeof p === "object" && o && p) {
      a = o[key];
      b = p[key];
      if (!sort_direction in ['asc', 'desc']) {
        throw ("not illegal sort direction");
      }

      if (a === b) {
        return 0;
      }

      if (sort_direction == 'asc')
        return a < b ? -1 : 1;
      else
        return a < b ? 1 : -1;

    }
    else {
      throw ("error");
    }
  }
}

function swapItems (arr, index1, index2) {
  arr[index1] = arr.splice(index2, 1, arr[index1])[0];
  return arr;
};

module.exports = {
  friendlyNumber: friendlyNumber,
  by: by,
  swapItems: swapItems,
}
let s = 'http://httpbin.org/post?iiii&dd&ds=1';
// [{key:'a', value:'aa'} ...]

let paramsList = s.substring(s.indexOf('?') + 1).split('&');
console.log(paramsList);
let stateParam = [];
paramsList.forEach((param) => {
  if (param.indexOf('=') != -1) {
    stateParam.push({
      key: param.substring(0, param.indexOf('=')),
      value: param.substring(param.indexOf('=') + 1)
    });
  } else {
    stateParam.push({ key: param });
  }
});

console.log(stateParam);
// console.log('iiii'.indexOf('='))
let updatedURL = 'http://fakeurl.com?a=1';
const paramList = [
  { key: 'a', value: '1' },
  { key: 'b', value: '2' },
  { key: 'c', value: '3' }
];
let suffix = '?';

paramList.forEach((param) => {
  // suffix += param.key + '=' + param.value + '&';
  let value =
    param.value.indexOf('&') === -1
      ? param.value
      : param.value.slice(0, param.value.indexOf('&')) +
        '%26' +
        param.value.slice(param.value.indexOf('&'), param.value.length);
  suffix += param.key + '=' + value + '&';
});
updatedURL =
  updatedURL.indexOf('?') === -1
    ? updatedURL + suffix.slice(0, suffix.length - 1)
    : updatedURL.slice(0, updatedURL.indexOf('?')) + suffix.slice(0, suffix.length - 1);

console.log(updatedURL);

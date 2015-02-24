exports.get = function (key) {
  if (typeof key !== 'string') {
    return new Error('key must be string');
  }
  return JSON.parse(localStorage.getItem(key));
};

exports.set = function (key, value) {
  if (typeof key !== 'string') {
    return new Error('key must be string');
  }
  localStorage.setItem(key, JSON.stringify(value));
};

exports.unset = function (key) {
  localStorage.removeItem(key);
};

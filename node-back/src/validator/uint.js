module.exports = function (param) {
  let valid = typeof param === 'number';
  if(!valid)
    valid = param === '0';
  if(!valid)
    valid = parseInt(param) > 0;
  return !valid ? `'${param}' is not uInt` : null;
}
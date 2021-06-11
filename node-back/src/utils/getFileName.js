module.exports.getFileName = (url) => {
  if (url) {
    let fileName = url.split('/').pop()
    return fileName
  }
  return ''
}

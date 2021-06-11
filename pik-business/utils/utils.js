import Compress from 'compress.js'

export const validationEmail = (email) => {
  let pattern = new RegExp(/^\w+([-+.']\w+)*@([\w-]+\.)+[\w-]{2,4}$/)
  if (pattern.test(email.trim())) return true
  else return false
}

export const diffDays = (customDate) => {
  const date = moment(customDate)
  let now = moment(new Date())
  let dif = moment.duration(date.diff(now)).days()
  return dif
}

export const diffHours = (customDate) => {
  const date = moment(customDate)
  let now = moment(new Date())
  let dif = moment.duration(date.diff(now)).hours()
  return dif
}

export const validationUrl = (str) => {
  let regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/
  if (regexp.test(str.trim())) {
    return true
  } else {
    return false
  }
}

export const replaceAll = (str, find, replace) => {
  return str.replace(
    new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'),
    replace
  )
}

export const validationMobileNumebr = (inputtxt) => {
  // var regx = /^\+([0-9]{2})[-. ]?([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  var regx = /^\+([0-9]{2})([0-9]{10})$/
  if (inputtxt.match(regx)) {
    return true
  } else {
    return false
  }
}

export async function resizeImage(
  file,
  size,
  quality,
  maxWidth,
  maxHeight,
  resize
) {
  const compress = new Compress()
  console.log({
    size, // the max size in MB, defaults to 2MB
    quality, // the quality of the image, max is 1,
    maxWidth, // the max width of the output image, defaults to 1920px
    maxHeight, // the max height of the output image, defaults to 1920px
    resize // defaults to true, set false if you do not want to resize the image width and heightt
  })
  const resizedImage = await compress.compress([...file], {
    size, // the max size in MB, defaults to 2MB
    quality, // the quality of the image, max is 1,
    maxWidth, // the max width of the output image, defaults to 1920px
    maxHeight, // the max height of the output image, defaults to 1920px
    resize // defaults to true, set false if you do not want to resize the image width and heightt
  })
  const img = resizedImage[0]
  const base64str = img.data
  const imgExt = img.ext
  const resizedFiile = Compress.convertBase64ToFile(base64str, imgExt)
  console.log(resizedFiile)
  return resizedFiile
}

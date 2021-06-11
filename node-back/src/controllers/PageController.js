const PageContent = require('../models/PageContent')
const { caseInsensitive } = require('../utils/queryUtils')

module.exports.renderPage = function (req, res, next) {
  let { title } = req.params
  PageContent.findOne({ title: caseInsensitive(title) })
    .then((page) => {
      if (!page) return res.status(404).send('')

      let content = `
<html>
    <head>
        <title>${page.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>${page.content}</body>
</html>`
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': content.length
      })
      res.write(content)
      res.end()
    })
    .catch((error) => {
      res.status(500).send('Server Side Error')
    })
}

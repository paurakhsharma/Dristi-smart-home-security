const fs = require('fs-extra')

// With a callback:
fs.copy('../facialRecognition/dataSet/user.1.43.jpg', './public/img/new.jpg', err => {
  if (err) return console.error(err)

  console.log('success!')
}) // copies filecls

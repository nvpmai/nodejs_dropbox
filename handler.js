function handleData(data) {
  console.log(data)
  if (data.action === 'createFile') {
    console.log('File created somewhere')
  } else if (data.action === 'update') {

  } else if (data.action === 'remove') {

  } else if (data.action === 'createFolder') {

  }
}

async function catchChange(socket, port) {
  socket.connect(8000, '127.0.0.1', (err) => {
    if (err) {
      console.log(err.message)
    } else {
      socket.data(['action', 'path', 'fileContent'], data => {
        handleData(data)
      })
    }
  })
}

module.exports = catchChange

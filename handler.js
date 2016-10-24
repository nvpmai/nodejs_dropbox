async function handleData(data) {
  console.log(data)
  if (data.action === 'createFile') {
    console.log("File created somewhere")
  } else if (data.action === 'update') {

  } else if (data.action === 'remove') {

  } else if (data.action === 'createFolder') {

  }
}

module.exports = {
  handleData
}

const path = require('path')
const fs = require('fs')
const {ipcRenderer} = require('electron')

function getConfigJson () {
  const userPath = (process.type === 'renderer') ? ipcRenderer.sendSync('get-user-path') : require('electron').app.getPath('userData')
  const configPath = path.join(userPath, '/config.json')
  if (fs.existsSync(configPath)) {
    const data = fs.readFileSync(configPath, 'utf8')
    try {
      const json = JSON.parse(data)
      return json
    } catch (err) {
      console.log(err)
      return {}
    }
  }
  return {}
}

exports.getConfigJson = getConfigJson

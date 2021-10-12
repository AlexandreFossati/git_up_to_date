const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const express = require('express')

const app = express()
app.use(express.json())

const port = 3000

let logs = []

function appendLog(message) {
  logs.push(message)
}

function printLog() {
  let message = ''

  for(let log of logs) {
    message += `\n${new Date().toISOString()}: ${log}`
  }

  fs.appendFileSync('log-git.txt', message)
  logs = []
}

async function runBash() {
  const timerPath = {cwd: '/home/ubuntu/timer'}

  try {
    appendLog('Git pull is running')
    await exec('git pull', timerPath)

    appendLog('npm install')
    await exec('npm i', timerPath)

    appendLog('PM2 stop timer')
    await exec('pm2 stop timer', timerPath)

    appendLog('PM2 start server.js --name timer')
    await exec('pm2 start server.js --name timer', timerPath)

  } catch (exception) {
    appendLog(`Fail while running bash commands: ${JSON.stringify(exception)}`)
  }
}

app.post('/github/timer/branch_main', async (req, res) => {
  res.send('request received')
  appendLog('New POST received')

  try {
    appendLog('Bash is going to run')
    const response = await runBash()

    appendLog('Bash commands are completed')
    printLog()

  } catch(exception) {
    appendLog(`CATCH: ${JSON.stringify(exception)}`)
  }

  printLog()
})

app.get('/', (req, res) => {
  res.send('node is working')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

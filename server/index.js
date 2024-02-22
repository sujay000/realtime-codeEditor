const express = require('express')
const app = express()
const http = require('http')
const port = 5000
const axios = require('axios')
const qs = require('qs')

const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
})

async function getCodeSubmissionResult(CA_content, language, IN_content) {
    const data = qs.stringify({
        code: CA_content,
        language: language,
        input: IN_content,
    })
    const config = {
        method: 'post',
        url: 'https://api.codex.jaagrav.in',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
    }
    try {
        let res = await axios(config)
        console.log(res.data)
        return res.data.output
    } catch (err) {
        console.log(err)
    }
}

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`)

    socket.on('FE_CA_message', (data) => {
        socket.broadcast.emit('BE_CA_message', data)
    })
    socket.on('FE_IN_message', (data) => {
        socket.broadcast.emit('BE_IN_message', data)
    })
    socket.on('FE_OUT_message', (data) => {
        socket.broadcast.emit('BE_OUT_message', data)
    })

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`)
    })

    socket.on('code_submission', async ({ CA_content, language, IN_content }) => {
        console.log(CA_content)
        console.log(IN_content)
        let output = await getCodeSubmissionResult(CA_content, language, IN_content)
        console.log('ouput logged: ' + output)
        io.emit('BE_OUT_message', output)
    })
})

server.listen(port, () => {
    console.log(`listening on port ${port}`)
})

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
        url: 'http://localhost:3000/',
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

    socket.on('FE_CA_message', ({ data, hisID }) => {
        io.to(hisID).emit('BE_CA_message', data)
    })
    socket.on('FE_IN_message', ({ data, hisID }) => {
        io.to(hisID).emit('BE_IN_message', data)
    })
    socket.on('FE_OUT_message', ({ data, hisID }) => {
        io.to(hisID).emit('BE_OUT_message', data)
    })

    socket.on('code_submission', async ({ CA_content, language, IN_content, myID, hisID }) => {
        console.log(CA_content)
        console.log(IN_content)
        let output = await getCodeSubmissionResult(CA_content, language, IN_content)
        console.log('ouput logged: ' + output)
        io.to(myID).emit('BE_OUT_message', output)
        if (hisID != null) io.to(hisID).emit('BE_OUT_message', output)
    })

    /// video-app
    socket.emit('me', socket.id)

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`)
        socket.broadcast.emit('callEnded')
    })

    socket.on('callOther', ({ textInput, data }) => {
        console.log(textInput)
        io.to(textInput).emit('callIncoming', {
            id: socket.id, // call initiator's id
            data: data,
        })
    })

    socket.on('acceptedTheCall', ({ hisID, data }) => {
        io.to(hisID).emit('heAccepted', data)
    })

    // ending the call
    socket.on('leaveCall', (hisID) => {
        io.to(hisID).emit('leaveCall')
    })
})

server.listen(port, () => {
    console.log(`listening on port ${port}`)
})

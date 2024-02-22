import { useState, useEffect } from 'react'
import { socket } from './socket'

// FE -> frontend
// BE -> backend
// CA -> codeArea
// IN -> input
// OUT -> output

function App() {
    const [CA_content, setCA_content] = useState('')
    const [IN_content, setIN_content] = useState('')
    const [OUT_content, setOUT_content] = useState('')
    useEffect(() => {
        // updating the boxes content, if anything has changed from other user
        socket.on('BE_CA_message', (newContent) => {
            setCA_content(newContent)
        })
        socket.on('BE_IN_message', (newContent) => {
            setIN_content(newContent)
        })
        socket.on('BE_OUT_message', (newContent) => {
            setOUT_content(newContent)
        })

        navigator.mediaDevices.getUserMedia().then((devices) => {
            console.log(devices)
        })
    }, [])

    // updating the boxes content in my UI, and sending that change to broadcast to
    // other users using socket.io
    function handleCAchange(e) {
        setCA_content(e.target.value)
        socket.emit('FE_CA_message', e.target.value)
    }
    function handleINchange(e) {
        setIN_content(e.target.value)
        socket.emit('FE_IN_message', e.target.value)
    }
    function handleOUTchange(e) {
        setOUT_content(e.target.value)
        socket.emit('FE_OUT_message', e.target.value)
    }

    function handleResult() {
        socket.emit('code_submission', { CA_content, language: 'cpp', IN_content })
    }

    console.log('hi there')
    return (
        <>
            Code Area
            <textarea value={CA_content} onChange={handleCAchange} /> <br />
            input
            <textarea value={IN_content} onChange={handleINchange} /> <br />
            output
            <textarea value={OUT_content} onChange={handleOUTchange} /> <br />
            <button onClick={handleResult}>RUN</button>
        </>
    )
}

export default App

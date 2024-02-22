import { useState, useEffect, useRef } from 'react'
import { socket } from './socket'
import global from 'global'
import * as process from 'process'
global.process = process
import Peer from 'simple-peer'

// FE -> frontend
// BE -> backend
// CA -> codeArea
// IN -> input
// OUT -> output

import { CopyToClipboard } from 'react-copy-to-clipboard'
function App() {
    const [CA_content, setCA_content] = useState('')
    const [IN_content, setIN_content] = useState('')
    const [OUT_content, setOUT_content] = useState('')

    ///
    const [me, setMe] = useState('')
    const [stream, setStream] = useState()
    const [receivingCall, setReceivingCall] = useState(false)
    const [caller, setCaller] = useState('')
    const [callerSignal, setCallerSignal] = useState()
    const [callAccepted, setCallAccepted] = useState(false)
    const [idToCall, setIdToCall] = useState('')
    const [callEnded, setCallEnded] = useState(false)
    const [name, setName] = useState('')
    const myVideo = useRef(null)
    const userVideo = useRef(null)
    const connectionRef = useRef(null)
    ///

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

        socket.on('me', (id) => {
            console.log(id)
            console.log(myVideo)
            setMe(id)
        })

        socket.on('callUser', (data) => {
            setReceivingCall(true)
            setCaller(data.from)
            setName(data.name)
            setCallerSignal(data.signal)
        })
    }, [])

    const callUser = (id) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        })
        peer.on('signal', (data) => {
            socket.emit('callUser', {
                userToCall: id,
                signalData: data,
                from: me,
                name: name,
            })
        })
        peer.on('stream', (stream) => {
            userVideo.current.srcObject = stream
        })
        socket.on('callAccepted', (signal) => {
            setCallAccepted(true)
            peer.signal(signal)
        })

        connectionRef.current = peer
    }

    const answerCall = () => {
        setCallAccepted(true)
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        })
        peer.on('signal', (data) => {
            socket.emit('answerCall', { signal: data, to: caller })
        })
        peer.on('stream', (stream) => {
            userVideo.current.srcObject = stream
        })

        peer.signal(callerSignal)
        connectionRef.current = peer
    }

    const leaveCall = () => {
        setCallEnded(true)
        connectionRef.current.destroy()
    }

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

    function handleStart() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream)
            myVideo.current.srcObject = stream
        })
    }

    function handleLogValues() {
        console.log('me ' + me)
        console.log('stream ' + stream)
        console.log('receivingCall ' + receivingCall)
        console.log('caller ' + caller)
        console.log('callerSignal ' + callerSignal)
        console.log('callAccepted ' + callAccepted)
        console.log('idToCall ' + idToCall)
        console.log('callEnded ' + callEnded)
        console.log('name ' + name)
        console.log('myVideo ' + myVideo)
        console.log('userVideo ' + userVideo)
        console.log('connectionRef ' + connectionRef)
    }

    return (
        <>
            Code Area
            <textarea value={CA_content} onChange={handleCAchange} /> <br />
            input
            <textarea value={IN_content} onChange={handleINchange} /> <br />
            output
            <textarea value={OUT_content} onChange={handleOUTchange} /> <br />
            <button onClick={handleResult}>RUN</button>
            <>
                <h1>Zoomish</h1>
                <button onClick={handleStart}>start my video and audio</button>
                <button onClick={handleLogValues}>Log values</button>
                <div className="container">
                    <div className="video-container">
                        <div className="video">
                            {<video playsInline muted ref={myVideo} autoPlay style={{ width: '200px' }} />}
                        </div>
                        <div className="video">
                            {<video playsInline ref={userVideo} autoPlay style={{ width: '200px' }} />}
                        </div>
                    </div>
                    <div className="myId">
                        <input
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ marginBottom: '20px' }}
                        />
                        <CopyToClipboard text={me} style={{ marginBottom: '2rem' }}>
                            <button>Copy ID</button>
                        </CopyToClipboard>

                        <input label="ID to call" value={idToCall} onChange={(e) => setIdToCall(e.target.value)} />
                        <div className="call-button">
                            {callAccepted && !callEnded ? (
                                <button onClick={leaveCall}>End Call</button>
                            ) : (
                                <button aria-label="call" onClick={() => callUser(idToCall)}>
                                    phone icon
                                </button>
                            )}
                            {idToCall}
                        </div>
                    </div>
                    <div>
                        {receivingCall && !callAccepted ? (
                            <div className="caller">
                                <h1>{name} is calling...</h1>
                                <button onClick={answerCall}>Answer</button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </>
        </>
    )
}

export default App

import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import global from 'global'
import * as process from 'process'
global.process = process
import Peer from 'simple-peer'
import { BACKEND_PORT } from './constants'

const URL = `http://localhost:${BACKEND_PORT}`
// FE -> frontend
// BE -> backend
// CA -> codeArea
// IN -> input
// OUT -> output

// import { CopyToClipboard } from 'react-copy-to-clipboard'
const socket = io(URL)

function App() {
    const [CA_content, setCA_content] = useState('')
    const [IN_content, setIN_content] = useState('')
    const [OUT_content, setOUT_content] = useState('')

    /// video-app
    const [stream, setStream] = useState(null)
    const [textInput, setTextInput] = useState('')
    const [isCallIncoming, setIsCallIncoming] = useState(false)

    const myVideo = useRef(null)
    const hisVideo = useRef(null)

    const [myID, setMyID] = useState('')
    const [hisID, setHisID] = useState('')
    const [hisSignallingData, setHisSignallingData] = useState(null)

    const [inCall, setInCall] = useState(false)

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

        // video-app
        socket.on('me', (data) => {
            setMyID(data)
        })
        socket.on('callIncoming', ({ id: his_ID, data }) => {
            setIsCallIncoming(true)
            setHisID(his_ID)
            setHisSignallingData(data)
        })

        // leave call
        socket.on('leaveCall', () => {
            setInCall(false)
            connectionRef.current.destroy()
            window.location.reload()
        })
    }, [inCall, isCallIncoming])
    // so that after `incall` & `isCallIncoming` change
    // whole compoenent re-renders except the hooks (coz I want to show buttons acc.)

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

    // video-app
    function handleStart() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream)
            myVideo.current.srcObject = stream
        })
    }

    // made async so that , setTextinut sets textInput
    function handleCallUser() {
        // if previous connection
        if (connectionRef.current) {
            connectionRef.current.destroy()
        }

        console.log(`handle callUser called`)
        const peer = new Peer({
            initiator: true, // peer1
            trickle: false, // calls the 'signal' event only once
            stream: stream,
        })

        peer.on('stream', (stream) => {
            hisVideo.current.srcObject = stream
        })

        peer.on('signal', (data) => {
            console.log(textInput)
            console.log(data)
            socket.emit('callOther', { textInput: textInput, data: data })
        })

        socket.on('heAccepted', (data) => {
            setHisSignallingData(data)
            peer.signal(data)
            setInCall(true)
        })

        connectionRef.current = peer
    }

    function handleDecline() {
        console.log(`call declined`)
        setIsCallIncoming(false)
    }

    function handleAnswer() {
        // if previous connection
        if (connectionRef.current) {
            connectionRef.current.destroy()
        }

        console.log(`call accepted`)
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        })

        peer.on('stream', (stream) => {
            hisVideo.current.srcObject = stream
        })

        peer.on('signal', (data) => {
            console.log(`his id peer on signal ${hisID}`)
            socket.emit('acceptedTheCall', { hisID, data })
        })

        peer.signal(hisSignallingData)
        setIsCallIncoming(false)
        setInCall(true)

        connectionRef.current = peer
    }

    function handleLeaveCall() {
        socket.emit('leaveCall', hisID)
        setInCall(false)
        connectionRef.current.destroy()
        window.location.reload()
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
            <div>
                YOUR ID:
                <br />
                {myID}
                <br />
                <video playsInline muted ref={myVideo} autoPlay style={{ width: '200px' }} />
                <br />
                <video playsInline ref={hisVideo} autoPlay style={{ width: '200px' }} />
                <br />
                {!inCall && (
                    <CallUserComponent
                        handleStart={handleStart}
                        textInput={textInput}
                        setTextInput={setTextInput}
                        handleCallUser={handleCallUser}
                    />
                )}
                {isCallIncoming && (
                    <IncomingCallNotification handleDecline={handleDecline} handleAnswer={handleAnswer} />
                )}
                {inCall && <button onClick={handleLeaveCall}>Leave call</button>}
            </div>
        </>
    )
}

function CallUserComponent(props) {
    return (
        <>
            <button onClick={props.handleStart}> start my video and audio</button>
            <br />
            <br />
            <label>Enter id</label>
            <input
                onChange={(e) => {
                    props.setTextInput(e.target.value)
                }}
                value={props.textInput}
            />
            <br />
            <button onClick={props.handleCallUser}>call user</button>
            <br />
        </>
    )
}

function IncomingCallNotification({ handleDecline, handleAnswer }) {
    return (
        <div>
            <h2>Incoming Call</h2>
            <button onClick={handleDecline}>Decline</button>
            <button onClick={handleAnswer}>Answer</button>
        </div>
    )
}

export default App

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
    const [hisID, setHisID] = useState(null)
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
        if (hisID != null) socket.emit('FE_CA_message', { data: e.target.value, hisID })
    }
    function handleINchange(e) {
        setIN_content(e.target.value)
        if (hisID != null) socket.emit('FE_IN_message', { data: e.target.value, hisID })
    }
    function handleOUTchange(e) {
        setOUT_content(e.target.value)
        if (hisID != null) socket.emit('FE_OUT_message', { data: e.target.value, hisID })
    }

    function handleResult() {
        socket.emit('code_submission', { CA_content, language: 'cpp', IN_content, myID, hisID })
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
            setHisID(textInput)
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
        <div className="grid grid-cols-10">
            <div className="h-screen col-span-7 font-medium bg-gradient-to-br  from-green-400 to-blue-400 p-3 px-8">
                <div className="h-3/ ">
                    <div className="text-white font-semibold text-xl pt-4 pb-2">Code Area</div>
                    <textarea
                        spellCheck="false"
                        className="w-full h-auto p-0 font-mono rounded-md"
                        rows={18}
                        value={CA_content}
                        onChange={handleCAchange}
                        placeholder=" // write your code here"
                    />
                </div>
                <div className="flex">
                    <div className="h-1/5 w-1/2 pr-4">
                        <div className="text-white font-semibold text-xl pt-4 pb-2">Input</div>
                        <textarea
                            rows={7}
                            value={IN_content}
                            className="h-auto w-full font-mono rounded-md"
                            onChange={handleINchange}
                        />
                    </div>
                    <div className="h-1/5 w-1/2 pl-4">
                        <div className="text-white font-semibold text-xl pt-4 pb-2">Output</div>
                        <textarea
                            rows={7}
                            value={OUT_content}
                            className="h-auto w-full font-mono rounded-md"
                            onChange={handleOUTchange}
                        />
                    </div>
                </div>
                <div className="h-16 flex  items-center">
                    <button
                        onClick={handleResult}
                        type="button"
                        className="text-black  
                        hover:bg-red-700
                        focus:ring-blue-300 
                        font-medium 
                        rounded-lselg 
                        text-sm 
                        px-5 
                        py-2.5 
                        bg-red-500
                        rounded-md
                        text-white"
                    >
                        RUN
                    </button>
                </div>
            </div>

            <div className="col-span-3 font-medium  bg-green-200 border-l border-green-300 p-8">
                <h1 className="text-2xl font-bold p-2 pt-0 text-green-800 ">Video Call</h1>

                <p className="text-sm font-normal text-center text-green-800 mb-2">
                    Start a video call with your friend. Share your id with them
                </p>
                <p
                    className="text-center 
                    font-extralight 
                    border-2 
                    border-green-900 
                    rounded 
                    text-green-200 
                    py-2 px-4
                    bg-green-700
                    "
                >
                    {myID}
                </p>
                <video className="my-4" playsInline muted ref={myVideo} autoPlay style={{ width: '200px' }} />
                <video className="my-4" playsInline ref={hisVideo} autoPlay style={{ width: '200px' }} />
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
                {inCall && (
                    <button
                        className=" w-full bg-red-500 hover:bg-red-700 text-white rounded-md py-2 
                px-4 font-normal"
                        onClick={handleLeaveCall}
                    >
                        Leave Call
                    </button>
                )}
            </div>
        </div>
    )
}

function CallUserComponent(props) {
    return (
        <>
            <button
                className="
                w-full block 
                bg-blue-500 
                hover:bg-blue-600 
                text-white 
                font-semibold 
                py-2 
                px-4 
                rounded"
                onClick={props.handleStart}
            >
                Start my video and audio
            </button>
            <div className="text-lg mt-10 py-2 px-2  text-green-800">Enter id</div>
            <input
                className="rounded-md 
                py-2 
                px-4 border-2 
                border-green-800 
                bg-green-100
                text-green-900 
                font-light
                "
                onChange={(e) => {
                    props.setTextInput(e.target.value)
                }}
                value={props.textInput}
            />
            <button
                className="
                w-full block 
                bg-blue-500 
                hover:bg-blue-600 
                text-white 
                font-semibold 
                py-2 
                px-4 
                mt-4
                rounded"
                onClick={props.handleCallUser}
            >
                Call User
            </button>
        </>
    )
}

function IncomingCallNotification({ handleDecline, handleAnswer }) {
    return (
        <div>
            <h2 className="text-md font-semibold text-center text-green-800 mt-4">Incoming Call</h2>
            <div className="flex w-full justify-center items-center">
                <button
                    className=" w-full block 
                    bg-red-500
                    hover:bg-red-600 
                    text-white 
                    font-semibold 
                    py-2 
                    px-4 
                    mt-4
                    rounded"
                    onClick={handleDecline}
                >
                    Decline
                </button>
                <button
                    className="font-normal 
                    rounded 
                    text-green-200 
                    py-2 
                    px-4 
                    mt-4
                    bg-green-700"
                    onClick={handleAnswer}
                >
                    Answer
                </button>
            </div>
        </div>
    )
}

export default App

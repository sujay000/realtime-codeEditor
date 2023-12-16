import { io } from 'socket.io-client'
import { BACKEND_PORT } from './constants'

const URL = `http://localhost:${BACKEND_PORT}`

export const socket = io(URL)

import { io } from "socket.io-client";

const URL = "http://167.99.141.123:3001";
// const URL = "http://localhost:3001";
let socket = io(URL, { autoConnect: false });


export default socket;
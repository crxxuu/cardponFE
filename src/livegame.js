import Header from "./components/header";
import { useContext, useEffect, useRef, useState } from 'react';
import { socketContext } from "./socketContext";
import Peer from 'simple-peer'
import axios from "axios";
import { BASE_URL } from "./baseurl";
export default function LiveGame() {
    
    const [leftOpen, setLeftOpen] = useState(false);
    const [rightOpen, setRightOpen] = useState(false);
    const [leftMessage, setLeftMessage] = useState('');
    const [rightMessage, setRightMessage] = useState('');
    const [currentOpponent,setCurrentOpponent]=useState('')
    const {socketRef,profile}=useContext(socketContext)
    const localStream=useRef();
    const peers=useRef({});
    const localVideoRef = useRef(null);
    const [messages,setMessages]=useState([])
    const streams=useRef([])
 


    useEffect(()=>{
if(socketRef?.current){
    getLocalStream();
    socketRef?.current?.emit("getOpponent",profile)
    socketRef?.current?.on("getOpponent",async(data)=>{
if(data?.email){
    let response=await axios.get(`${BASE_URL}/getOpponent/${data?.email}`)
        setCurrentOpponent(response.data.user)
}
    })

    socketRef?.current?.on("sendMessage",(data)=>{
        console.log("message recieved")
        console.log(data)
setMessages((prev)=>{
    let old=[...prev]
    old=[...old,{...data, color: 'text-green-500'}]
    return old
})
    })
    socketRef?.current?.on("conn-init",(data)=>{
        console.log('conn-init')
        console.log(data)
        prePareConnection(data.connUserId,true)
    })
    
    
    socketRef?.current?.on('signal',(data)=>{
        console.log('Signal received from', data.connUserId);
        console.log("Signal recieve")
        console.log(data)
        peers.current[data.connUserId].signal(data.signal)
    })
   
    socketRef?.current?.on("closeVideo",(data)=>{
        console.log("close video")
        console.log(data)
        let {socketId}=data;
removePeers(socketId)
    })
}

    },[socketRef?.current])

    useEffect(()=>{
console.log("PROFILE")
console.log(profile)
    },[])


    const removePeers=(socketId)=>{
if(peers.current[socketId]){
    peers.current[socketId].destroy();
    delete peers.current[socketId]
alert("Opponent has left the game")
window.location.href="/"
}
    }

    const getLocalStream = async () => {
        try {
            const constraints = {
                video: true,
                audio: false
            };
            if(socketRef?.current){
                navigator.mediaDevices.getUserMedia(constraints).then((stream)=>{
                    console.log("navigator")
                    localStream.current=stream
                    socketRef?.current?.emit("startMatch")
                   

                        socketRef?.current.on('startMatch',async(data)=>{
                            setTimeout(()=>{
                                console.log("STARTMATCH")
                                console.log(data)
                                prePareConnection(data.connUserId,false);
                                socketRef?.current?.emit("conn-init",data)
                            },1000)
                        })  
                  
                
                
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream.current;
                }
                })
            }
          
        } catch (err) {
            console.error("Error accessing media devices:", err);
        }
    };
const prePareConnection=async(connUserId,initiator)=>{
    console.log("prepareConnection function")
    console.log(connUserId)
    console.log(initiator)
peers.current[connUserId]=new Peer({
    initiator,
    config:{
        iceServers:[
            {
                urls:'stun:stun.l.google.com:19302'
            }
        ]
    },
    stream:localStream.current
})

peers.current[connUserId].on('stream', (stream) => {
    console.log('stream')
    console.log(stream)
    streams.current = [...streams.current, stream];
    let videoContainer = document.querySelector('#videoContainer');
    let newVideoPlayerDiv = document.createElement('div');
    newVideoPlayerDiv.id = connUserId;
    newVideoPlayerDiv.className = "h-[50%] w-full inset-0 text-center bg-black flex items-center justify-center";
    let newVideoPlayer = document.createElement('video');
    newVideoPlayer.srcObject = stream;
    newVideoPlayer.className=`w-full`
    newVideoPlayer.id = `video-${connUserId}`;  
    newVideoPlayerDiv.appendChild(newVideoPlayer);
    videoContainer.appendChild(newVideoPlayerDiv);
    newVideoPlayer.play().catch((err) => {
        console.error('Error playing video:', err);
    });
});
console.log('peers')
console.log(peers.current)

peers.current[connUserId].on('signal',(data)=>{
    console.log('signal event')
    console.log(data)
    console.log('Signal sent to', connUserId);
let signalData={
    signal:data,
    connUserId
}

socketRef?.current?.emit('signal',signalData)

})

}

const sendMessage=async()=>{
try{
    let data={
        ...profile,
        message:leftMessage
    }
    socketRef?.current?.emit("sendMessage",data)
    setLeftMessage("")
}catch(e){

}
}

    return (
        <div className="w-full p-[20px] relative">
            <Header />



          
            <div className="w-full bg-green-700 lg:p-[20px] mt-[10px] min-h-[800px] flex gap-[20px] relative">
                <div className="md:hidden flex justify-between mb-4 absolute top-0 left-0 w-full z-[9999]">
                    <button
                        onClick={() => setLeftOpen(!leftOpen)}
                        className="bg-black p-2 rounded flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="text-white">Players</span>
                    </button>
                    <button
                        onClick={() => setRightOpen(!rightOpen)}
                        className="bg-black p-2 rounded flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-white">Chat</span>
                    </button>
                </div>
                
                <div className={`md:flex flex-col w-80 bg-black p-4 ${leftOpen ? 'absolute left-0 top-0 h-full z-50' : 'hidden'}`}>
                    <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-black rounded-full overflow-hidden">
    <img className="w-full h-full object-cover" src={currentOpponent?.avatar} />
</div>

                        <div>
                            <h3 className="text-white text-lg">{currentOpponent?.userName}</h3>
                            <div className="flex gap-2">
                                <span className="text-green-500 text-sm">W:{' '+currentOpponent?.recentMatchHistory?.filter(u=>u?.winBy==profile?._id)?.length}</span>
                                <span className="text-red-500 text-sm">L:{' '+currentOpponent?.recentMatchHistory?.filter(u=>u?.winBy!=profile?._id)?.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                        {messages?.map((msg, i) => (
                            <div key={i} className="mb-3">
                                <span className={`${msg?.color} font-bold`}>{msg?.by}: </span>
                                <span className="text-white font-bold">{msg?.message}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-gray-800 text-white p-2 rounded"
                            placeholder="Type message..."
                            value={leftMessage}
                            onChange={(e) => setLeftMessage(e.target.value)}
                        />
                        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
                            Send
                        </button>
                    </div>
                </div>

                <div id="videoContainer" className="flex-grow text-center bg-black relative justify-center items-center flex-col" 
                 style={{ width: '100%', margin: '0 auto' }}>
               
                <div className="h-[50%] inset-0 text-center bg-black flex items-center justify-center">
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="h-full w-full object-contain"
                    />
                </div>
            </div>

               
                <div className={`md:flex flex-col w-80 bg-black p-4 ${rightOpen ? 'absolute right-0 top-0 h-full z-50' : 'hidden'}`}>
                    <h2 className="text-white text-xl mb-4 font-bold">LIVE CHAT</h2>

                    {/* <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                        {messages?.map((msg, i) => (
                            <div key={i} className="mb-3">
                                <span className={`${msg.color} font-bold`}>{msg?.by}: </span>
                                <span className="text-white font-bold">{msg?.message}</span>
                            </div>
                        ))}
                    </div> */}

                    {/* <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-gray-800 text-white p-2 rounded"
                            placeholder="Type message..."
                            value={rightMessage}
                            onChange={(e) => setRightMessage(e.target.value)}
                        />
                        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
                            Send
                        </button>
                    </div> */}
                </div>
            </div>

           
            {(leftOpen || rightOpen) && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => {
                        setLeftOpen(false);
                        setRightOpen(false);
                    }}
                ></div>
            )}
        </div>
    )
}
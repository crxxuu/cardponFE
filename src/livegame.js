import Header from "./components/header";
import { useContext, useEffect, useRef, useState } from 'react';
import { useHMSNotifications } from "@100mslive/react-sdk";
import { socketContext } from "./socketContext";
import Peer from './Peer'
import axios from 'axios'
import { BASE_URL } from "./baseurl";
import { useHMSActions } from "@100mslive/react-sdk";
import { selectPeers, selectLocalPeer, selectIsLocalVideoEnabled, useHMSStore } from "@100mslive/react-sdk";
import WinLossPopup from "./components/WinLossReport";

export default function LiveGame() {
    const hmsActions = useHMSActions();
    const [leftOpen, setLeftOpen] = useState(false);
    const peers = useHMSStore(selectPeers);
    const localPeer = useHMSStore(selectLocalPeer);
    const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);
    const [rightOpen, setRightOpen] = useState(false);
    const [spectatorMessages,setSpectatorMessages]=useState([])
    const [leftMessage, setLeftMessage] = useState('');
    const [liveStreamRoomId,setLiveStreamRoomId]=useState("")
    const [countdown, setCountdown] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [adminSettings,setAdminSettings]=useState({})
    const [currentOpponent,setCurrentOpponent]=useState()
   
    const [connectionStatus, setConnectionStatus] = useState({
        localConnected: false,
        opponentConnected: false,
        bothConnected: false
    });

    const [showEndMatchPopup,setEndMatchPopup]=useState(false)
   
    const [reconnectionStatus, setReconnectionStatus] = useState({
        isWaiting: false,
        disconnectedPeer: null,
        timeLeft: 0,
        winner: null,
        showWinLoss: false
    });
    
    const {socketRef,profile}=useContext(socketContext)
    const localStream=useRef();
    const localVideoRef = useRef(null);
    const [messages,setMessages]=useState([])
    const streams=useRef([])
    const notifications=useHMSNotifications();

   
    const countdownTimerRef = useRef(null);
    const countdownStartedRef = useRef(false);
    
   
    const reconnectionTimerRef = useRef(null);
    const reconnectionStartedRef = useRef(false);

    const toggleCamera = async () => {
        try {
            await hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled);
        } catch (error) {
            console.error("Error toggling camera:", error);
        }
    };


    const startCountdown = () => {
  
        if (countdownStartedRef.current) return;
        
        console.log("Starting countdown...");
        countdownStartedRef.current = true;
        setCountdown(5);
        setGameStarted(false);
        
       
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
        }
        
        countdownTimerRef.current = setInterval(() => {
            setCountdown((prev) => {
                console.log("Countdown:", prev);
                if (prev <= 1) {
                    clearInterval(countdownTimerRef.current);
                   
                    setCountdown("PLAY");
                    setTimeout(() => {
                        setGameStarted(true);
                        setCountdown(null);
                        countdownStartedRef.current = false;
                    }, 1000);
                    return "PLAY";
                }
                return prev - 1;
            });
        }, 1000);
    };


    const startReconnectionTimer = (disconnectedPeerName) => {
        if (reconnectionStartedRef.current) return;
        if(!adminSettings.auto_forefit) return;
        
        console.log("Starting reconnection timer for:", disconnectedPeerName);
        reconnectionStartedRef.current = true;
        
        setReconnectionStatus({
            isWaiting: true,
            disconnectedPeer: disconnectedPeerName,
            timeLeft: Number(adminSettings?.grace_period),
            winner: null,
            showWinLoss: false
        });
        
  
        if (reconnectionTimerRef.current) {
            clearInterval(reconnectionTimerRef.current);
        }
        
        reconnectionTimerRef.current = setInterval(async() => {
           
             
            setReconnectionStatus((prev) => {
                const newTimeLeft = prev.timeLeft - 1;
               
                if (newTimeLeft <= 0 && adminSettings.auto_forefit) {
                    let data = {
                        playerOne: currentOpponent?.matchAgainst?.email,
                        playerTwo: currentOpponent?.email,
                        counted: true,
                        mode: currentOpponent?.mode,
                        winBy: currentOpponent?.matchAgainst?.email,
                        roomId: currentOpponent?.roomId,
                        tch:currentOpponent?.tch
                      };
                      
                      axios.post(`${BASE_URL}/update-Match/${data.roomId}`, data)
                        .then(response => {
                          
                          console.log("Match created:", response.data);
                        })
                        .catch(error => {
                         
                          console.error("Error creating match:", error);
                        });
                    clearInterval(reconnectionTimerRef.current);
               
                    const winner = localPeer?.name || profile?.userName || "You";
                    
                    return {
                        ...prev,
                        isWaiting: false,
                        timeLeft: 0,
                        winner: winner,
                        showWinLoss: true
                    };
                }
                
                return {
                    ...prev,
                    timeLeft: newTimeLeft
                };
            });
        }, 1000);
    };


    const stopReconnectionTimer = () => {
        console.log("Stopping reconnection timer - peer reconnected");
        reconnectionStartedRef.current = false;
        
        if (reconnectionTimerRef.current) {
            clearInterval(reconnectionTimerRef.current);
            reconnectionTimerRef.current = null;
        }
        
        setReconnectionStatus({
            isWaiting: false,
            disconnectedPeer: null,
            timeLeft: 0,
            winner: null,
            showWinLoss: false
        });
    };


    const handleGameEnd = (winner) => {
        setReconnectionStatus(prev => ({
            ...prev,
            winner: winner,
            showWinLoss: true
        }));
        

        if (socketRef?.current) {
            socketRef.current.emit("gameEnded", {
                winner: winner,
                loser: winner === (localPeer?.name || profile?.userName) ? reconnectionStatus.disconnectedPeer : (localPeer?.name || profile?.userName),
                reason: "disconnection"
            });
        }
    };

    
    useEffect(() => {
        getAdminSettings();
        return () => {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
            }
            if (reconnectionTimerRef.current) {
                clearInterval(reconnectionTimerRef.current);
            }
            if (socketRef?.current) {
                socketRef.current.off("sendMessage");
                socketRef.current.off("sendSpectatorMessage");
                socketRef.current.off("shareToken");
                socketRef.current.off("startMatch");
                socketRef.current.off("liveStream");
            }
        };
    }, []);

    useEffect(()=>{
if(currentOpponent){
   
   createMatch();
}
    },[currentOpponent])
const getAdminSettings=async()=>{
    try{
let response=await axios.get(`${BASE_URL}/getMatchSettings`)
console.log("getMatchSettings")
console.log(response.data)
setAdminSettings(response.data.settings)
    }catch(e){

    }
}

const createMatch=async()=>{
    try{
        let data = {
            playerOne: currentOpponent?.matchAgainst?.email,
            playerTwo: currentOpponent?.email,
            mode: currentOpponent?.mode,
            roomId: currentOpponent?.roomId,
            tch:currentOpponent?.tch
          };
          
      await axios.post(`${BASE_URL}/createMatch`, data)
      
    }catch(e){

    }
}

    const updateConnectionStatus = () => {
        const localConnected = localPeer ? true : false;
        const opponentConnected = peers.length > 1; 
        const bothConnected = localConnected && opponentConnected;

        setConnectionStatus({
            localConnected,
            opponentConnected,
            bothConnected
        });

       
        if (bothConnected && !gameStarted && countdown === null && !countdownStartedRef.current) {
            console.log("Both players connected, starting countdown...");
            startCountdown();
        }
    };


    useEffect(() => {
        updateConnectionStatus();
    }, [peers, localPeer, gameStarted, countdown]);

 
    useEffect(() => {
        if (reconnectionStatus.showWinLoss && reconnectionStatus.winner) {
            handleGameEnd(reconnectionStatus.winner);
        }
    }, [reconnectionStatus.showWinLoss, reconnectionStatus.winner]);

    useEffect(()=>{
        if(socketRef?.current){
            socketRef.current.on("shareToken",(data)=>{
                
                joinsecondUser(data?.authToken);
               
            })


    
   
            
            socketRef.current.on("conn-init",(data)=>{
                console.log('conn-init')
                console.log(data)
            })
            
          
            socketRef.current.on("liveStream",(data)=>{
                console.log("LIVE STREAM EVENT RECIEVED")
                console.log(data)
                socketRef.current.emit("shareTracks",{roomId:data.roomId,streams,userName:profile.userName})
            })

           
        }
    },[socketRef?.current,liveStreamRoomId])



    const handleSendMessage=(data)=>{
        console.log("CALLED")
        console.log(data)
        setMessages((prev)=>{
            let old=[...prev]
            old=[...old,{...data, color: 'text-green-500'}]
            return old
        })
    }

    useEffect(()=>{
        if(socketRef?.current){
            socketRef.current.on("sendMessage",(data)=>{
                handleSendMessage(data)
            })

          

            socketRef?.current?.on("manualMatch",(data)=>{
                localStorage.setItem('authToken',data.liveStreamRoomId)
                joinsecondUser(data?.data.liveStreamRoomId)
            })
            
            socketRef?.current?.on("updatedMatchSettings",(data)=>{
                setReconnectionStatus((prev)=>{
                    let old=prev;
                    return {
                        ...old,
                        timeLeft: Number(data.grace_period)
                    }
                });

                setAdminSettings((prev)=>{
                    let old=prev;
                    return {
                        ...old,
                        auto_forefit:data.auto_forefit
                    }
                })
            })
           
        }




        return () => {
            if (socketRef?.current) {
                socketRef.current.off("sendMessage", handleSendMessage);
            }
        };
    },[socketRef?.current])



   

    useEffect(()=>{
if(localStorage.getItem('authToken') && profile){
    joinsecondUser(localStorage.getItem('authToken'))
    
}
    },[profile])

    const joinsecondUser=async(authToken)=>{
        try{
            localStorage.setItem('authToken',authToken)
            await hmsActions.join({ userName:profile.userName, authToken });
            
                socketRef.current.emit("getMatches")
            
        }catch(e){
            console.error("Error joining as second user:", e);
        }
    }

   

    const getLocalStream = async () => {
        try {
          
               console.log("GET CALLED GET LOCAL STREAM")
                socketRef.current.emit("startMatch")
                       
                socketRef.current.on('startMatch',async(data)=>{
                    
                        console.log("STARTMATCH")
                        console.log(data)
                     
                        socketRef.current.emit("conn-init",data)
                        setLiveStreamRoomId(data?.liveStreamRoomId)
                       
                      if(data?.liveStreamRoomId){
                        getCodeAndToken(data?.liveStreamRoomId);
                      }
                
                 
                })  
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStream.current;
                }
            
        } catch (err) {
            console.error("Error accessing media devices:", err);
        }
    };

    const sendMessage=async()=>{
        try{
            let data={
                ...profile,
                message:leftMessage
            }
            socketRef?.current?.emit("sendMessage",data)
            setLeftMessage("")
        }catch(e){
            console.error("Error sending message:", e);
        }
    }

    const sendSpectatorMessage=(data)=>{
        setSpectatorMessages((prev)=>{
            let old=[...prev]
            old=[...old,{...data, color: 'text-blue-500'}]
            return old
        })
    }

    useEffect(()=>{
        if(socketRef?.current){
            socketRef.current.on("sendSpectatorMessage",(data)=>{
                sendSpectatorMessage(data)
            })

            socketRef?.current?.on('endMatch',()=>{
                setEndMatchPopup(true)
            })

            setTimeout(()=>{
                socketRef?.current?.emit("findOpponent")
            },500)
            socketRef?.current?.on("findOpponent",(data)=>{
                console.log("findOpponent")
                console.log(data)
                setCurrentOpponent(data.opponent)
            })

            getLocalStream();

        }
    },[socketRef?.current])

    useEffect(() => {
        if (notifications?.type === 'PEER_JOINED') {
            console.log("Peer joined:", notifications.data);
            
          
            if (reconnectionStatus.isWaiting) {
                stopReconnectionTimer();
            }
            
            updateConnectionStatus();
        }
        
        if (notifications?.type === 'PEER_LEFT') {
            const peer = notifications.data;
            console.log("Peer left:", peer);
            
            if (peer.roleName === 'broadcaster') {
               
                console.log("Broadcaster disconnected, starting reconnection timer");
                startReconnectionTimer(peer.name);
            } else {
               
                alert(`${peer.name} left the stream`);
            }
            
            updateConnectionStatus();
        }
    }, [notifications, hmsActions, reconnectionStatus.isWaiting]);

    const getCodeAndToken=async(liveStreamRoomIdParameter)=>{
        try{
           if(localStorage.getItem('authToken')){
           }else{
          
            let response=await axios.get(`${BASE_URL}/getCodeAndToken/${liveStreamRoomIdParameter}/broadcaster`)
            console.log("GETCODEANDTOKEN")
            console.log(response.data)
            await hmsActions.join({ userName:profile.userName, authToken:response.data.token });
            localStorage.setItem('authToken',response.data.token)
            socketRef.current.emit("shareToken",{authToken:response.data.token,email:profile.email})
           }
        }catch(e){
            console.error("Error getting code and token:", e);
        }
    }

    const updateGame=async()=>{
        try{
            let data={
                playerOne:currentOpponent?.matchAgainst?.email,
                playerTwo:currentOpponent?.email,
                counted:true,
                mode:currentOpponent?.mode,
                winBy:currentOpponent?.matchAgainst?.email,
                roomId:currentOpponent?.roomId,
                tch:currentOpponent?.tch
              }
              console.log("CURRENT OPPONENT BEFORE PATCH")
              console.log(currentOpponent)
              
              let response=await axios.patch(`${BASE_URL}/update-Match/${data.roomId}`,data)
              socketRef?.current?.emit("finishMatch")
              localStorage.removeItem('authToken')
              window.location.href='/'
        }catch(e){

        }
    }

  
    const WinLossComponent = ({ winner, onClose }) => (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
                <div className={`text-6xl mb-4 ${winner === (localPeer?.name || profile?.userName) ? 'text-green-500' : 'text-red-500'}`}>
                    {winner === (localPeer?.name || profile?.userName) ? '🏆' : '😔'}
                </div>
                <h2 className={`text-3xl font-bold mb-4 ${winner === (localPeer?.name || profile?.userName) ? 'text-green-600' : 'text-red-600'}`}>
                    {winner === (localPeer?.name || profile?.userName) ? 'YOU WIN!' : 'YOU LOSE!'}
                </h2>
                <p className="text-gray-600 mb-6">
                    {winner === (localPeer?.name || profile?.userName) 
                        ? 'Your opponent disconnected and failed to reconnect in time.'
                        : 'You disconnected and failed to reconnect in time.'}
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={updateGame}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={updateGame}
                        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                    >
                        Play Again
                    </button>
                </div>
            </div>
        </div>
    );

    const endMatch=async()=>{
        try{
socketRef?.current?.emit("endMatch")
setEndMatchPopup(true)
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
                            <img className="w-full h-full object-cover" src={profile?.avatar} />
                        </div>

                        <div>
                            <h3 className="text-white text-lg">{profile?.userName}</h3>
                            <div className="flex gap-2">
                                <span className="text-green-500 text-sm">W:{profile?.recentMatchHistory?.filter(u=>u?.winBy==profile?._id && u?.counted===true)?.length}</span>
                                <span className="text-red-500 text-sm">L:{profile?.recentMatchHistory?.filter(u=>u?.winBy!=profile?._id && u?.counted===true)?.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                        {messages?.map((msg, i) => (
                            <div key={i} className="mb-3">
                                <span className={`${msg.color} font-bold`}>{msg?.by}: </span>
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
                            disabled={profile?.status=="Muted"?true:profile?.status=="Banned"?true:false}
                            onChange={(e) => setLeftMessage(e.target.value)}
                        />
                        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
                            Send
                        </button>
                    </div>
                </div>

                <div id="videoContainer" className="flex-grow text-center bg-black relative justify-center items-center flex-col" 
                     style={{ width: '100%', margin: '0 auto' }}>
                    
                    {/* Connection Status Indicator */}
                    <div className="absolute top-4 left-4 z-20">
                        <div className="bg-black/80 rounded-lg p-3 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${connectionStatus.localConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm">You: {connectionStatus.localConnected ? 'Connected' : 'Disconnected'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${connectionStatus.opponentConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm">Opponent: {connectionStatus.opponentConnected ? 'Connected' : 'Waiting...'}</span>
                            </div>
                            {connectionStatus.bothConnected && (
                                <div className="mt-2 text-center">
                                    <span className="text-green-400 text-xs font-bold">✓ Both Players Ready</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reconnection Timer Overlay */}
                    {reconnectionStatus.isWaiting && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
                            <div className="text-center bg-black/90 p-8 rounded-lg">
                                <div className="text-6xl mb-4">⏱️</div>
                                <div className="text-4xl font-bold text-yellow-400 mb-4 animate-pulse">
                                    {reconnectionStatus.timeLeft}
                                </div>
                                <div className="text-xl text-white font-semibold mb-2">
                                    Waiting for {reconnectionStatus.disconnectedPeer} to reconnect...
                                </div>
                                <div className="text-sm text-gray-300">
                                    Game will end if they don't return in time
                                </div>
                                <div className="mt-4 bg-yellow-500 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-red-500 h-full transition-all duration-1000 ease-linear"
                                        style={{ width: `${((30 - reconnectionStatus.timeLeft) / 30) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Countdown Timer Overlay */}
                    {countdown !== null && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
                            <div className="text-center">
                                <div className={`text-8xl font-bold mb-4 ${
                                    countdown === "PLAY" 
                                        ? "text-green-400 animate-bounce" 
                                        : "text-white animate-pulse"
                                }`}>
                                    {countdown}
                                </div>
                                <div className="text-2xl text-white font-semibold">
                                    {countdown === "PLAY" ? "Game Started!" : "Match Starting..."}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Game Started Indicator */}
                    {gameStarted && countdown === null && !reconnectionStatus.isWaiting && (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        <button 
            onClick={endMatch}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
            End Match
        </button>
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold animate-pulse">
            LIVE
        </div>
    </div>
)}

                    {peers.map((peer, i) => (
                        peer?.videoTrack ? <Peer key={peer.id} peer={peer} /> : null
                    ))}
                    
                    {/* Camera Controls - Only show for local peer */}
                    {localPeer && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                            <button
                                onClick={toggleCamera}
                                className={`p-3 rounded-full transition-colors ${
                                    isLocalVideoEnabled 
                                        ? 'bg-white text-black hover:bg-gray-200' 
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                                title={isLocalVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                            >
                                {isLocalVideoEnabled ? (
                                    
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                ) : (
                                   
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <div className={`md:flex flex-col w-80 bg-black p-4 ${rightOpen ? 'absolute right-0 top-0 h-full z-50' : 'hidden'}`}>
                    <h2 className="text-white text-xl mb-4 font-bold">LIVE CHAT</h2>

                    <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                        {spectatorMessages?.map((msg, i) => (
                            <div key={i} className="mb-3">
                                <span className={`${msg.color} font-bold`}>{msg?.by}: </span>
                                <span className="text-white font-bold">{msg?.message}</span>
                            </div>
                        ))}
                    </div>
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
{showEndMatchPopup?<WinLossPopup
  isVisible={true}
  isWin={true}
  currentOpponent={currentOpponent}
  socketRef={socketRef}
  playerName={profile?.userName}
  opponentName={currentOpponent?.userName}
  onReportResult={(result) => {
    console.log('Reported result:', result);
    
  }}
  disconnectionReason={null} 
  canReport={true} 
  onReport={(reason) => {
    console.log('Report submitted:', reason);
   
  }}
/>:''}
            {/* Win/Loss Modal */}
            {reconnectionStatus.showWinLoss && reconnectionStatus.winner && (
                <WinLossComponent 
                currentOpponent={currentOpponent}
                    winner={reconnectionStatus.winner}
                    onClose={() => window.location.href = "/"}
                />
            )}
        </div>
    )
}


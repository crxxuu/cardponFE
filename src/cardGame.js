// import Header from "./components/header";
// import pokemon from "./pokemon.png";
// import { socketContext } from "./socketContext";
// import { useContext, useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from 'axios'
// import { BASE_URL } from "./baseurl";

// export default function CardGame() {
//     const { socketRef, socket, profile} = useContext(socketContext);
//     const [matches, setMatches] = useState([]);
//     const [matchSettings, setMatchSettings] = useState();
//     const [users, setUsers] = useState([]);
//     const listenerAdded = useRef(false); 
//     const navigate = useNavigate();

//     useEffect(() => {
//         if (socketRef?.current && !listenerAdded.current) {
//             console.log("Setting up socket listener...");
//             socketRef?.current?.emit("getUsers");
            
//             socketRef?.current?.on("getUsers", (data) => {
//                 console.log("getUsers");
//                 console.log(data);
//                 setUsers(data);
//             });
            
//             socketRef?.current?.on("updatedSpectatorInteractionControls", (data) => {
//                 setMatchSettings((prev) => {
//                     let old = prev;
//                     old = data;
//                     return old;
//                 });
//             });
            
      
//             const handleGetMatches = (data) => {
//                 console.log('Received matches data:', data);
                
              
//                 if (Array.isArray(data) && data.length > 0) {
//                     console.log("Updating matches state");
//                     setMatches(data); 
//                 } else {
//                     setMatches([]);
//                 }
//             };

         
//             socketRef.current.on('getMatches', handleGetMatches);
            
          
//             socketRef.current.emit("getMatches");
            
          
//             listenerAdded.current = true;
            
          
//             return () => {
//                 console.log("Removing socket listener...");
//                 socketRef.current.off('getMatches', handleGetMatches);
//                 listenerAdded.current = false;
//             };
//         }
//     }, [socketRef.current, socket]); 

//     useEffect(() => {
//         getMatchSettings();
//     }, []);

//     const getMatchSettings = async () => {
//         try {
//             let response = await axios.get(`${BASE_URL}/getMatchSettings`);
//             console.log("getMatchSettings");
//             console.log(response.data);
//             setMatchSettings(response.data.settings);
//         } catch (e) {
//             console.error("Error fetching match settings:", e);
//         }
//     };

//     const getSpectatorCount = (roomId) => {
//         return users.filter(user => user?.roomId === roomId).length;
//     };

//     const canWatchMatch = (roomId) => {
//         if (!matchSettings?.enable_spectator_settings) {
//             return false;
//         }
        
//         const spectatorCount = getSpectatorCount(roomId);
//         return spectatorCount < matchSettings?.max_spectators;
//     };

//     const getWatchStatus = (roomId) => {
//         if (!matchSettings?.enable_spectator_settings) {
//             return null; 
//         }
        
//         const spectatorCount = getSpectatorCount(roomId);
//         if (spectatorCount >= matchSettings?.max_spectators) {
//             return "Room Full";
//         }
        
//         return "Watch Now";
//     };

//     return (
//         <div className='w-full px-[10px]'>
//             <Header />
//             <div className='w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-[#2cac4f] min-h-[95vh] flex justify-center flex-col lg:flex-row lg:gap-[2rem] gap-[30px]'>
               
//                 {/* Main Content */}
//                 <div className='flex flex-col w-full h-full gap-[6px] relative flex-1'>
//                     {matches.length === 0 ? (
//                         <div className="text-white text-center py-10">
//                             No active matches found
//                         </div>
//                     ) : (
//                         matches.map((val, i) => {
//                             const roomId = val?.liveStreamRoomId;
//                             const watchStatus = getWatchStatus(roomId);
//                             const canWatch = canWatchMatch(roomId);
                            
//                             return (
//                                 <div key={`${val.socketId}-${i}`} className="w-full h-full">
//                                     <div className="flex gap-[10px] items-center lg:items-stretch w-full lg:flex-row flex-col lg:justify-center">
//                                         <div className="lg:w-[10%] w-full h-full bg-black flex justify-center items-center py-4">
//                                             <img 
//                                                 src={val?.image?val?.image:'Logo.png'} 
//                                                 alt="pokemon" 
//                                                 className="w-full h-full object-contain" 
//                                             />
//                                         </div>
//                                         <div className="lg:w-[80%] w-full h-[inherit] bg-black p-[10px]">
//                                             <p className="text-white font-bold text-[14px] lg:text-[16px]">
//                                                 {val?.userName} vs {val?.matchAgainst?.userName}
//                                                 {watchStatus && (
//                                                     <span 
//                                                         onClick={canWatch ? () => navigate(`/watchgame?playerOne=${val?.socketId}&playerTwo=${val?.matchAgainst?.socketId}&liveStreamRoomId=${val?.liveStreamRoomId}`) : undefined}
//                                                         className={`ml-2 ${
//                                                             canWatch 
//                                                                 ? 'text-blue-400 cursor-pointer hover:text-blue-300' 
//                                                                 : 'text-red-400 cursor-not-allowed'
//                                                         }`}
//                                                     >
//                                                         ({watchStatus})
//                                                     </span>
//                                                 )}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             );
//                         })
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

import Header from "./components/header";
import pokemon from "./pokemon.png";
import { socketContext } from "./socketContext";
import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { BASE_URL } from "./baseurl";

export default function CardGame() {
    const { socketRef, socket, profile} = useContext(socketContext);
    const [matches, setMatches] = useState([]);
    const [matchSettings, setMatchSettings] = useState();
    const [users, setUsers] = useState([]);
    const listenerAdded = useRef(false); 
    const navigate = useNavigate();

    useEffect(() => {
        if (socketRef?.current && !listenerAdded.current) {
            console.log("Setting up socket listener...");
            socketRef?.current?.emit("getUsers");
            
            socketRef?.current?.on("getUsers", (data) => {
                console.log("getUsers");
                console.log(data);
                setUsers(data);
            });
            
            socketRef?.current?.on("updatedSpectatorInteractionControls", (data) => {
                setMatchSettings(data);
            });
            
            // Listen for spectator join/leave events to update user list
            socketRef?.current?.on("spectatorJoined", (data) => {
                console.log("Spectator joined:", data);
                // Refresh users list when someone joins as spectator
                socketRef?.current?.emit("getUsers");
            });
            
            socketRef?.current?.on("spectatorLeft", (data) => {
                console.log("Spectator left:", data);
                // Refresh users list when someone leaves as spectator
                socketRef?.current?.emit("getUsers");
            });
            
            // Listen for any user updates
            socketRef?.current?.on("userUpdated", (data) => {
                console.log("User updated:", data);
                socketRef?.current?.emit("getUsers");
            });
            
            const handleGetMatches = (data) => {
                console.log('Received matches data:', data);
                
                if (Array.isArray(data) && data.length > 0) {
                    console.log("Updating matches state");
                    setMatches(data); 
                } else {
                    setMatches([]);
                }
            };

            socketRef.current.on('getMatches', handleGetMatches);
            socketRef.current.emit("getMatches");
            
            listenerAdded.current = true;
            
            return () => {
                console.log("Removing socket listener...");
                socketRef.current.off('getMatches', handleGetMatches);
                socketRef.current.off('spectatorJoined');
                socketRef.current.off('spectatorLeft');
                socketRef.current.off('userUpdated');
                listenerAdded.current = false;
            };
        }
    }, [socketRef.current, socket]); 

    useEffect(() => {
        getMatchSettings();
    }, []);

    const getMatchSettings = async () => {
        try {
            let response = await axios.get(`${BASE_URL}/getMatchSettings`);
            console.log("getMatchSettings");
            console.log(response.data);
            setMatchSettings(response.data.settings);
        } catch (e) {
            console.error("Error fetching match settings:", e);
        }
    };

    // Only count actual spectators (users with spectator:true)
    const getSpectatorCount = (matchRoomId) => {
        return users.filter(user => 
            user?.roomId === matchRoomId && 
            user.spectator === true
        ).length;
    };

    // Check if a match can be watched
    const canWatchMatch = (matchRoomId) => {
        // If spectator settings are disabled, no one can watch
        if (!matchSettings?.enable_spectator_settings) {
            return false;
        }
        
        const spectatorCount = getSpectatorCount(matchRoomId);
        return spectatorCount < matchSettings?.max_spectators;
    };

    // Get watch status text
    const getWatchStatus = (matchRoomId) => {
        // If spectator settings are disabled, don't show status
        if (!matchSettings?.enable_spectator_settings) {
            return null; 
        }
        
        const spectatorCount = getSpectatorCount(matchRoomId);
        const maxSpectators = matchSettings?.max_spectators || 0;
        
        if (spectatorCount >= maxSpectators) {
            return "Room Full";
        }
        
        return `Watch Now (${spectatorCount}/${maxSpectators})`;
    };

    // Handle watch game click with additional validation
    const handleWatchGame = async (matchRoomId, playerOneId, playerTwoId, liveStreamRoomId) => {
        // Double-check spectator capacity before navigating
        const currentSpectatorCount = getSpectatorCount(matchRoomId);
        const maxSpectators = matchSettings?.max_spectators || 0;
        
        if (currentSpectatorCount >= maxSpectators) {
            alert('This match is now full. Please try another match.');
            // Refresh users data to get latest state
            socketRef?.current?.emit("getUsers");
            return;
        }
        
        // Navigate to watch game
        navigate(`/watchgame?playerOne=${playerOneId}&playerTwo=${playerTwoId}&liveStreamRoomId=${liveStreamRoomId}`);
    };

    // Add interval to periodically refresh users data for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            if (socketRef?.current) {
                socketRef.current.emit("getUsers");
            }
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, [socketRef]);

    // Show all matches but handle capacity check on click
    const getDisplayMatches = () => {
        return matches;
    };

    return (
        <div className='w-full px-[10px]'>
            <Header />
            <div className='w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-[#2cac4f] min-h-[95vh] flex justify-center flex-col lg:flex-row lg:gap-[2rem] gap-[30px]'>
                <div className='flex flex-col w-full h-full gap-[6px] relative flex-1'>
                    {getDisplayMatches().length === 0 ? (
                        <div className="text-white text-center py-10">
                            No active matches found
                        </div>
                    ) : (
                        getDisplayMatches().map((val, i) => {
                            const matchRoomId = val?.roomId; // Use roomId instead of liveStreamRoomId
                            const watchStatus = getWatchStatus(matchRoomId);
                            const canWatch = canWatchMatch(matchRoomId);
                            const spectatorCount = getSpectatorCount(matchRoomId);
                            const maxSpectators = matchSettings?.max_spectators || 0;
                            
                            return (
                                <div key={`${val.socketId}-${i}`} className="w-full h-full">
                                    <div className="flex gap-[10px] items-center lg:items-stretch w-full lg:flex-row flex-col lg:justify-center">
                                        <div className="lg:w-[10%] w-full h-full bg-black flex justify-center items-center py-4">
                                            <img 
                                                src={val?.image?val?.image:'Logo.png'} 
                                                alt="pokemon" 
                                                className="w-full h-full object-contain" 
                                            />
                                        </div>
                                        <div className="lg:w-[80%] w-full h-[inherit] bg-black p-[10px]">
                                            <p className="text-white font-bold text-[14px] lg:text-[16px]">
                                                {val?.userName} vs {val?.matchAgainst?.userName}
                                                {matchSettings?.enable_spectator_settings && (
                                                    <span 
                                                        onClick={canWatch ? () => handleWatchGame(
                                                            matchRoomId,
                                                            val?.socketId, 
                                                            val?.matchAgainst?.socketId, 
                                                            val?.liveStreamRoomId
                                                        ) : undefined}
                                                        className={`ml-2 ${
                                                            canWatch 
                                                                ? 'text-blue-400 cursor-pointer hover:text-blue-300' 
                                                                : 'text-red-400 cursor-not-allowed'
                                                        }`}
                                                        title={canWatch ? 'Click to watch this match' : 'Maximum spectators reached'}
                                                    >
                                                        ({spectatorCount >= maxSpectators ? 'Room Full' : `Watch (${spectatorCount}/${maxSpectators})`})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
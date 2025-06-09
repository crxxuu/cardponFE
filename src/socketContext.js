// import { createContext, useEffect, useState,useRef } from 'react';
// import { io } from 'socket.io-client';
// import { BASE_URL } from './baseurl';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import WarningPopup from './components/warningPopup';

// export const socketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const [profile, setProfile] = useState(null);  
//   const [socket,setSocket]=useState(null)
//   const socketRef = useRef(null);
//   const [showWarning, setShowWarning] = useState(false);
//   const localStream=useRef()
//   const navigate=useNavigate()
// const [popupData,setPopupData]=useState({
//   warnings:0,
//   userId:''
// })

//   const peers=useRef({});
//   useEffect(() => {
//     const socket = io(BASE_URL);

//     console.log("SOCKET")
//     console.log(socket)
//     setSocket(socket)
//     socketRef.current = socket;

//     socket.on('connect', () => {
//       console.log('Socket connected:', socket.id);
//     });

//     socket.on("handleWarning",()=>{
//       console.log("HANDLEWARNING")
//       setShowWarning(true)
//     })

// let token=localStorage.getItem('token')
//    if(token){
//     getProfile();
//    }
//    socket.on("handleUserStatus",(data)=>{
//     console.log("HANDLEUSERSTATUS")
//     console.log(data)
//     setProfile((prev)=>{
//       let old=prev;
//       old={
//         ...old,
//         status:data.status
//       }
//       return old
//     })
//     if(data.status=="Banned"){
//       localStorage.removeItem('token')
//       localStorage.removeItem('authToken')
//       setShowWarning(true)
//     }
//    })

//     return () => {
//       socket.disconnect();
//       console.log('Socket disconnected');
//     };
//   }, []);

//   const getProfile = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const headers = {
//         headers: {
//           authorization: `Bearer ${token}`,
//         },
//       };
//       const res = await axios.get(`${BASE_URL}/getProfile`, headers);
//       console.log("PROFILE")
//       console.log(res.data)
// if(res.data.user){
//   setPopupData({
//     userId:res.data.user._id,
//     warnings:res.data.user.warnings
//   })
// let result=Number(res.data.user.warnings)-Number(res.data.user.prevWarnings)
// if(result>0){
//   setShowWarning(true)
// }
// }

//       let data={
//         ...res.data.user,
//         subscription:res.data.subscription
//       }
     
//       socketRef?.current?.emit("connectUser",{email:res.data.user.email,userName:data.userName})
//       socketRef.current.on("manualMatch",async(data)=>{

 
//    let response=await axios.get(`${BASE_URL}/getCodeAndToken/${data.liveStreamRoomId}/broadcaster`)

//    localStorage.setItem('authToken',response.data.token)
//       navigate('/livegame')
//       })
//       setProfile(data);
//       // socketRef?.current?.emit("manualMatch")
  
//     } catch (e) {
//       console.error('Error fetching profile:', e);
//     }
//   };

//   return (
//     <socketContext.Provider value={{socket,socketRef, profile, localStream, peers }}>
//       {children}

//       {showWarning?<WarningPopup popupData={popupData} showWarning={showWarning} setShowWarning={setShowWarning}/>:''}
//     </socketContext.Provider>
//   );
// };




//second
// import { createContext, useEffect, useState, useRef } from 'react';
// import { io } from 'socket.io-client';
// import { BASE_URL } from './baseurl';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import WarningPopup from './components/warningPopup';

// export const socketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const [profile, setProfile] = useState(null);  
//   const [socket, setSocket] = useState(null);
//   const socketRef = useRef(null);
//   const [showWarning, setShowWarning] = useState(false);
//   const localStream = useRef();
//   const navigate = useNavigate();
//   const [popupData, setPopupData] = useState({
//     warnings: 0,
//     userId: ''
//   });
  

//   const adScriptRef = useRef(null);
//   const adLoadingRef = useRef(false);
//   const adTimeoutRef = useRef(null);
//   const peers = useRef({});

//   const handleScriptError = (error, source = 'unknown') => {
//     console.warn(`Script error from ${source}:`, error);
   
//     return true; 
//   };

 
//   const loadAdScript = () => {

//     if (adLoadingRef.current || adScriptRef.current || document.querySelector('[data-zone="151276"]')) {
//       return;
//     }

//     adLoadingRef.current = true;

//     try {
//       const script = document.createElement('script');
//       script.src = 'https://fpyf8.com/88/tag.min.js';
//       script.setAttribute('data-zone', '151276');
//       script.async = true;
//       script.setAttribute('data-cfasync', 'false');
      
    
//       script.onerror = (error) => {
//         console.warn('Ad script failed to load:', error);
//         adLoadingRef.current = false;
//         adScriptRef.current = null;
       
//         if (adTimeoutRef.current) {
//           clearTimeout(adTimeoutRef.current);
//           adTimeoutRef.current = null;
//         }
//       };

//       script.onload = () => {
//         console.log('Ad script loaded successfully');
//         adLoadingRef.current = false;
        
//         if (adTimeoutRef.current) {
//           clearTimeout(adTimeoutRef.current);
//           adTimeoutRef.current = null;
//         }
//       };

      
//       adTimeoutRef.current = setTimeout(() => {
//         if (adLoadingRef.current) {
//           console.warn('Ad script loading timeout');
//           adLoadingRef.current = false;
//         }
//       }, 10000); 

 
//       document.head.appendChild(script);
//       adScriptRef.current = script;

//       console.log('Ad script loading initiated for non-subscribed user');
//     } catch (error) {
//       console.warn('Error creating ad script:', error);
//       adLoadingRef.current = false;
//     }
//   };

 
//   const removeAdScript = () => {
//     try {
     
//       if (adTimeoutRef.current) {
//         clearTimeout(adTimeoutRef.current);
//         adTimeoutRef.current = null;
//       }

//       adLoadingRef.current = false;

     
//       if (adScriptRef.current && adScriptRef.current.parentNode) {
//         adScriptRef.current.parentNode.removeChild(adScriptRef.current);
//         adScriptRef.current = null;
//         console.log('Ad script removed for subscribed user');
//       }

     
//       const existingScript = document.querySelector('[data-zone="151276"]');
//       if (existingScript && existingScript.parentNode) {
//         existingScript.parentNode.removeChild(existingScript);
//       }

     
//       removeAdElements();
//     } catch (error) {
//       console.warn('Error removing ad script:', error);
//     }
//   };


//   const removeAdElements = () => {
//     try {
//       const adSelectors = [
//         '[id*="monetag"]',
//         '[class*="monetag"]',
//         '[id*="fpyf8"]',
//         '[class*="fpyf8"]',
//         '[data-zone="151276"]'
//       ];

//       adSelectors.forEach(selector => {
//         try {
//           const elements = document.querySelectorAll(selector);
//           elements.forEach(element => {
//             try {
//               if (element && element.parentNode) {
//                 element.parentNode.removeChild(element);
//               }
//             } catch (e) {
//               console.warn('Error removing individual ad element:', e);
//             }
//           });
//         } catch (e) {
//           console.warn(`Error with selector ${selector}:`, e);
//         }
//       });
//     } catch (error) {
//       console.warn('Error removing ad elements:', error);
//     }
//   };

  
//   const manageAds = (userProfile) => {
//     try {
//       if (!userProfile || !userProfile.subscription) {
       
//         loadAdScript();
//         return;
//       }

//       const isSubscribed = userProfile.subscription && !userProfile.subscription.cancelled;
      
//       if (isSubscribed) {
       
//         removeAdScript();
//       } else {
        
//         loadAdScript();
//       }
//     } catch (error) {
//       console.warn('Error managing ads:', error);
//     }
//   };

//   useEffect(() => {
 
//     const handleUnhandledRejection = (event) => {
//       console.warn('Unhandled promise rejection:', event.reason);
//       event.preventDefault(); 
//     };

    
//     const handleGlobalError = (event) => {
     
//       if (event.filename && event.filename.includes('fpyf8.com')) {
//         console.warn('Ad script error caught:', event.error);
//         event.preventDefault();
//         return true;
//       }
//       return false;
//     };

//     window.addEventListener('unhandledrejection', handleUnhandledRejection);
//     window.addEventListener('error', handleGlobalError);

//     const socket = io(BASE_URL);

//     console.log("SOCKET");
//     console.log(socket);
//     setSocket(socket);
//     socketRef.current = socket;

//     socket.on('connect', () => {
//       console.log('Socket connected:', socket.id);
//     });

//     socket.on("handleWarning", () => {
//       console.log("HANDLEWARNING");
//       setShowWarning(true);
//     });

//     let token = localStorage.getItem('token');
//     if (token) {
//       getProfile();
//     } else {
     
//       setTimeout(() => loadAdScript(), 1000); 
//     }

//     socket.on("handleUserStatus", (data) => {
//       console.log("HANDLEUSERSTATUS");
//       console.log(data);
//       setProfile((prev) => {
//         let old = { ...prev }; 
//         old.status = data.status;
//         return old;
//       });
//       if (data.status === "Banned" || data.status=="Deleted") {
//         localStorage.removeItem('token');
//         localStorage.removeItem('authToken');
//         setShowWarning(true);
//       }
//     });

//     return () => {
//       // Cleanup
//       socket.disconnect();
//       console.log('Socket disconnected');
      
//       // Clean up ad script on unmount
//       removeAdScript();
      
//       // Remove event listeners
//       window.removeEventListener('unhandledrejection', handleUnhandledRejection);
//       window.removeEventListener('error', handleGlobalError);
//     };
//   }, []);

//   // Watch for profile changes to manage ads
//   useEffect(() => {
//     if (profile) {
//       // Add a small delay to ensure profile is fully set
//       setTimeout(() => manageAds(profile), 100);
//     }
//   }, [profile]);

//   const getProfile = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const headers = {
//         headers: {
//           authorization: `Bearer ${token}`,
//         },
//       };
//       const res = await axios.get(`${BASE_URL}/getProfile`, headers);
//       console.log("PROFILE");
//       console.log(res.data);

//       if (res.data.user) {
//         setPopupData({
//           userId: res.data.user._id,
//           warnings: res.data.user.warnings
//         });
//         let result = Number(res.data.user.warnings) - Number(res.data.user.prevWarnings);
//         if (result > 0) {
//           setShowWarning(true);
//         }
//       }

//       let data = {
//         ...res.data.user,
//         subscription: res.data.subscription
//       };

//       socketRef?.current?.emit("connectUser", {
//         email: res.data.user.email,
//         userName: data.userName
//       });

//       socketRef.current.on("manualMatch", async (matchData) => {
//         try {
//           let response = await axios.get(`${BASE_URL}/getCodeAndToken/${matchData.liveStreamRoomId}/broadcaster`);
//           localStorage.setItem('authToken', response.data.token);
//           navigate('/livegame');
//         } catch (error) {
//           console.error('Error in manualMatch:', error);
//         }
//       });

//       setProfile(data);
      
//     } catch (e) {
//       console.error('Error fetching profile:', e);
//       // If profile fetch fails, show ads by default after a delay
//       setTimeout(() => loadAdScript(), 1000);
//     }
//   };

//   return (
//     <socketContext.Provider value={{ socket, socketRef, profile, localStream, peers }}>
//       {children}
//       {showWarning ? (
//         <WarningPopup 
//           popupData={popupData} 
//           showWarning={showWarning} 
//           setShowWarning={setShowWarning} 
//         />
//       ) : null}
//     </socketContext.Provider>
//   );
// };







import { createContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { BASE_URL } from './baseurl';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import WarningPopup from './components/warningPopup';
import adManager from './components/adsmanager'; 

export const socketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);  
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const localStream = useRef();
  const navigate = useNavigate();
  const [popupData, setPopupData] = useState({
    warnings: 0,
    userId: ''
  });
  
  const peers = useRef({});

  useEffect(() => {
    
    const handleUnhandledRejection = (event) => {
      const reason = event.reason?.toString() || '';
      
      if (reason.includes('adex timeout') || reason.includes('monetag') || reason.includes('fpyf8')) {
        console.warn('Ad-related promise rejection (suppressed):', event.reason);
        event.preventDefault();
        return;
      }
      
      console.warn('Unhandled promise rejection:', event.reason);
      event.preventDefault(); 
    };

    const handleGlobalError = (event) => {
      const message = event.message?.toString() || '';
      const filename = event.filename?.toString() || '';
      
      if (filename.includes('fpyf8.com') || 
          filename.includes('monetag') ||
          message.includes('adex timeout') ||
          message.includes('Cannot read properties of null') && filename.includes('9427')) {
        console.warn('Ad script error (suppressed):', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno
        });
        event.preventDefault();
        return true;
      }
      
      return false;
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    const socket = io(BASE_URL);

    console.log("SOCKET");
    console.log(socket);
    setSocket(socket);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on("handleWarning", () => {
      console.log("HANDLEWARNING");
      setShowWarning(true);
    });

    let token = localStorage.getItem('token');
    if (token) {
      getProfile();
    } else {
      
      adManager.setSubscriptionStatus(false);
    }

    socket.on("handleUserStatus", (data) => {
      console.log("HANDLEUSERSTATUS");
      console.log(data);
      setProfile((prev) => {
        let old = { ...prev }; 
        old.status = data.status;
        return old;
      });
      if (data.status === "Banned" || data.status === "Deleted") {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        setShowWarning(true);
        
        adManager.removeAllAds();
      }
    });

    return () => {
      socket.disconnect();
      console.log('Socket disconnected');
      
     
      adManager.destroy();
      
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);


  useEffect(() => {
    if (profile) {
      const isSubscribed = profile.subscription && !profile.subscription.cancelled;
      adManager.setSubscriptionStatus(isSubscribed);
    }
  }, [profile]);

  const getProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.get(`${BASE_URL}/getProfile`, headers);
      console.log("PROFILE");
      console.log(res.data);

      if (res.data.user) {
        setPopupData({
          userId: res.data.user._id,
          warnings: res.data.user.warnings
        });
        let result = Number(res.data.user.warnings) - Number(res.data.user.prevWarnings);
        if (result > 0) {
          setShowWarning(true);
        }
      }

      let data = {
        ...res.data.user,
        subscription: res.data.subscription
      };

      socketRef?.current?.emit("connectUser", {
        email: res.data.user.email,
        userName: data.userName
      });

      socketRef.current.on("manualMatch", async (matchData) => {
        try {
          let response = await axios.get(`${BASE_URL}/getCodeAndToken/${matchData.liveStreamRoomId}/broadcaster`);
          localStorage.setItem('authToken', response.data.token);
          navigate('/livegame');
        } catch (error) {
          console.error('Error in manualMatch:', error);
        }
      });

      setProfile(data);
      
    } catch (e) {
      console.error('Error fetching profile:', e);
      
      adManager.setSubscriptionStatus(false);
    }
  };

  return (
    <socketContext.Provider value={{ socket, socketRef, profile, localStream, peers }}>
      {children}
      {showWarning ? (
        <WarningPopup 
          popupData={popupData} 
          showWarning={showWarning} 
          setShowWarning={setShowWarning} 
        />
      ) : null}
    </socketContext.Provider>
  );
};
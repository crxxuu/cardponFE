import { createContext, useEffect, useState,useRef } from 'react';
import { io } from 'socket.io-client';
import { BASE_URL } from './baseurl';
import axios from 'axios';

export const socketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);  
  const socketRef = useRef(null);
  const localStream=useRef()
  const peers=useRef({});
  useEffect(() => {
    const socket = io(BASE_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    getProfile();

    return () => {
      socket.disconnect();
      console.log('Socket disconnected');
    };
  }, []);

  const getProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.get(`${BASE_URL}/getProfile`, headers);
      
      
      setProfile(res.data.user);
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  return (
    <socketContext.Provider value={{ socketRef, profile, localStream, peers }}>
      {children}
    </socketContext.Provider>
  );
};

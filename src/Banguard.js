import React, { useContext, useEffect } from 'react';
import { socketContext } from './socketContext';
import { Outlet } from 'react-router-dom';

const Banguard = () => {
  const { profile } = useContext(socketContext);

  const dontauthorize = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  useEffect(() => {
    if (profile?.status === "Banned" || profile?.status === "Deleted") {
      dontauthorize();
    }
  }, [profile?.status]);


  if (profile?.status === "Banned" || profile?.status === "Deleted") {
    return null;
  }

  return <Outlet />;
};

export default Banguard;
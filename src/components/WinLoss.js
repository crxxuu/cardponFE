import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../baseurl';


const WinLossPopup = ({ 
  isVisible, 
  isWin, 
  playerName, 
  opponentName, 
  onGoHome,
  disconnectionReason = null, 
  canReport = false,
  onReport
}) => {
  const [showReporting, setShowReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!isVisible) return null;

  const handleReport = async() => {
  try{
    if (reportReason.trim()) {
      onReport?.(reportReason);
      setReportSubmitted(true);
      setTimeout(() => setShowReporting(false), 2000);
    }
let response=await axios.post(`${BASE_URL}`)


  }catch(e){

  }
  };

  const getResultMessage = () => {
    if (disconnectionReason === 'disconnect') {
      return isWin 
        ? `You won! ${opponentName} disconnected and didn't return in time.`
        : `You lost due to disconnection. Better internet connection recommended.`;
    }
    if (disconnectionReason === 'forfeit') {
      return isWin 
        ? `You won! ${opponentName} forfeited the match.`
        : `You forfeited the match.`;
    }
    return isWin 
      ? `Congratulations ${playerName}! You won the match!`
      : `Better luck next time ${playerName}. You lost this match.`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-gray-600 shadow-2xl">
          
          {/* Win/Loss Icon */}
          <div className="text-center mb-6">
            {isWin ? (
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Result Text */}
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${isWin ? 'text-green-400' : 'text-red-400'}`}>
              {isWin ? 'VICTORY!' : 'DEFEAT!'}
            </h1>
            
            <p className="text-gray-300 text-lg mb-4">
              {getResultMessage()}
            </p>
            
            {disconnectionReason && (
              <div className={`text-sm px-3 py-1 rounded-full inline-block mb-4 ${
                disconnectionReason === 'disconnect' ? 'bg-orange-600/20 text-orange-400' :
                disconnectionReason === 'forfeit' ? 'bg-red-600/20 text-red-400' :
                'bg-gray-600/20 text-gray-400'
              }`}>
                {disconnectionReason === 'disconnect' ? 'Won by disconnection' :
                 disconnectionReason === 'forfeit' ? 'Won by forfeit' :
                 'Normal match end'}
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 text-center">Match Summary</h3>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">+{isWin ? '10' : '0'}</div>
                <div className="text-xs text-gray-400">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">+{isWin ? '50' : '10'}</div>
                <div className="text-xs text-gray-400">XP</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                  {isWin ? '+1' : '+0'}
                </div>
                <div className="text-xs text-gray-400">Wins</div>
              </div>
            </div>
          </div>

          {/* Reporting Section */}
          {canReport && !showReporting && !reportSubmitted && (
            <button
              onClick={() => setShowReporting(true)}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg mb-4 transition-colors"
            >
              Report Unfair Disconnection
            </button>
          )}

          {showReporting && (
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
              <h4 className="text-white font-semibold mb-3">Report Issue</h4>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe the unfair disconnection (e.g., 'Opponent disconnected when losing', 'Suspicious timing', etc.)"
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 resize-none h-20 text-sm"
                maxLength={200}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleReport}
                  disabled={!reportReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Submit Report
                </button>
                <button
                  onClick={() => setShowReporting(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {reportSubmitted && (
            <div className="mb-4 p-3 bg-green-600/20 border border-green-600 rounded-lg">
              <p className="text-green-400 text-sm text-center">
                ✓ Report submitted successfully. We'll review it shortly.
              </p>
            </div>
          )}

          {/* Home Button */}
          <button
            onClick={onGoHome}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Home
            </div>
          </button>

          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-ping"></div>
          <div className="absolute top-6 right-6 w-1 h-1 bg-purple-400 rounded-full opacity-80 animate-pulse"></div>
          <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-green-400 rounded-full opacity-70 animate-bounce"></div>
        </div>
      </div>
    </>
  );
};


const GracePeriodOverlay = ({ 
  isVisible, 
  timeLeft, 
  disconnectedPlayer,
  onCancel 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[9998] flex items-center justify-center">
      <div className="bg-gradient-to-br from-orange-800 to-red-800 rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-orange-600 shadow-2xl">
        
        {/* Warning Icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.196 14.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-orange-400 mb-4">PLAYER DISCONNECTED</h2>
          <p className="text-white text-lg mb-4">
            {disconnectedPlayer} has disconnected from the match.
          </p>
          <p className="text-orange-300 text-base mb-6">
            Waiting for reconnection...
          </p>
          
          {/* Countdown Timer */}
          <div className="bg-black/30 rounded-lg p-6 mb-6">
            <div className="text-6xl font-bold text-white mb-2 animate-pulse">
              {timeLeft}
            </div>
            <div className="text-orange-300 text-sm">
              seconds remaining
            </div>
          </div>

          <p className="text-gray-300 text-sm">
            If they don't return in time, you'll win automatically.
          </p>
        </div>

        {/* Optional Manual Forfeit */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Forfeit Match
          </button>
        )}
      </div>
    </div>
  );
};

const useDisconnectionManager = (socketRef, profile, hmsActions) => {
  const [gracePeriodState, setGracePeriodState] = useState({
    isActive: false,
    timeLeft: 0,
    disconnectedPlayer: ''
  });
  
  const [gameResult, setGameResult] = useState({
    isVisible: false,
    isWin: false,
    opponentName: '',
    disconnectionReason: null,
    canReport: false
  });

  const gracePeriodTimerRef = useRef(null);
  const GRACE_PERIOD_SECONDS = 30; 

 
  const startGracePeriod = (disconnectedPlayerName) => {
    console.log(`Starting grace period for ${disconnectedPlayerName}`);
    
    setGracePeriodState({
      isActive: true,
      timeLeft: GRACE_PERIOD_SECONDS,
      disconnectedPlayer: disconnectedPlayerName
    });

   
    if (gracePeriodTimerRef.current) {
      clearInterval(gracePeriodTimerRef.current);
    }

    
    gracePeriodTimerRef.current = setInterval(() => {
      setGracePeriodState(prev => {
        const newTimeLeft = prev.timeLeft - 1;
        
        if (newTimeLeft <= 0) {
         
          clearInterval(gracePeriodTimerRef.current);
          handleAutoForfeit(disconnectedPlayerName);
          return { ...prev, isActive: false, timeLeft: 0 };
        }
        
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    socketRef?.current?.emit('gracePeriodStarted', {
      disconnectedPlayer: disconnectedPlayerName,
      duration: GRACE_PERIOD_SECONDS
    });
  };


  const handleAutoForfeit = (disconnectedPlayerName) => {
    console.log(`Auto-forfeit: ${disconnectedPlayerName} didn't return in time`);
    
    setGameResult({
      isVisible: true,
      isWin: disconnectedPlayerName !== profile?.userName,
      opponentName: disconnectedPlayerName,
      disconnectionReason: 'disconnect',
      canReport: disconnectedPlayerName !== profile?.userName 
    });

   
    socketRef?.current?.emit('autoForfeit', {
      disconnectedPlayer: disconnectedPlayerName,
      winner: profile?.userName
    });
  };


  const handleReconnection = (reconnectedPlayerName) => {
    console.log(`${reconnectedPlayerName} reconnected successfully`);
    
    
    if (gracePeriodTimerRef.current) {
      clearInterval(gracePeriodTimerRef.current);
    }
    
    setGracePeriodState({
      isActive: false,
      timeLeft: 0,
      disconnectedPlayer: ''
    });


    socketRef?.current?.emit('playerReconnected', {
      reconnectedPlayer: reconnectedPlayerName
    });
  };


  const handleManualForfeit = () => {
    if (gracePeriodTimerRef.current) {
      clearInterval(gracePeriodTimerRef.current);
    }
    
    setGracePeriudState({ isActive: false, timeLeft: 0, disconnectedPlayer: '' });
    
    setGameResult({
      isVisible: true,
      isWin: false,
      opponentName: gracePeriodState.disconnectedPlayer,
      disconnectionReason: 'forfeit',
      canReport: false
    });

    socketRef?.current?.emit('manualForfeit', {
      player: profile?.userName
    });
  };


  const handleReport = (reason) => {
    console.log('Submitting report:', reason);
    
    socketRef?.current?.emit('reportUnfairDisconnection', {
      reportedPlayer: gameResult.opponentName,
      reporter: profile?.userName,
      reason: reason,
      matchId: Date.now() 
    });
  };


  useEffect(() => {
    return () => {
      if (gracePeriodTimerRef.current) {
        clearInterval(gracePeriodTimerRef.current);
      }
    };
  }, []);

  return {
    gracePeriodState,
    gameResult,
    startGracePeriod,
    handleReconnection,
    handleManualForfeit,
    handleReport,
    setGameResult
  };
};


const DisconnectionDemo = () => {
  const [demoState, setDemoState] = useState('normal');
  
  const mockSocketRef = { current: { emit: () => {}, on: () => {}, off: () => {} } };
  const mockProfile = { userName: 'Player1' };
  const mockHMSActions = {};
  
  const {
    gracePeriodState,
    gameResult,
    startGracePeriod,
    handleReconnection,
    handleManualForfeit,
    handleReport,
    setGameResult
  } = useDisconnectionManager(mockSocketRef, mockProfile, mockHMSActions);

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-white text-2xl mb-6">Disconnection Management Demo</h1>
      
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => startGracePeriod('Opponent')}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
        >
          Start Grace Period
        </button>
        
        <button
          onClick={() => handleReconnection('Opponent')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Simulate Reconnection
        </button>
        
        <button
          onClick={() => setGameResult({
            isVisible: true,
            isWin: true,
            opponentName: 'Opponent',
            disconnectionReason: 'disconnect',
            canReport: true
          })}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Show Win (with Report)
        </button>
        
        <button
          onClick={() => setGameResult({
            isVisible: true,
            isWin: false,
            opponentName: 'Opponent',
            disconnectionReason: 'normal',
            canReport: false
          })}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Show Loss (Normal)
        </button>
      </div>

      <GracePeriodOverlay
        isVisible={gracePeriodState.isActive}
        timeLeft={gracePeriodState.timeLeft}
        disconnectedPlayer={gracePeriodState.disconnectedPlayer}
        onCancel={handleManualForfeit}
      />

      <WinLossPopup
        isVisible={gameResult.isVisible}
        isWin={gameResult.isWin}
        playerName={mockProfile.userName}
        opponentName={gameResult.opponentName}
        disconnectionReason={gameResult.disconnectionReason}
        canReport={gameResult.canReport}
        onGoHome={handleGoHome}
        onReport={handleReport}
      />
    </div>
  );
};

export default DisconnectionDemo;
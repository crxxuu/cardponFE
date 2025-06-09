import React, { useState } from 'react';
import { BASE_URL } from '../baseurl';
import axios from 'axios'

const WinLossPopup = ({ 
  isVisible, 
  isWin, 
  playerName, 
  opponentName, 
  currentOpponent,
  onReportResult,
  disconnectionReason = null,
  canReport = false,
  onReport,
  socketRef
}) => {
  const [showReporting, setShowReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  if (!isVisible) return null;

  const handleReport = async() => {
    try{
  
      if (reportReason.trim()) {
        onReport?.(reportReason);
        setReportSubmitted(true);
        let data={
          playerOne:currentOpponent?.matchAgainst?.email,
          playerTwo:currentOpponent?.email,
          counted:true,
          mode:currentOpponent?.mode,
          winBy:selectedResult=='win'?currentOpponent?.matchAgainst?.email:currentOpponent?.email,
          roomId:currentOpponent?.roomId,
          reportReason
        }

        let response=await axios.post(`${BASE_URL}/create-matchDisputes`,data)
        setTimeout(() => setShowReporting(false), 2000);
        socketRef?.current?.emit("finishMatch")
        localStorage.removeItem('authToken')
        socketRef.current.emit("getMatches")
     window.location.href='/'
      }
    }catch(e){

    }
  };

  const handleResultSelection = (result) => {
    setSelectedResult(result);
  };

  const submitResult = async() => {
try{
  let data={
    playerOne:currentOpponent?.matchAgainst?.email,
    playerTwo:currentOpponent?.email,
    counted:true,
    mode:currentOpponent?.mode,
    winBy:selectedResult=='win'?currentOpponent?.matchAgainst?.email:currentOpponent?.email,
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
console.log(e.message)
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
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-gray-600 shadow-2xl">
        {/* Win/Loss Icon */}
        <div className="text-center mb-6">
          {selectedResult === 'win' || isWin ? (
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
          <h1 className={`text-4xl font-bold mb-2 ${
            selectedResult === 'win' || isWin ? 'text-green-400' : 
            selectedResult === 'loss' ? 'text-red-400' : 'text-blue-400'
          }`}>
            {selectedResult === 'win' ? 'VICTORY!' : 
             selectedResult === 'loss' ? 'DEFEAT!' : 'REPORT RESULT'}
          </h1>
          
          {selectedResult === null ? (
            <p className="text-gray-300 text-lg mb-4">
              Please report the actual match result
            </p>
          ) : (
            <p className="text-gray-300 text-lg mb-4">
              {getResultMessage()}
            </p>
          )}
          
          {disconnectionReason && selectedResult !== null && (
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

        {/* Result Selection */}
        {selectedResult === null && (
          <div className="flex flex-col gap-4 mb-6">
            <button
              onClick={() => handleResultSelection('win')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all duration-300 transform hover:scale-105"
            >
              I Won This Match
            </button>
            
            <button
              onClick={() => handleResultSelection('loss')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all duration-300 transform hover:scale-105"
            >
              I Lost This Match
            </button>
          </div>
        )}

        {/* Stats Section */}
        {selectedResult !== null && (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 text-center">Match Summary</h3>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">+{selectedResult === 'win' ? '10' : '0'}</div>
                <div className="text-xs text-gray-400">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">+{selectedResult === 'win' ? '50' : '10'}</div>
                <div className="text-xs text-gray-400">XP</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${selectedResult === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedResult === 'win' ? '+1' : '+0'}
                </div>
                <div className="text-xs text-gray-400">Wins</div>
              </div>
            </div>
          </div>
        )}

        {/* Reporting Section */}
        {canReport && selectedResult !== null && !showReporting && !reportSubmitted && (
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

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {selectedResult === null ? (
            ''
          ) : (
            <>
             <button
              onClick={submitResult}
              className={`w-full ${
                selectedResult === null ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-bold py-4 px-6 rounded-xl transition-colors`}
            >
              Submit Result
            </button>

            <button
              onClick={() => {
                  setSelectedResult(null);
                  setShowReporting(false);
                  setReportSubmitted(false);
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
              Change Result
            </button>
                </>
          )}
              
          <button
            onClick={() => window.location.href = "/"}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinLossPopup;
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { socketContext } from './socketContext';

const MatchmakingPage = () => {
  const [status, setStatus] = useState('queuing');
  const [opponent, setOpponent] = useState(null);
  const [timer, setTimer] = useState(30);
  const [matchAccepted, setMatchAccepted] = useState(false);
  const {socketRef,profile}=useContext(socketContext)
  const navigate=useNavigate()
  const location=useLocation();


  

  
  useEffect(() => {
    if (status === 'queuing') {
    searchGame();
    }
    if(socketRef?.current){
matchFound();
socketRef?.current?.on("resetOpponent",()=>{
  console.log("resetOpponent")
  resetOpponent();
})   
}
  }, [status,profile,socketRef?.current]);

  const resetOpponent=()=>{
    setStatus('queuing');
    setTimer(30);
    setOpponent(null)
    setMatchAccepted(false)
    }

  const matchFound=async()=>{
socketRef?.current.on('findMatch',(data)=>{
    setStatus("matched")
    setOpponent({
        username: data?.userName,
        rank: data?.rank,
        avatar: data?.avatar
      });
      socketRef?.current?.emit("matchQue",data)
console.log(data)
})
  }


  const searchGame=async()=>{
    try{
      if(profile && socketRef?.current){  
        let params=new URLSearchParams(location.search)
        let tch=params.get('tch')
        let mode=params.get('mode')
        let data={
            tch,
            mode,
            rank:profile?.rank,
            email:profile?.email,
            avatar:profile?.avatar,
            userName:profile?.userName
        }
      socketRef?.current.emit("findMatch",data)  
      } 
    }catch(e){
        alert("Something went wrong please search again")
    }
  }

  
  useEffect(() => {
    if (status === 'matched' && timer > 0 && !matchAccepted) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(countdown);
    }

    if (timer === 0 && !matchAccepted) {
      setStatus('queuing');
      setTimer(30);
      setOpponent(null)
      socketRef?.current?.emit("clearMatchQue")
    }
  }, [status, timer, matchAccepted]);

  const handleAcceptMatch = () => {
    setMatchAccepted(true);
    setTimer(null);
   

socketRef?.current?.emit("acceptMatch",opponent)   
   
socketRef?.current?.on("acceptedByBothPlayers",()=>{

  navigate('/livegame')
})
   
  };


  

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'rgb(44 172 79)' }}
    >
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'queuing' && (
          <div className="space-y-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Searching for Opponent...
            </h2>
            <p className="text-gray-600">
              Estimated wait time: <span className="font-semibold">~30 seconds</span>
            </p>
          </div>
        )}

        {status === 'matched' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Match Found!
            </h2>
            
            <div className="bg-gray-100 rounded-lg p-4">
              <img 
                src={opponent.avatar}
                alt="Opponent Avatar"
                className="w-20 h-20 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800">
                {opponent.username}
              </h3>
              <p className="text-gray-600">
                Rank: <span className="font-medium">{opponent.rank}</span>
              </p>
            </div>

            <div className="text-red-500 font-bold text-lg">
              Time to accept: {timer}s
            </div>

            <button
              onClick={handleAcceptMatch}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: 'rgb(0 0 0)' }}
              disabled={matchAccepted}
            >
              {matchAccepted ? 'Match Accepted!' : 'Accept Match'}
            </button>
          </div>
        )}

        {matchAccepted && (
          <div className="mt-4 p-4 bg-green-100 rounded-lg">
            <p className="text-green-700 font-semibold">
              Match confirmed! Waiting for oponent to accept...
            </p>
          </div>
        )}
      </div>

      {status !== 'accepted' && (
        <button
          className="mt-6 text-white underline hover:text-gray-200 transition-colors"
          onClick={() => {
           navigate('/')
          }}
        >
          Cancel Search
        </button>
      )}
    </div>
  );
};

export default MatchmakingPage;
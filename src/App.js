import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './components/header';
import { useContext } from 'react';
import {useNavigate} from 'react-router-dom'
import { useEffect } from 'react';
import { socketContext } from './socketContext';
import axios from 'axios';
import { BASE_URL } from './baseurl';

function App() {
  const [selectedTCG, setSelectedTCG] = useState('');
  const [selectedGamemode, setSelectedGamemode] = useState('');
  const [isTCGDropdownOpen, setIsTCGDropdownOpen] = useState(false);
  const [isGamemodeDropdownOpen, setIsGamemodeDropdownOpen] = useState(false);
 const [tcgOptions,settcgOptions]=useState([])
 const {socketRef,profile}=useContext(socketContext)

 

  const gamemodeOptions = ['Casual', 'Rank'];

  const handleTCGSelect = (option) => {
    setSelectedTCG(option?.name);
    setIsTCGDropdownOpen(false);
  };

  const handleGamemodeSelect = (option) => {
    setSelectedGamemode(option);
    setIsGamemodeDropdownOpen(false);
  };

  useEffect(()=>{
window.scrollTo(0,0)
  },[])


useEffect(()=>{
getMatches();
},[])

useEffect(()=>{
if(profile){
  console.log("PROFILE")
  console.log(profile)
}
},[profile])

useEffect(()=>{
  console.log(socketRef.current)
if(socketRef?.current){
  socketRef?.current?.on("newGame",(data)=>{
    console.log("newGame")
   settcgOptions((prev)=>{
    let old=prev;
if(old.length>0){
  old=[...old,data]
}else{
  old=[data]
}
return old
   })
  })

  socketRef?.current?.on("updateGameStatus",(data)=>{
console.log("UPDATE GAME STATUS")
console.log(data)
    settcgOptions((prev)=>{
      let old=prev;
  let findIndex=old.findIndex(u=>u?._id==data.id)

  old[findIndex]={
    ...old[findIndex],
    status:data.status
  
}
return old
     })

  })

  socketRef?.current?.on("deleteGame",(data)=>{
    console.log("DELETE GAME")
    console.log(data)
    settcgOptions((prev)=>{
      let old=prev;
      let findIndex=old.findIndex(u=>u._id==data)
      delete old[findIndex]
      return old
    })
  })
}

},[socketRef?.current])

const getMatches=async()=>{
  try{
let response=await axios.get(`${BASE_URL}/get-activegames`)
console.log("ACTIVE")
console.log(response.data)
settcgOptions(response.data.games)
  }catch(e){

  }
}



const navigate=useNavigate();

const searchMatch=()=>{
  if(selectedTCG.length==0){
    alert("Please select TCG")
    return
  }else if(selectedGamemode.length==0){
    alert("Please select game mode")
    return
  }

  navigate(`/match?tch=${selectedTCG}&mode=${selectedGamemode}`)  

}

  return (
    <div className='w-full px-[10px]'>
      <Header />
      <div className='w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-[#2cac4f] min-h-[95vh] flex justify-center flex-col lg:flex-row lg:gap-[2rem] gap-[30px]'>
        
       
       
       
        <div className='flex justify-center flex-col lg:flex-row lg:gap-[8rem] gap-[30px] flex-1'>
          <div className='flex flex-col gap-[6px] h-fit relative'>
            <h1 className='text-white font-bold text-[18px] lg:text-[24px] text-center'>Select Your</h1>
            <h1 className='text-white font-bold text-[18px] lg:text-[24px] text-center'>TCG!</h1>
            <div
              className='mt-[10px] min-w-[200px] p-[10px] bg-white rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all flex justify-between items-center'
              onClick={() => setIsTCGDropdownOpen(!isTCGDropdownOpen)}
            >
              {selectedTCG || 'Select TCG'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform ${isTCGDropdownOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {isTCGDropdownOpen && (
              <div className='absolute top-[100%] left-0 mt-[5px] w-full bg-white rounded-lg shadow-lg shadow-left-bottom z-10'>
                {tcgOptions?.filter(u=>u?.status=="ACTIVE")?.map((option, index) => (
                  <div
                    key={index}
                    className='p-[10px] text-[20px] font-semibold hover:bg-gray-100 cursor-pointer'
                    onClick={() => handleTCGSelect(option)}
                  >
                    {option?.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='flex flex-col gap-[6px] h-fit relative'>
            <h1 className='text-white font-bold text-[18px] lg:text-[24px] text-center'>Select Your</h1>
            <h1 className='text-white font-bold text-[18px] lg:text-[24px] text-center'>Gamemode!</h1>
            <div
              className='mt-[10px] min-w-[200px] p-[10px] bg-white rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all flex justify-between items-center'
              onClick={() => setIsGamemodeDropdownOpen(!isGamemodeDropdownOpen)}
            >
              {selectedGamemode || 'Select Gamemode'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform ${isGamemodeDropdownOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {isGamemodeDropdownOpen && (
              <div className='absolute top-[100%] left-0 mt-[5px] w-full bg-white rounded-lg shadow-lg shadow-left-bottom z-10'>
                {gamemodeOptions.map((option, index) => (
                  <div
                    key={index}
                    className='p-[10px] text-[20px] font-semibold hover:bg-gray-100 cursor-pointer'
                    onClick={() => handleGamemodeSelect(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div onClick={searchMatch} className='bg-black flex flex-col cursor-pointer px-[30px] py-[20px] justify-center items-center h-fit lg:mt-[50px] rounded-[10px]'>
            <h1 className='text-center lg:text-[24px] text-[16px] font-bold text-white'>Search For</h1>
            <h1 className='text-center lg:text-[24px] text-[16px] font-bold text-white'>Game!</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios'
import { BASE_URL } from "../baseurl";
import { useNavigate } from "react-router-dom";
import FadeLoader	 from 'react-spinners/FadeLoader'
const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [loading,setLoading]=useState(true)
  const [user,setUser]=useState()

  const navigate=useNavigate()
  const handleAuth = () => {
    setIsLoggedIn(!isLoggedIn);
    setIsMenuOpen(false); 
    localStorage.removeItem('token')
    navigate('/')
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

useEffect(()=>{
fetchProfile();
},[])

  const fetchProfile=async()=>{
try{
  let token=localStorage.getItem('token')
  if(token){
    setIsLoggedIn(true)
  }
  if(!token){
return;
  }
let headers={
  headers:{
    authorization:`Bearer ${token}`
  }
}
let res=await axios.get(`${BASE_URL}/getProfile`,headers)
console.log(res)
setUser(res.data.user)
setLoading(false)
}catch(e){

}
  }

  return (
    <div className="w-full px-[10px] py-[10px] bg-black flex justify-between items-center">
      <div className="flex flex-col gap-[20px]">
      <div className="font-bold text-[24px] text-green-500">
  <img src="Logo.png" className="rounded-full w-16 h-16 object-cover"/>
</div>
        <nav className="flex lg:gap-[30px] gap-[20px] items-center">
      
<button
  onClick={() => window.location.href = '/'}
  className="font-bold text-[14px] lg:text-[18px] text-green-500"
>
  Play Now
</button>

<button
  onClick={() => window.location.href = '/cardgame'}
  className="font-bold text-[14px] lg:text-[18px] text-green-500"
>
  Card game
</button>

<button
  onClick={() => window.location.href = '/announcements'}
  className="font-bold text-[14px] lg:text-[18px] text-green-500"
>
  Announcement
</button>


<button
  onClick={() => window.location.href = 'https://discord.gg/77FCC4wqYx'}
  className="font-bold text-[14px] lg:text-[18px] text-green-500"
>
  Discord
</button>
{
  !localStorage.getItem('token') && (
    <button
      onClick={() => window.location.href = '/signin'}
      className="font-bold text-[14px] lg:text-[18px] text-green-500"
    >
      Login
    </button>
  )
}

        </nav>
      </div>
     {isLoggedIn? <div className="flex flex-col relative lg:pr-[20px]">
        <div className="flex items-center flex-col  justify-center cursor-pointer" onClick={toggleMenu}>
         
         {loading?<FadeLoader	
        color="red"
        loading={loading}
        cssOverride={override}
        size={35}
        aria-label="Loading Spinner"
        data-testid="loader"
      />:<>
          <img
            src={user?.avatar} 
            alt="User Avatar"
            className="w-[40px] h-[40px] rounded-full"
          />
          <span className="text-white font-bold">{user?.userName}</span>
          <div className="flex items-center justify-center gap-[10px]">
            <span className="font-bold text-white text-[14px]">W : <span className="text-green-500 font-bold">{user?.
recentMatchHistory?.filter(u=>u.winBy==user._id && u?.counted===true)?.length
}</span></span>
            <span className="font-bold text-white text-[14px]">L : <span className="text-red-500 font-bold">{user?.
recentMatchHistory?.filter(u=>u?.winBy && u.winBy!=user._id && u?.counted===true)?.length
}</span></span>
          </div>
         </>}
        </div>

        {isMenuOpen && (
          <div className="absolute top-[50px] right-0 bg-white rounded-lg shadow-lg w-[150px]">
            <ul className="py-2">
              {isLoggedIn ? (
                <>
                  <Link className="px-4 flex w-full py-2 hover:bg-gray-100 cursor-pointer" to="/profile">Profile</Link>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleAuth}>
                    Logout
                  </li>
                </>
              ) : (
                <Link className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex w-full" to="/signin">
                  Login
                </Link>
              )}
            </ul>
          </div>
        )}
      </div>:''}
    </div>
  );
}
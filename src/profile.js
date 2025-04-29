import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from './components/header';
import { ToastContainer,toast } from 'react-toastify';
import { useEffect } from 'react';
import axios from 'axios'
import { BASE_URL } from './baseurl';
import { useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import BounceLoader from 'react-spinners/BounceLoader'
import PacmanLoader from 'react-spinners/PacmanLoader'
const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
const ProfilePage = () => {
  const [username, setUsername] = useState(); 
  const [avatar, setAvatar] = useState();
  const [bio, setBio] = useState('I love gaming!'); 
  const [isEditing, setIsEditing] = useState(false); 
  const [rank,setRank]=useState(0)
  const [isProfileVisible, setIsProfileVisible] = useState(true); 
  const [matches, setMatches] = useState([]); 
  const [friends, setFriends] = useState([]); 
  const [loading,setLoading]=useState(true)
  const [avatarLoading,setAvatarLoading]=useState(false)

  const navigate=useNavigate();
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: async(acceptedFiles) => {
try{
  setAvatarLoading(true)
  let formdata=new FormData();
  console.log("ACCEPTED")
  console.log(acceptedFiles[0])
  if(!acceptedFiles[0]?.type?.startsWith('image')){
    toast.error("Please select image",{containerId:'profilePage'})
    setAvatarLoading(false)
    return;
  }
  formdata.append('avatar',acceptedFiles[0])
  let token=localStorage.getItem('token')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
     
    }
  };

  await axios.patch(`${BASE_URL}/updateAvatar`, formdata, config);

  setAvatar(URL.createObjectURL(acceptedFiles[0]));
  setAvatarLoading(false)


}catch(e){
  console.log(e.message)
  console.log(e)
  setAvatarLoading(false)
  if(e?.response?.data?.error){
    toast.error(e?.response?.data?.error,{containerId:"profilePage"})
  }else{
    toast.error("something went wrong please try again",{containerId:"profilePage"})
  }
}
    },
  });

  
  const handleDeleteAccount = () => {
    toast.warn(
      "Are you sure you want to delete your account?", 
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: true,
        draggable: true,
        toastId: "delete-confirmation",
        pauseOnHover: true,
        containerId:'profilePage',
        hideProgressBar: true,
        closeButton: (
          <button onClick={deleteAccount} style={{ marginLeft: '10px', border: 'none', background: 'transparent', color: '#ff0000', fontWeight: 'bold', cursor: 'pointer' }}>
            Yes, Delete
          </button>
        )
      },
      
    );
  };
const deleteAccount=async()=>{
  try{
    let token=localStorage.getItem('token')
    let headers={
      headers:{
        authorization:`Bearer ${token}`
      }
    }
let res=await axios.delete(`${BASE_URL}/deleteUser`,headers)
toast.success('User deleted sucessfully',{containerId:'profilePage'})
setTimeout(()=>{
  localStorage.removeItem('token')
navigate('/')
},900)

  }catch(e){
    if(e?.response?.data?.error){
      toast.error(e?.response?.data?.error,{containerId:"profilePage"})
    }else{
      toast.error("something went wrong please try again",{containerId:"profilePage"})
    }
  }
}

useEffect(()=>{
  window.scrollTo(0,0)
fetchProfile();
},[])

const fetchProfile=async()=>{
  try{
    let token=localStorage.getItem('token')
    let headers={
      headers:{
        authorization:`Bearer ${token}`
      }
    }
    
let res=await axios.get(`${BASE_URL}/getProfile`,headers)
setUsername(res.data.user.userName)
setBio(res.data.user.tagline)
setAvatar(res.data.user.avatar)
setIsProfileVisible(res.data.user.visible)
setRank(res.data.user.rank)
console.log(res)
setTimeout(()=>{
  setLoading(false)
},1000)
  }catch(e){
if(e?.response?.data?.error){
  toast.error(e?.response?.data?.error,{containerId:"profilePage"})
}else{
  toast.error("something went wrong please try again",{containerId:"profilePage"})
}
  }
}

const updateProfie=async()=>{
  try{
  
 if(isEditing==true){
  let token=localStorage.getItem('token')
  let headers={
    headers:{
      authorization:`Bearer ${token}`
    }
  }
let response=await axios.patch(`${BASE_URL}/updateProfile`,{userName:username,tagline:bio,visible:isProfileVisible},headers)
console.log(response)
console.log('response')
toast.success("Profile edited successfully",{containerId:"profilePage"})
setIsEditing(!isEditing)
  
 }else{
  setIsEditing(!isEditing)
 }

  }catch(e){
    if(e?.response?.data?.error){
      toast.error(e?.response?.data?.error,{containerId:"profilePage"})
    }else{
      toast.error("something went wrong please try again",{containerId:"profilePage"})
    }
  }
}

  return (
   <>
   <ToastContainer containerId={"profilePage"}/>

   <div className='w-full px-[10px]'>
      <Header />
      <div className='w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-[#2cac4f] min-h-[95vh] flex justify-center flex-col lg:flex-row lg:gap-[8rem] gap-[30px]'>
        
        <div className='bg-white p-[30px] rounded-lg shadow-lg w-full max-w-[800px]'>
          <h1 className='text-[24px] font-bold text-center mb-[20px]'>Profile</h1>

        {loading?<div>
          <PacmanLoader
        color="red"
        loading={loading}
        cssOverride={override}
        size={60}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
          </div>:<>
          
          <div className='flex flex-col items-center mb-[20px]'>
            <div {...getRootProps()} className='cursor-pointer'>
              <input {...getInputProps()} />
          
            {avatarLoading?<ClipLoader
        color="white"
        loading={avatarLoading}
        cssOverride={override}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />:<img
                src={avatar}
                alt='Profile Avatar'
                className='w-[100px] h-[100px] rounded-full mb-[10px]'
              />}
            </div>
            <p className='text-gray-500 text-[14px]'>Click to upload a new avatar</p>
          </div>

         
          <div className='mb-[20px]'>
            <label className='block text-[16px] font-semibold mb-[5px]'>Username</label>
            {isEditing ? (
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-full p-[10px] border border-gray-300 rounded-lg'
              />
            ) : (
              <p className='text-[18px] font-bold'>{username}</p>
            )}
          </div>

        
          <div className='mb-[20px]'>
            <label className='block text-[16px] font-semibold mb-[5px]'>Short Bio/Tagline</label>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className='w-full p-[10px] border border-gray-300 rounded-lg'
                rows='3'
              />
            ) : (
              <p className='text-[16px]'>{bio}</p>
            )}
          </div>

    
          <div className='mb-[20px]'>
            <h2 className='text-[20px] font-bold mb-[10px]'>Match Stats</h2>
            <div className='flex gap-[20px]'>
              <div>
                <p className='text-[16px] font-semibold'>No stats found</p>
              
              </div>
              <div>
                <p className='text-[16px] font-semibold'>Ranking: {rank==0?'Begineer':rank}</p>
              </div>
            </div>
          </div>

     
          <div className='mb-[20px]'>
            <h2 className='text-[20px] font-bold mb-[10px]'>Recent Matches</h2>
            <ul>
            {matches?.length>0?(
matches?.map((match,i)=>{
  <>
<li key={match.id} className='text-[16px] mb-[5px]'>
                  {match.result} - {match.timestamp}
                </li>
</>
})
            ):(
<>
<li>
  No match found
</li>
</>
            )}
            </ul>
          </div>

    
          <div className='mb-[20px]'>
            <h2 className='text-[20px] font-bold mb-[10px]'>Friend List</h2>
            <ul>
              {friends?.length>0?(
friends?.map((friend,index)=>{
  <li key={index} className='text-[16px] mb-[5px]'>
  {friend}
</li>
})
              ):(
<>
<li>No friend found</li>
</>
              )}
            </ul>
          </div>

       
          <div className='mb-[20px]'>
            <h2 className='text-[20px] font-bold mb-[10px]'>Edit Profile</h2>
            <button
              onClick={() => {
               
                updateProfie()
              }}
              className='w-full bg-green-500 text-white p-[10px] rounded-lg font-bold hover:bg-green-600 transition-all mb-[10px]'
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
            {isEditing && (
              <div className='mt-[10px]'>
                <label className='block text-[16px] font-semibold mb-[5px]'>
                  Profile Visibility
                </label>
                <select
                  value={isProfileVisible}
                  onChange={(e) => setIsProfileVisible(e.target.value)}
                  className='w-full p-[10px] border border-gray-300 rounded-lg'
                >
                  <option value='visible'>Visible to Others</option>
                  <option value='hidden'>Hidden</option>
                </select>
              </div>
            )}
          </div>

          
          <div>
            <h2 className='text-[20px] font-bold mb-[10px]'>Security & Account</h2>
            <button
              onClick={handleDeleteAccount}
              className='w-full bg-red-500 text-white p-[10px] rounded-lg font-bold hover:bg-red-600 transition-all'
            >
              Delete Account
            </button>
          </div>
          </>}
        </div>
      </div>
    </div>
   
   </>
  );
};

export default ProfilePage;
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import { useDiscordLogin, UseDiscordLoginParams } from 'react-discord-login';
import axios from 'axios'
import { BASE_URL } from './baseurl';
import { useNavigate } from 'react-router-dom';

const RegistrationPage = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [selectedImage, setSelectedImage] = useState(null); 
const navigate=useNavigate()
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setSelectedImage(URL.createObjectURL(acceptedFiles[0]));
    },
  });


  const discordLoginParams = {
    clientId: '1353009606363709480',
    redirectUri: 'http://localhost:3000/Signup',
    responseType: 'token', 
    scopes: ['identify', 'email'],
    onSuccess: response => {
  
      const avatar = response.user.avatar 
      ? `https://cdn.discordapp.com/avatars/${response.user.id}/${response.user.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${response.user.discriminator % 5}.png`;
  
    let data = {
      userName: response.user.username,
      avatar,
      email: response.user.email
    };
    authenticate(data, false);
    
    },
    onFailure: error => {
      
        console.error('Login failed:', error);
    },
};

const authenticate=async(data,login)=>{
  console.log(data)
  try{
    let res=await axios.post(`${BASE_URL}/register`,data)
    toast.success(res.data.message,{containerId:"signUpPage"})
  }catch(e){
    console.log("ERROR")
    console.log(e.message)
    if(e?.response?.data?.error){
        toast.error(e?.response?.data?.error,{containerId:"signUpPage"})
      }else{
        toast.error("something went wrong please try again",{containerId:"signUpPage"})
      }
  }
}

const { buildUrl, isLoading } = useDiscordLogin(discordLoginParams);

  return (
   <>
   <ToastContainer containerId="signUpPage"/>

   <div className='w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-[#2cac4f] min-h-[95vh] lg:min-h-[95vh] flex justify-center items-center'>
    
        
        <div className='bg-white p-[30px] rounded-lg shadow-lg w-full max-w-[400px]'>
          <h1 className='text-[24px] font-bold text-center mb-[20px]'>Register</h1>
          <button
          onClick={() => (window.location.href = buildUrl())} disabled={isLoading}
  type="submit"
  className="w-full bg-[#5865F2] text-white py-3 px-4 rounded-[4px] font-semibold
           hover:bg-[#4752C4] transition-colors duration-200
           focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:ring-offset-2
           flex items-center justify-center space-x-2"
>
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
  </svg>
  <span>Register with Discord</span>
</button>
          <p className='text-center mt-[20px]'>
            Not registered?{' '}
            <span
              className='text-green-500 cursor-pointer font-bold'
              onClick={() => navigate('/signin')}
            >
              Sign in
            </span>
          </p>
        </div>
     
    </div>
   </>
  );
};

export default RegistrationPage;
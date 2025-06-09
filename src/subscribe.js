import { Link } from "react-router-dom";
import Header from "./components/header";
import sub from "./Subscribe.png"
import {loadStripe} from '@stripe/stripe-js';
import axios from 'axios'
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { BASE_URL } from "./baseurl";
import { ToastContainer,toast } from "react-toastify";

export default function Subscribe() {
    const stripe = useStripe();
    const elements = useElements();

    const createSession=async()=>{
try{
    let token=localStorage.getItem('token')
    let headers={
        headers:{
            authorization:`Bearer ${token}`
        }
    }
let response=await axios.post(`${BASE_URL}/create-session`,{},headers)
stripe.redirectToCheckout({
    sessionId:response.data.session.id
})
console.log(response.data)
}catch(e){
console.log(e.message)
if(e?.response?.data?.error){
    toast.error(e?.response?.data?.error,{containerId:"subscription"})
}else{
    toast.error("Something went wrong please try again",{containerId:"subscription"})
}
}
    }
    
    return (
       <>
       <ToastContainer containerId={"subscription"}/>
       <div className='w-full px-[10px]'>
            <Header />
            <div onClick={createSession} className='cursor-pointer w-full mx-auto lg:w-[98%] mt-[20px] p-[30px] bg-[#2cac4f] min-h-[95vh] flex justify-center flex-col lg:flex-row lg:gap-[8rem] gap-[30px]'>
                <div className="w-full flex justify-center items-center">
                    <img src={sub} className="max-w-[800px] w-full" alt="img" />
                </div>
            </div>
        </div>
       </>
    )
}
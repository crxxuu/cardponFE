import {Navigate, Outlet,useNavigate} from 'react-router-dom'
import { useEffect } from 'react'

const Middleware=()=>{
    useEffect(()=>{
        localStorage.removeItem('authToken')
        window.scrollTo(0,0)
        },[])

    return(
        <>
        {localStorage.getItem('token')?<Outlet/>:<Navigate to='/signin'/>}
        </>
    )
}


export default Middleware

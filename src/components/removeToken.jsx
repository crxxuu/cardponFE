import {Outlet} from 'react-router-dom'
import {useEffect} from 'react'



const RemoveToken=()=>{
   
    useEffect(()=>{
        localStorage.removeItem('authToken')
        window.scrollTo(0,0)
        },[])

return <Outlet/>
}

export default RemoveToken;
import {Navigate, Outlet,useNavigate} from 'react-router-dom'


const Middleware=()=>{
    return(
        <>
        {localStorage.getItem('token')?<Outlet/>:<Navigate to='/signin'/>}
        </>
    )
}


export default Middleware

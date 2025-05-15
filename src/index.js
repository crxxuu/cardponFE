import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthPage from './authpage';
import ProfilePage from './profile';
import RegistrationPage from './registrationpage';
import { Buffer } from 'buffer';
import process from 'process';
import Middleware from './middleware';
import LiveGame from './livegame';
import { SocketProvider } from './socketContext';
import MatchmakingPage from './matchSearch';

window.process = process;
window.Buffer = Buffer;

const router = createBrowserRouter([
  {
    path: '/',
    element: <Middleware/>,
    children:[
      {
        path: '/',
        element: <App />  
      },
    ]
  
  },
  {
 path:'/match',
 element:<MatchmakingPage/>

  },
  {
    path:'/signin',
    element:<AuthPage />
  },
  {
    path:"/livegame",
    element:<LiveGame />
  },
  {
path:'/signup',
element:<RegistrationPage/>
  },
  {
    path:'/',
    element:<Middleware/>,
    children:[
      {
        path:'/profile',
        element:<ProfilePage />
      }
    ]
  }
]);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
   <SocketProvider>
   <RouterProvider router={router} />
   </SocketProvider>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

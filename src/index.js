import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import AuthPage from './authpage';
import { HMSRoomProvider } from "@100mslive/react-sdk";
import ProfilePage from './profile';
import {loadStripe} from '@stripe/stripe-js';
import RegistrationPage from './registrationpage';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Buffer } from 'buffer';
import process from 'process';
import Middleware from './middleware';
import LiveGame from './livegame';
import { SocketProvider } from './socketContext';
import MatchmakingPage from './matchSearch';
import CardGame from './cardGame';
import Subscribe from './subscribe';
import Watchgame from './watchgame';
import RemoveToken from './components/removeToken';
import AnnouncementsPage from './Announcement';
import Banguard from './Banguard';

const stripePromise = loadStripe('pk_test_51OwuO4LcfLzcwwOYdssgGfUSfOgWT1LwO6ewi3CEPewY7WEL9ATqH6WJm3oAcLDA3IgUvVYLVEBMIEu0d8fUwhlw009JwzEYmV');

window.process = process;
window.Buffer = Buffer;


const RootLayout = () => {
  return (
    <Elements stripe={stripePromise}>
      <SocketProvider>
        <HMSRoomProvider>
          <Banguard>

          <Outlet />
          </Banguard>
        </HMSRoomProvider>
      </SocketProvider>
    </Elements>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Middleware/>,
        children:[
          {
            path: '/',
            element: <App />  
          },
          {
            path:'/match',
            element:<MatchmakingPage/>
          },
          {
            path:'/subscribe',
            element:<Subscribe/>
          },
          {
            path:'/profile',
            element:<ProfilePage />
          }
        ]
      },
      {
        path:'/signin',
        element:<AuthPage/>
      },
      {
        path:'/announcements',
        element:<AnnouncementsPage/>
      },
      {
        path:'/cardgame',
        element:<CardGame />
      },
      {
        path:'/watchgame',
        element:<Watchgame/>
      },
      {
        path:"/livegame",
        element:<LiveGame />
      },
      {
        path:'/signup',
        element:<RegistrationPage/>
      },
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RouterProvider router={router} />);

reportWebVitals();
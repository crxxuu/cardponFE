import axios from 'axios';
import React, { useState } from 'react';
import { BASE_URL } from '../baseurl';

export default function WarningPopup({showWarning,setShowWarning,popupData}) {
  
  const handleViolation = () => {
    setShowWarning(true);
  };

  const handleConfirm = async() => {
   try{
    let response=await axios.patch(`${BASE_URL}/updateUser/${popupData.userId}`,{prevWarnings:popupData.warnings})
    setShowWarning(false);
   }catch(e){

   }
  };

  return (
    <div className="p-8">
 
      <button
        onClick={handleViolation}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
      >
        Trigger Warning (Demo)
      </button>

    
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
           
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

        
            <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
              Policy Violation Warning
            </h2>

            
            <p className="text-gray-700 text-center mb-6 leading-relaxed">
              You have violated our community guidelines. Please review our terms of service and ensure your behavior complies with our policies. Continued violations may result in account restrictions.
            </p>

 
            <div className="flex justify-center">
              <button
                onClick={handleConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
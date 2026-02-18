import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

const Loading = () => {
  const {navigate} = useAppContext();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const nextUrl = query.get('next'); 

  useEffect(() => {
  
      if (nextUrl){
        setTimeout(()=>{
        navigate(`/${nextUrl}`)
     
    }, 5000)
  }

// eslint-disable-next-line react-hooks/exhaustive-deps
},[nextUrl])


  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary"></div>
        <p className="text-gray-600 text-lg">Processing your order...</p>
      </div>
    </div>
  );
};

export default Loading;

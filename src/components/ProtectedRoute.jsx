// src/components/ProtectedRoute.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';


// props 에서 children 을 얻어내 리턴하는 함수
function ProtectedRoute({children}) {

    // 로그인 여부를 알기 위해 userInfo 를 얻어낸다.
    const userInfo = useSelector(state=>state.userInfo);
   
    // 만약 로그인 정보가 없으면
    if(!userInfo){
        // 인덱스 페이지로 감
        return <Navigate to="/"/>
    }
    
    return children;
}

export default ProtectedRoute;
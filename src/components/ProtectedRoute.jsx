// src/components/ProtectedRoute.jsx

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';


// props 에서 children 을 얻어내 리턴하는 함수
function ProtectedRoute({children}) {

    // 로그인 여부를 알기 위해 userInfo 를 얻어낸다.
    const userInfo = useSelector(state=>state.userInfo);
    //현재 경로를 알아내기 위해 
    const location = useLocation();
    //action 을 발행하기 위해
    const dispatch = useDispatch();
    //만일 로그인 상태가 아니라면
    if(!userInfo){
        //원래 갈려던 목적지 정보와 query 파라미터 정보를 읽어내서 
        const url= location.pathname+ location.search;
        //테스트로 출력해보기
        // console.log(url);
        const payload = {
            show:true,
            title: "해당 페이지는 로그인이 필요 합니다.",
            url: url
        } 
        //로그인 창을 띄우는 action 을 발행하면서 payload 를 전달한다.
        dispatch({type:"LOGIN_MODAL", payload});
        // return null 을 하면 currentRoute 에 빈 페이지가 출력된다.
        return null;
        // 인덱스 페이지로 감
        // return <Navigate to="/"/>
    }
    
    return children;
}

export default ProtectedRoute;
// src/components/LoginModal.jsx

import { jwtDecode } from 'jwt-decode';
import React, { useState } from 'react';
import { Alert, Button, FloatingLabel, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api';

function LoginModal(props) {
    //store 로 부터 loginModal 의 상태값을 읽어온다.
    const loginModal = useSelector(state=>state.loginModal);
    //입력한 내용을 상태값으로 관리
    const [state, setState] = useState({});
    // userName 과 password 를 입력했을때 실행할 함수 
    const handleChange = (e)=>{
        setState({
            ...state,
            [e.target.name]:e.target.value
        })
    }
    //에러 메세지를 상태값으로 관리
    const [errorMsg, setErrorMsg]=useState(null);
    const dispatch=useDispatch();

    //로그인 버튼을 눌렀을때 실행할 함수
    const handleLogin = ()=>{
        api.post("/auth", state)
        .then(res=>{
            //토큰을 localStorage 에 저장
            localStorage.token=res.data;
            //토큰을 디코딩해서 userName 을 얻어온다. 
            const decoded=jwtDecode(res.data.substring(7));
            console.log(decoded);
            //발행할 action
            const action={type:"USER_INFO", payload:{
                userName:decoded.sub,
                role:decoded.role
            }};
            //액션 발행하기
            dispatch(action);
            //로그인 모달 숨기기
            dispatch({type:"LOGIN_MODAL", payload:{show:false}});
            //에러 메세지 없애기
            setErrorMsg(null);
            
            const exp = decoded.exp * 1000; 
            const now = Date.now();
            const remainingTime = exp - now;
            //자동 로그아웃 예약
            const logoutTimer=setTimeout(()=>{
                doLogout();
            }, remainingTime);
            
            //로그아웃 타이머를 store 에 등록
            dispatch({
                type:"LOGOUT_TIMER",
                payload:logoutTimer
            });
            const doLogout = () => {
                delete localStorage.token;
                dispatch({ type: 'USER_INFO', payload: null });
                alert('토큰이 만료되어 자동 로그아웃 되었습니다.');
            };
        })
        .catch(error=>{
            console.log(error);
            //에러 메세지를 상태값으로 넣어준다.
            setErrorMsg(error.response.data);
        });
    }

    return (
        <Modal show={props.show} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{loginModal.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FloatingLabel controlId='userName' label="User Name" className='mb-3'>
                    <Form.Control onChange={handleChange} name="userName" type="text" />
                </FloatingLabel>
                <FloatingLabel controlId='password' label="Password" className='mb-3'>
                    <Form.Control onChange={handleChange} name="password" type="password" />
                </FloatingLabel>
                {errorMsg && <Alert variant='danger'>{errorMsg}</Alert>}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleLogin}>로그인</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default LoginModal;
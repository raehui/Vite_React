import React, { useState } from 'react';
import { Alert, Button, FloatingLabel, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { jwtDecode } from 'jwt-decode';
import api from '../api';


function LoginModal(props) {
    //store 에서 관리되는 값 가져오기
    const loginModal = useSelector(state => state.loginModal);
    //입력한 내용을 상태값으로 관리
    const [state,setState] = useState({});
    //userName 과 password 입력할 때 사용하는 함수
    const handleChange = (e) =>{
        setState({
            ...state,
            [e.target.name] : e.target.value
        })
    }; 

    //에러메세지를 상태값으로 관리
    const [errorMsg, setErrorMsg] = useState(null);
    const dispatch = useDispatch();

    //로그인 버튼을 눌렀을 때 실행할 함수
     // state 에는 {userName : "xxx", password : "1234" } ? 누가 담는가?
    const handleLogin = () =>{
        api.post("/auth",state) 
        .then(res =>{
            
            //res.data = 토큰
            console.log(res.data);
            //토큰을 localStorage 에 저장
            localStorage.token = res.data;
            //토큰을 디코딩해서 userName 을 얻어온다.
            //앞에 7글자를 제외한 토큰을 디코딩
            const decoded = jwtDecode(res.data.substring(7));
            console.log(decoded);
            //발행할 action
            const action = {type: "USER_INFO",payload : {
                userName : decoded.sub,
                role :  decoded.role
            }};
            dispatch(action);
            //로그인 모달 숨기기
            dispatch({type:"LOGIN_MODAL",payload:{show:false}});
            //에러 메세지 없애기
            setErrorMsg(null);
        })
        .catch(error =>{
            console.log(error)
            //에러 메세지를 상태값으로 넣어준다.
            setErrorMsg(error.response.data);
        })
    }

    return (
        <>  
            {/* show={props.show} */}
            {/* 부모 요소에서 관리되는 loginModal.show의 값을 갖고오고 그걸 관리할 권한을 준다 */}
            <Modal {...props} size='lg' centered>
                <Modal.Header closeButton>
                    <Modal.Title>{loginModal.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FloatingLabel controlId='userName' label="User Name" className='mb-3'>
                        <Form.Control onChange={handleChange} name='userName' type='text'/>
                    </FloatingLabel>
                    <FloatingLabel controlId='password' label="Password" className='mb-3'>
                        <Form.Control onChange={handleChange} name='password' type='password'/>
                    </FloatingLabel>
                    {errorMsg && <Alert variant='danger'>{errorMsg}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleLogin}>로그인</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default LoginModal;
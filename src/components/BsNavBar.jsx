// src/components/BsNavBar.jsx

import axios from 'axios';
import React from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../api';

function BsNavBar(props) {
    //store 의 상태값을 바꿀 함수
    const dispatch = useDispatch();
    //redux store 로 부터 상태값 가져오기
    const userInfo = useSelector(state => state.userInfo);
    // route 이동을 하기 위한 hook
    const navigate = useNavigate();
    //로그아웃 타이머
    const logoutTimer = useSelector(state => state.logoutTimer);

    return (
        <>
            <Navbar fixed="top" expand="md" className="bg-warning mb-2">
                <Container>
                    <Navbar.Brand as={NavLink} to="/">Acorn</Navbar.Brand>
                    <Navbar.Toggle aria-controls="one" />
                    <Navbar.Collapse id="one">
                        <Nav className='me-auto'>
                            <Nav.Link as={NavLink} to="/">Home</Nav.Link>
                            <Nav.Link as={NavLink} to="/posts">Post</Nav.Link>
                            <Nav.Link as={NavLink} to={"/quiz"}>Quiz</Nav.Link>
                        </Nav>
                        {/* 해당 값이 존재한다면... 실행 */}
                        {/* null, undefined ,"" , 0 , false = 값이 존재하지 않음 */}
                        {userInfo ?
                            <>
                                <Nav >
                                    {/* router 의 link 로 역할을 설정 */}
                                    <Nav.Link as={Link} to="/user/detail">{userInfo.userName}</Nav.Link>
                                    <span className='navbar-text'>Signed in</span>
                                </Nav>
                                <Button className='ms-1' size='sm' variant='outline-primary' onClick={()=>{
                                    //알람창을 띄우면서 결과값을 boolean 으로 출력함
                                    const isLogout = window.confirm("확인을 누르면 로그아웃 됩니다.");
                                    // console.log(isLogout); 
                                    // 로그아웃의 알림창의 취소 클릭
                                    if(!isLogout)return;
                                    //로컬 저장소에 있는 토큰 삭제
                                    delete localStorage.token;
                                    //요청 헤더에 token 포함되도록 설정한 것 삭제하기
                                    delete api.defaults.headers.common["Authorization"]
                                    // store 에 userInfo 를 초기화
                                    // dispatch({type:"USER_INFO", payload: null })
                                    //인덱스로 이동
                                    navigate("/");
                                    //로그아웃 타이머 초기화
                                    // 리덕스 스토어에 있는 timer 삭제하기
                                    clearTimeout(logoutTimer);
                                    dispatch({
                                        type:"LOGOUT_TIMER",
                                        payload:null
                                    })
                                }}>Logout</Button>
                            </>
                            :
                            <>
                                <Button size='sm' variant='success' onClick={() => {
                                    // type: 원하는 요청 동작으로 payload : 값을 이렇게 변경해줘
                                    const action = {
                                        type: "LOGIN_MODAL", payload: {
                                            title: "로그인 폼",
                                            show: true
                                        }
                                    };
                                    dispatch(action);
                                }}>Sign in</Button>
                                <Button className='ms-1' size='sm' variant='primary'>Sign Up</Button>
                            </>
                        }
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}

export default BsNavBar;
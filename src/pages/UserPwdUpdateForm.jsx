// src/pages/UserPwdUpdateForm.js

import axios from "axios";
import { useState } from "react";
import { Alert, Breadcrumb, BreadcrumbItem, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";



function UserPwdUpdateForm() {
    // 공백이 아닌 한글자가 1 번이상 반복되어야 통과되는 정규 표현식 
    const reg_password = /^[^\s]+$/
    // 특수문자가 포함되어야 통과되는 정규표현식
    const reg_newPassword = /[\W]/

    //폼에 입력한 내용을 상태값으로 관리
    const [formData, setFormData] = useState({
        password: "",
        newPassword: "",
        newPassword2: ""
    })

    //폼의 유효성 여부를 상태값으로 관리
    const [isValid, setValid] = useState({
        password: false,
        newPassword: false
    })

    //폼입력란에 한번이라도 입력했는지 여부를 상태값으로 관리
    const [isDirty, setDirty] = useState({
        password: false,
        newPassword: false
    })

    //에러메세지를 관리하기 위한 상태값
    const [error, setError] = useState({
        show: false,
        message: ""
    })

    // input 요소에 change 이벤트가 일어 났을때 실행할 함수 
    const handleChange = (e) => {
        // e.target 은  name 과 value 가 있는 object 인데 해당 object 의 구조를 분해 할당한다.
        // 기존 비밀번호와 새로운 비밀번호 동적 선택
        const { name, value } = e.target

        //만일 현재 입력란이 아직 더럽혀지지 않았다면
        // 기존 비밀번호 작성 시 password 의 true 로 변함
        if (!isDirty[name]) {
            //더럽혀 졌는지 여부를 변경하기 
            setDirty({
                ...isDirty,
                [name]: true
            })
        }
        // 입력 데이터로 상태 변경
        setFormData({
            ...formData,
            [name]: value
        })
        validate(name, value)
    }

    //검증 함수
    const validate = (name, value) => {
        // 정규 표현식 검증
        if (name === "password") {
            setValid({
                ...isValid,
                [name]: reg_password.test(value)
            })
        } else if (name === "newPassword") {            
            // 두 개의 입력값이 일치하는지 = 입력한 newPassword 가 newPassword2 와 일치하는지  
            const isEqual = value === formData.newPassword2
            setValid({
                ...isValid,
                newPassword: reg_newPassword.test(value) && isEqual //정규식을 통과 && newPassword2 와 일치하는지
            })
        } else if (name === "newPassword2") {
            const isEqual = value === formData.newPassword
            setValid({
                ...isValid,
                newPassword: reg_newPassword.test(value) && isEqual
            })
        }
    }

    const navigate = useNavigate()
    const dispatch = useDispatch()

    //폼 전송 이벤트가 발생했을때 실행할 함수
    const handleSubmit = (e) => {
        e.preventDefault()
        api.patch("/user/password", formData)
            .then(res => {
                console.log(res.data)
                //정상적으로 비밀번호가 변경되었다면 어떤 처리를 해야하나?
                //로컬 저장소에 있는 토큰 삭제
                delete localStorage.token;
                //요청 헤더에 token 포함되도록 설정한 것 삭제하기
                delete api.defaults.headers.common["Authorization"]
                // store 에 userInfo 를 초기화
                dispatch({ type: "USER_INFO", payload: null })
                //인덱스로 이동
                navigate("/");

                //로그인 모달의 띄운다.
                dispatch({
                    type: "LOGIN_MODAL",
                    payload: {
                        title: "변경된 비밀 번호로 로그인",
                        show: true
                    }
                });
            })
            .catch(error => {
                console.log(error)
                //에러가 발생하면 어떤 처리를 해야 하나?
                //에러 메시지

                const message = error.response.data
                setError({
                    show: true,
                    message // message : message 
                })
            })
    }

    return (
        <>
            <h1>비밀번호 수정 양식</h1>
            <Breadcrumb>
                <BreadcrumbItem as={Link} to="/" href='/'>Home</BreadcrumbItem>
                <BreadcrumbItem href="/user/detail" to="/user/detail" as={Link}>User</BreadcrumbItem>
                <Breadcrumb.Item active>비밀번호 수정</Breadcrumb.Item>
            </Breadcrumb>
            
            {error.show && <Alert variant="danger">{error.message}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>기존 비밀 번호</Form.Label>
                    {/* 값을 입력하면 실시간으로 검증 작업 이뤄짐 handleChange 가 실행되면   */}
                    <Form.Control isValid={isValid.password}
                        isInvalid={!isValid.password && isDirty.password} onChange={handleChange} type="password" name="password" />
                    <div className="form-text">
                        반드시 입력하세요!
                    </div>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>새 비밀 번호</Form.Label>
                    {/* 유효하지 않음 =  더러워지고 무효함  */}
                    <Form.Control isValid={isValid.newPassword}
                        isInvalid={!isValid.newPassword && isDirty.newPassword} onChange={handleChange} type="password" name="newPassword" />
                    <div className="form-text">
                        특수문자를 하나이상 포함하고 확인란과 같아야 합니다
                    </div>
                    {/*  무효하면    */}
                    <Form.Control.Feedback type="invalid">
                        비밀번호를 확인하세요!
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>새 비밀 번호 확인</Form.Label>
                    <Form.Control onChange={handleChange} type="password" name="newPassword2" />
                </Form.Group>
                <Button disabled={!isValid.password || !isValid.newPassword} variant="success" size="sm" type="submit">저장</Button>
            </Form>
        </>
    );
}

export default UserPwdUpdateForm;
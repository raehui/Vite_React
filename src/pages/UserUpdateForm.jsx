// src/pages/UserUpdateForm.jsx

import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function UserUpdateForm(props) {
    const [user, setUser] = useState({});
    const [imageSrc, setImageSrc] = useState(null);
    //원래 프로필 이미지 데이터를 저장해 놓기 위해
    const [savedImageSrc, setSavedImageSrc] = useState(null);

    useEffect(() => {
        api.get("/user")
            .then(res => {
                console.log(res.data);
                setUser(res.data);
                //만일 등록된 프로필 이미지가 있다면
                if (res.data.profileImage) {
                    setImageSrc(`/upload/${res.data.profileImage}`);
                    setSavedImageSrc(`/upload/${res.data.profileImage}`);
                } else { // 없으면 기본 svg 이미지 출력
                    //파일에서 직접 이미지를 읽어옴
                    // person svg 이미지를 읽어들여서 data url 로 만든다음 imageSrc 에 반영하기 
                    // svg 이미지를 2 진 데이터 문자열로 읽어들여서 
                    const svgString = new XMLSerializer().serializeToString(personSvg.current)
                    // 2진데이터 문자열을 btoa (binary to ascii) 함수를 이용해서 ascii 코드로 변경
                    const encodedData = btoa(svgString)
                    // 변경된 ascii 코드를 이용해서 dataUrl 을 구성한다 
                    const dataUrl = "data:image/svg+xml;base64," + encodedData;
                    setImageSrc(dataUrl);
                    setSavedImageSrc(dataUrl)

                }
            })
            .catch(error => {

            });
    }, []);
    // dropZone 의 스타일 
    const dropZoneStyle = {
        minHeight: "300px",
        border: "3px solid #cecece",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer"
    }
    const profileStyle = {
        width: "200px",
        height: "200px",
        border: "1px solid #cecece",
        borderRadius: "50%"
    }
    //사각형 영역에 파일이 drop 되었을때 호출되는 함수 
    const handleDrop = (e) => {
        e.preventDefault(); //웹브라우저의 기본 동작 막기
        //drop 된 파일 객체 얻어내기
        const file = e.dataTransfer.files[0];
        //파일의 type을 조사해서 이미지가 아니면 함수를 종료한다.
        const reg = /image/;
        if (!reg.test(file.type)) {
            alert("이미지 파일을 drop 하세요");
            return;
        }
        //파일로 부터 데이터를 읽어들일 객체 생성
        const reader = new FileReader()
        //파일을 DataURL 형식의 문자열로 읽어들이기
        reader.readAsDataURL(file)
        //로딩이 완료(파일데이터를 모두 읽었을때) 되었을때 실행할 함수 등록
        reader.onload = (event) => {
            //읽은 파일 데이터 얻어내기 
            const data = event.target.result;
            //읽은 data url 을 상태값에 넣어주기 
            setImageSrc(data);
        }
        //input type ="file" 요소에 drop 된 파일의 정보 넣어주기 (form 전송할 때 전송이 될 수 있도록)
        imageInput.current.files = e.dataTransfer.files;
    };

    // svg 기본 이미지도 data url 로 읽어들일 수 있음
    const personSvg = useRef();
    const profileStyle2 = {
        width: "200px",
        height: "200px",
        border: "1px solid #cecece",
        borderRadius: "50%",
        display: "none"
    }
    const imageInput = useRef();

    // input type="file" 요소에 change 이벤트가 일어 났을때 호출되는 함수 
    const handleChange = (e) => {
        //선택한 파일 객체
        const file = e.target.files[0]
        //파일로 부터 데이터를 읽어들일 객체 생성
        const reader = new FileReader()
        //파일을 DataURL 형식의 문자열로 읽어들이기
        reader.readAsDataURL(file)
        //로딩이 완료(파일데이터를 모드 읽었을때) 되었을때 실행할 함수 등록
        reader.onload = (event) => {
            //읽은 파일 데이터 얻어내기 
            const data = event.target.result
            setImageSrc(data)
        }
    }
    // 폼에 reset 이벤트가 일어 낫을 때 호출되는 함수
    const handleReset = () =>{
        setImageSrc(savedImageSrc);

    }
    const navigate = useNavigate();

    //폼에 submit 이벤트가 일어 났을 때 호출되는 함수
    const handleSubmit = (e) =>{
        e.preventDefault();
        //폼에 입력한 내용을 이용해서 FormData 객체를 생성한다.
        const formData = new FormData(e.target);
        //axios 를 이용해서 multipart/form-data 를 전송하기
        api.patch("/user", formData, {
            headers:{"Content-Type": "multipart/form-data"}
        })
        .then(res=>{
            alert("수정했습니다!");
            navigate("/user/detail");
        })
        .catch(error => {
            console.log(error);
        })
    };


    return (
        <>
            {/* 디코딩해서 데이터 url 을 얻어옷 있다. */}
            <svg ref={personSvg} style={profileStyle2} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
            </svg>

            <h1>개인 정보 수정 양식</h1>
            <Breadcrumb>
                <BreadcrumbItem as={Link} to="/" href='/'>Home</BreadcrumbItem>
                <BreadcrumbItem href="/user/detail" to="/user/detail" as={Link}>User</BreadcrumbItem>
                <Breadcrumb.Item active>개인정보 수정</Breadcrumb.Item>
            </Breadcrumb>
            
            <Form onReset={handleReset} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>사용자명</Form.Label>
                    <Form.Control name="userName" defaultValue={user.userName} readOnly />
                </Form.Group>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>이메일</Form.Label>
                    <Form.Control name="email" defaultValue={user.email} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>프로필 이미지 ( click or drag-drop to Edit ) </Form.Label>
                    {/* dto 와 name 속성 일치시키기 */}
                    <Form.Control ref={imageInput} onChange={handleChange} style={{ display: "none" }} type="file" name="profileFile" accept="image/*" />
                </Form.Group>
                <div className="mb-3">
                    <a href="about:blank" onClick={(e) => {
                        e.preventDefault()
                        // input  type="file" 요소를 강제 클릭 
                        imageInput.current.click();

                    }}>
                        <div style={dropZoneStyle} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                            {imageSrc && <img style={profileStyle} src={imageSrc} alt="프로필 이미지" />}
                        </div>
                    </a>
                </div>
                <Button type="submit" variant="success" size="sm">수정확인</Button>
                <Button  className="ms-1" type="reset" variant="danger" size="sm">Reset</Button>
            </Form>
        </>
    );
}

export default UserUpdateForm;
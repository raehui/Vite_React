import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Button, FloatingLabel, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { initEditor } from '../editor/SmartEditor';
import AlertModal from '../components/AlertModal';
import api from '../api';

function PostUpdateForm(props) {
    //수정할 글번호 추출
    // "/posts/:num/edit" 에서 num 에 해당되는 경로 파라미터 값 읽어오기
    const {num} = useParams();

    //SmartEditor 에 작성한 내용을 textarea 의 value 로 넣어 줄때 필요한 함수가 editorTool 이다 
    const [editorTool, setEditorTool] = useState([])

    //원래 글의 내용을 state 에 저장해 놓는다.
    const [savedData, setSavedData] = useState({});
    
    // component 가 활성화 되는 시점에 호출되는 함수
    // 비동기 동작시 장점
    useEffect(()=>{
        //initEditor() 함수를 호출해야 smartEditor 가 초기화 된다.
        setEditorTool(initEditor("content"));

        //비동기로 동작(호출하면 바로 리턴하지만 안에 있는 code 는 모두 실행된 상태가 아닌 비동기 함수)
        const fetchPost = async () =>{
            try{
                const res = await api.get(`/posts/${num}`); // await axios 가 다 실행될 때까지 기다림
                //글정보를 콘솔창에 출력하기
                console.log(res.data);
                //글 제목과 내용을 input 요소에 넣어주기
                inputTitle.current.value=res.data.title;
                inputContent.current.value =res.data.content;
                //글 정보를 저장해 놓는다.
                setSavedData(res.data);

            }catch(error){
                console.log(error);
            }
        };
        fetchPost();
        console.log("fetchPost 함수 호출함"); // 위의 함수가 모두 실행되기 전에 실행된다.

    },[]);

    // 제목을 입력할 input type ="text" 와 내용을 입력할 textarea 의 참조값을 관리하기 위해 
    const inputTitle = useRef();
    const inputContent = useRef();

    const handleSubmit = (e) =>{
        e.preventDefault();
        // 에디터 tool 을 이용해서 스마트 에디터의 내용을 textarea 의 value 로 변경하기
        editorTool.exec();

        const title = inputTitle.current.value;
        const content = inputContent.current.value;
        //수정반영 요청을 하는 비동기 함수
        const updatePost = async() =>{
            try{
                const res = await api.patch(`/posts/${num}`, {title,content});
                console.log(res.data); // dto 가 odject 로 변경되어서 
                //글 자세히 보기로 이동
                //모달을 띄운 다음 글 자세히 보기로 이동되도록 한다.
                setShowModal(true);
                

            }catch(error){
                console.log(error);
            }
        };
        updatePost();

    }

    

    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleReset  = (e) =>{
        e.preventDefault(); // 기본 이벤트 막아주기(reset)
        console.log(savedData.title);
        //title 을 원상복구
        inputTitle.current.value = savedData.title;
        // 스마트 에디터에 출력된 내용 원상 복구
        editorTool.setContents(savedData.content)
        
    }

    return (
        <>  
            {/* 미리 만들어놓은 모달 요소 사용함 */}
            <AlertModal show={showModal} message="수정했습니다." onYes={()=>{
                navigate(`/posts/${num}`);
            }}/>
            <h1>글 수정 양식</h1>  
            <Form>
                <FloatingLabel label="제목" className='mb-3' controlId='title'>
                    <Form.Control ref={inputTitle} type='text'/>
                </FloatingLabel>
                <Form.Group className='mb-3' controlId='content'>
                    <Form.Label>내용</Form.Label>
                    <Form.Control ref={inputContent} as="textarea" style={{height: "300px"}}/>
                </Form.Group>
                <Button type='submit' onClick={handleSubmit}>수정확인</Button>
                <Button type='reset' variant='danger' onClick={handleReset}>Reset</Button>
            </Form>
            
        </>
    );
}

export default PostUpdateForm;
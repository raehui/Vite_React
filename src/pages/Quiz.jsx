import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, ProgressBar } from 'react-bootstrap';
// gemini 가 응답한 markdown 을 해석하기 위한 페키지 설치 및 import
import MarkDown from 'react-markdown';
// CodeMirror 를 사용하기 위해 3개의 페키지를 설치 하고 import 해야 한다 
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { java } from '@codemirror/lang-java';

// MarkDown 에  코드 블럭을 prettify 하기 위해 
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; //github 과 동일한 스타일로 코드 디자인이 된다.
import ConfirmModal from '../components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
//import "highlight.js/styles/atom-one-dark.css"  // dark 테마 스타일 코드 
import { AnimatePresence, motion } from "framer-motion";
import api from '../api';

/*
    - CodeMirror 를 사용하기 위해 3개의 package 가 설치 되어 있어야 한다.
    npm install @uiw/react-codemirror @codemirror/lang-javascript @uiw/codemirror-theme-dracula

    - MarkDown 을 사용하기 위해서는 아래의  package 가 설치 되어 있어야 한다.
    npm install react-markdown
    
    - MarkDown 을 출력할 때 code 를 이쁘게 출력하기 위한 package 
    npm install rehype-highlight

    - transtion 또는 animation 을 화면 전환할 때 사용하기 위한 package 
    npm install framer-motion 

    - Framer Motion 동작 공식 도큐먼트
    https://motion.dev/docs/react-animate-presence
    
*/

function Quiz(){
    const quizs = [
        { content: "1부터 10까지 숫자를 콘솔에 출력하는 JavaScript 코드를 작성하세요.", score: 10 },
        { content: "변수 `name`에 본인의 이름을 저장하는 코드를 작성하세요.", score: 10 },
        { content: "`num1`과 `num2` 두 숫자의 합을 구해서 출력하는 코드를 작성하세요.", score: 10 },
        { content: "`for` 문을 사용하여 1부터 5까지의 합을 계산하는 코드를 작성하세요.", score: 10 },
        { content: "`if`문을 사용하여 어떤 숫자가 짝수인지 홀수인지 출력하는 코드를 작성하세요.", score: 10 },
        { content: "객체 `person`을 만들고, 그 안에 `name`, `age` 속성을 추가해 보세요.", score: 10 },
        { content: "배열 `[1, 2, 3, 4, 5]`의 모든 요소를 순회하며 출력하는 코드를 작성하세요.", score: 10 },
        { content: "`function` 키워드를 사용해서 두 수를 곱하는 함수를 작성하세요.", score: 10 },
        { content: "`setTimeout`을 사용해서 3초 후에 'Hello'를 출력하는 코드를 작성하세요.", score: 10 },
        { content: "현재 날짜와 시간을 콘솔에 출력하는 코드를 작성하세요.", score: 10 }
      ];

    useEffect(()=>{
        //DB 에서 불러온 데이터를 state 에 넣어준다.
        setState({
            ...state,
            list:quizs.map(item=>{
                //isCorrect 라는 키값으로 null 을 넣어준다. 
                item.isCorrect=null;
                return item;
            })
        })
    }, []);
    
    const handleSubmit = ()=>{

        //질문과 입력한 답을 json 으로 전송한다.
        api.post("/gemini/quiz", {
            quiz:state.list[state.index].content,
            answer:state.inputCode //state 에 있는 내용을 전송한다 
        })
        .then(res=>{
            // res.data 는 이런 모양의 object 이다 {isCorrect:true or false, comment:"마크다운"}
            console.log(res.data);
            setState({
                ...state,
                ...res.data,
                isAnswered:true,
                list:state.list.map((item, index) => {
                    //만일 item 의 index 가 현재 문제를 푼 index 라면 
                    if(index === state.index){
                        //체점 결과를 넣어준다. 
                        item.isCorrect=res.data.isCorrect;
                    }
                    return item;
                }),
                progress: state.progress + state.list[state.index].score,
                isFinish: state.index === state.list.length -1 
            })
        })
        .catch(error=>console.log(error));
    }

    const [state, setState] = useState({
        isFinish:false,
        progress:0,
        list:[],
        index:0, //문제의 index 값 state 로 관리 
        isAnswered:false,
        isCorrect:false,
        inputCode:"" //입력한 code 를 state 로 관리  
    });
    //다시 풀기 버튼을 눌렀을때 실행되는 함수
    const handleRetry = ()=>{
        setState({
            ...state, 
            isAnswered:false
        });
    }
    const handleNext = ()=>{
       //문제의 index 1 증가, isAnswered : false, inputCode:""
       setState({
            ...state,
            index:state.index+1,
            isAnswered:false,
            inputCode:""
       });
    }
    //결과보기 버튼을 눌렀을때 
    const handleFinish = ()=>{
        //총점 계산하기 
        let totalScore=0;
        for(let i=0; i<state.list.length; i++){
            // i번째 item 을 불러와서 
            const item = state.list[i];
            //만일 정답을 맞추었으면
            if(item.isCorrect){
                // totalScore 에 획득한 점수를 누적 시킨다.
                totalScore += item.score;
            }
        }

        // reduce 함수를 이용해서 총점 계산하기
        const totalScore2 = state.list.reduce((sum, item) => {
            if(item.isCorrect){
                return sum + item.score;
            }else{
                return sum;
            }
        }, 0);

        //한줄로 표현하면
        const totalScore3 = state.list.reduce((sum, item) => item.isCorrect ? sum+item.score : sum, 0);

        setModal({
            show:true,
            message:`${totalScore} 점입니다. 확인을 누르면 다시 풀기, 취소를 누르면 종료됩니다.`
        });
    }
    //모달의 상태값 제어 
    const [modal, setModal] = useState({
        show:false,
        message:""
    });

    const handleYes = ()=>{
        //초기 상태로 만들기
        setState({
            isFinish:false,
            progress:0,
            list:quizs.map(item=>{
                //isCorrect 라는 키값으로 null 을 넣어준다. 
                item.isCorrect=null;
                return item;
            }),
            index:0, //문제의 index 값 state 로 관리 
            isAnswered:false,
            isCorrect:false,
            inputCode:"" //입력한 code 를 state 로 관리  
        });
        setModal({show:false});
    }
    const navigate = useNavigate();
    const handleCancel = ()=>{
        setModal({show:false});
        navigate("/");
    }
    const [show, setShow] = useState(true);

    return (
        <>  
            {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
            <ConfirmModal show={modal.show} message={modal.message} onYes={handleYes} onCancel={handleCancel}/>
            <h1> javascript 문제</h1>
            <ProgressBar now={state.progress} animated variant='success' className="mb-2"/>
            <ProgressBar>
                { state.list.map(item=> item.isCorrect !== null && 
                    <ProgressBar  now={item.score} animated variant={item.isCorrect ? "success" : "danger"}/>)}
            </ProgressBar>
            <AnimatePresence mode="wait">
                { state.isAnswered ? (
                    // key 는 React 가 애니메이션을 적용한 대상의 단서
                <motion.p
                    key="p1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                   <div>
                        <h3>체점 결과</h3>
                        { state.isCorrect ?
                            <Alert variant='success' >축하 합니다 정답 입니다</Alert>
                            :
                            <Alert variant='danger' >오답 입니다</Alert>
                        }
                        <MarkDown rehypePlugins={rehypeHighlight}>{state.comment}</MarkDown>
                        <Button onClick={handleRetry} variant='warning' className="me-3"> &larr; 다시 풀기</Button>
                        { state.isFinish ?
                            <Button onClick={handleFinish} variant='primary'>결과보기</Button>
                        :
                            <Button onClick={handleNext} variant='success'>다음 문제 &rarr;</Button>
                        }
                    </div>
                </motion.p>
                ) : (
                <motion.p
                    key="p2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                {/* 최초 렌더링시 (useEffect 실행 전) list가 아예 존재하지 않기에 에러 발생함  */}
                { state.list.length > 0 && 
                    <div>
                        <div>
                            <strong>{`${state.index+1}. 번 `}</strong> 
                            <strong>{`배점:${state.list[state.index].score}`}</strong>
                            <MarkDown rehypePlugins={rehypeHighlight}>{state.list[state.index].content}</MarkDown>
                        </div>
                        <CodeMirror style={{fontSize:"20px"}}
                            extensions={[javascript()]}
                            theme={dracula}
                            height='300px'
                            value={state.inputCode}
                            // readOnly 를 사용하면 출력용으로 사용 가능
                            onChange={value => setState({...state, inputCode:value})}/>
                
                        <Button onClick={handleSubmit}>제출</Button>
                    </div>  
                }    
                </motion.p>
                )}
            </AnimatePresence>    
        </>
    )
}

export default Quiz;
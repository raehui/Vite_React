import { useLocation, useOutlet } from "react-router-dom";
//bootstrap css 로딩하기 
import 'bootstrap/dist/css/bootstrap.css'
import BsNavBar from "./components/BsNavBar";
import LoginModal from "./components/LoginModal";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AnimatePresence, motion } from "framer-motion";
// "/api" 라는 요청경로가 붙어있는 axios 객체이다.
import api from "./api";

function App(){

    const currentOutlet=useOutlet();
    //로그인 모달의 상태값을 redux store 로 부터 얻어낸다.
    const loginModal= useSelector(state=>state.loginModal);
    const dispatch = useDispatch();

    //App component 가 활성화 되는 시점에 token 관련 처리
    useEffect(()=>{
        const token=localStorage.token;
        let logoutTimer=null;
        //만일 토큰이 존재한다면
        if(token){
            api.get("/ping", {
                headers:{Authorization:token}
            })
            .then(()=>{
                //여기가 실행되면 사용가능한 token 이라는 의미이다 
                //토큰을 디코딩해서 userName 을 얻어온다. 
                const decoded=jwtDecode(token.substring(7));
                const exp = decoded.exp * 1000; 
                const now = Date.now();

                const remainingTime = exp - now;
                //자동 로그아웃 예약
                logoutTimer=setTimeout(()=>{
                    doLogout();
                }, remainingTime);
                    
                //발행할 action
                const action={type:"USER_INFO", payload:{
                    userName:decoded.sub,
                    role:decoded.role
                }};
                //액션 발행하기
                dispatch(action);
            })
            .catch(()=>{
                delete localStorage.token;
            })
        }
        const doLogout = () => {
            delete localStorage.token;
            dispatch({ type: 'USER_INFO', payload: null });
            alert('토큰이 만료되어 자동 로그아웃 되었습니다.');
        };

        //여기서 리턴한 함수는 이 컴포넌트가 비활성화 되기 직전에 호출된다.(무언가 마무리 작업을 하기 적당함)
        return ()=>{
           if(logoutTimer)clearTimeout(logoutTimer);
        };
    }, []);
    
    const location = useLocation();

    return (
        <>
            <BsNavBar/>
            <div className="container" style={{marginTop:"60px"}}>
            <div style={{ position: "relative", overflow: "hidden" }}>
                <AnimatePresence mode="wait">
                    {/* key가 바뀌면 AnimatePresence가 페이지 전환으로 인식 */}
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                       <div>{currentOutlet}</div>
                    </motion.div>
                </AnimatePresence>
            </div>
            </div>
            <LoginModal show={loginModal.show}/>
        </>
        
    )
}

export default App;
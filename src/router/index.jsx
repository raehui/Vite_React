// src/router/index.jsx
import { createBrowserRouter, createHashRouter } from "react-router-dom";
import Home from "../pages/Home";
import App from "../App";
import Post from "../pages/Post";
import UserDetail from "../pages/UserDetail";
import ProtectedRoute from "../components/ProtectedRoute";
import UserUpdateForm from "../pages/UserUpdateForm";
import UserPwdUpdateForm from "../pages/UserPwdUpdateForm";
import PostForm from "../pages/PostForm";
import PostDetail from "../pages/PostDetail";
import PostUpdateForm from "../pages/PostUpdateForm";
import Quiz from "../pages/Quiz";



// 라우팅 정보를 배열에 미리 저장해 둔다.
// 경로에 따라서 component 를 활성화
const routes=[
    // spring boot 서버에 넣어서 실행하면 최초 로딩될때 /index.html 경로로 로딩된다.
    // 그럴때도 Home 컴포넌트가 활성화 될 수 있도록 라우트 정보를 추가한다.
    {path:"/index.html",element:<Home/>},
    {path:"/",element:<Home/>},
    {path:"/posts",element:<Post/>},
    {path:"/user/detail",element:<ProtectedRoute ><UserDetail/></ProtectedRoute>},
    {path:"/user/edit",element:<ProtectedRoute><UserUpdateForm/></ProtectedRoute>},
    {path:"/user/password/edit",element:<ProtectedRoute><UserPwdUpdateForm/></ProtectedRoute>},
    {path:"/posts/new", element:<ProtectedRoute><PostForm/></ProtectedRoute>},
    {path:"/posts/:num", element:<PostDetail/>},
    {path:"/posts/:num/edit", element:<ProtectedRoute><PostUpdateForm/></ProtectedRoute>},
    {path:"/quiz", element: <Quiz/>}



];

//export 해출 router 객체를 만든다.
//이동시켜주는 객체
const router = createHashRouter([{
    path:"/",
    element:<App/>,
    children: routes.map((route)=>{
        return {
            index: route.path === "/", //자식의 path 가 "/" 면 index 페이지 역활을 하게 하기 
            path: route.path === "/" ? undefined : route.path, // path 에 "/" 두개가 표시되지 않게  
            element: route.element //어떤 컴포넌트를 활성화 할것인지 
        }
    })
}]);

export default router;


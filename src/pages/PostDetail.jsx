// src/pages/PostDetail.jsx

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

//module css 를 import 해서 cx 함수로 사용할 준비를 한다.
import customCss from "./css/cafe_detail.module.css";
import binder from "classnames/bind";
import { useDispatch, useSelector } from 'react-redux';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api';
const cx=binder.bind(customCss);

function PostDetail(props) {
    // "/posts/:num" 에서 num 에 해당되는 경로 파라미터 값 읽어오기
    const {num} = useParams()
    //글 하나의 정보를 상태값으로 관리
    const [state, setState]=useState({})
    //검색 키워드 관련처리
    const [params, setParams]=useSearchParams({
        condition:"",
        keyword:""
    });
    //로그인된 userName
    const userName = useSelector(state => state.userInfo && state.userInfo.userName);

    const navigate = useNavigate();


    useEffect(()=>{
        const query=new URLSearchParams(params).toString();
        api.get(`/posts/${num}${params.get("condition") ? "?"+query : ""}`)
        .then(res=>{
            console.log(res.data);
            //글하나의 정보를 상태값에 넣어주고 
            setState(res.data);
        })
        .catch(error=>{
            console.log(error);
        });
        //댓글 목록 받아오기
        refreshComments();
    }, [num]);

    const [modalShow, setModalShow] = useState(false);
    //액션을 발행할 dispatch 함수 
    const dispatch = useDispatch();

    //원글에 댓글 추가폼 이벤트 처리
    const handleCommentFormSubmit = (e)=>{
        e.preventDefault();
        //만일 로그인을 하지 않은 상태라면 
        if(!userName){
            const action={
                type:"LOGIN_MODAL",
                payload:{
                    show:true,
                    title:"댓글 작성을 위해 로그인이 필요 합니다."
                }
            };
            dispatch(action);
            return; //함수를 여기서 종료한다. 
        }
        //폼에 입력한 내용을 object 로 얻어낸다.
        const formData=new FormData(e.target);
        const formObject=Object.fromEntries(formData.entries());
        //새댓글 추가 요청
        api.post(`/posts/${num}/comments`, formObject)
        .then(res=>{
            console.log(res.data);
            refreshComments();
            //댓글 입력창 초기화
            e.target.content.value=""; //textarea 의 value 에 빈 문자열 넣어주기 
        })
        .catch(error=>console.log(error));
    };
    //댓글 정보를 상태값으로 관리
    const [comments, setComments] = useState({
        list:[],
        totalPageCount:0,
        isLoading:false, // 현재 로딩중 여부
        currentPage:1, // 현재 댓글 페이지
        btnDisabled:true //버튼 disabled 여부
    
    });

    //댓글 정보를 얻어오는 함수
    const refreshComments = ()=>{
        api.get(`/posts/${num}/comments?pageNum=1`)
        .then(res=>{
           setComments({
            ...comments,
            list:res.data.list,
            totalPageCount:res.data.totalPageCount,
            btnDisabled:res.data.totalPageCount ===1
           });
        })
        .catch(error=>console.log(error));
    };

    const handleMoreBtn = ()=>{
        //로딩중에 여러번 눌러지지 않도록 
        if(comments.isLoading)return;
        //현재 댓글 페이지 번호보다 1 이 더큰 댓글 페이지를 요청한다.
        const page = comments.currentPage + 1;
        //로딩 중이라고 상태값 변경
        setComments({...comments, isLoading:true});
        api.get(`/posts/${num}/comments?pageNum=${page}`)
        .then(res=>{
            setComments({
                ...comments,
                list:[...comments.list, ...res.data.list],
                isLoading:false,
                currentPage:page,
                btnDisabled:res.data.totalPageCount === page

            });
        })
        .catch(error=>{
            console.log(error);
            setComments({...comments,isLoading:false});
        });
       
        
    };

    return (
        <>
            {/* state 는 자세히 보는 글의 정보 */}
            <ConfirmModal show={modalShow} message="이 글을 삭제 하시겠습니까?" 
                onCancel={()=>setModalShow(false)} onYes={()=>{
                    api.delete(`/posts/${state.num}`)
                .then(res=>{
                    navigate("/posts");
                })
                .catch(error=>{
                    console.log(error);
                });
                setModalShow(false);
            }}/>
            {state.prevNum !== 0 ? <Link to={`/posts/${state.prevNum}${params.get("condition") && "?"+new URLSearchParams(params).toString() }`}>이전글</Link> : ""}
            {state.nextNum !== 0 ? <Link to={`/posts/${state.nextNum}${params.get("condition") && "?"+new URLSearchParams(params).toString() }`}>다음글</Link> : ""}
            <h1>글 자세히 보기 페이지</h1>
            <Table>
                <thead>
                    <tr>
                        <th>번호</th>
                        <td>{state.num}</td>
                    </tr>
                    <tr>
                        <th>작성자</th>
                        <td>{state.writer}</td>
                    </tr>
                    <tr>
                        <th>제목</th>
                        <td>{state.title}</td>
                    </tr>
                    <tr>
                        <th>조회수</th>
                        <td>{state.viewCount}</td>
                    </tr>
                    <tr>
                        <th>수정일</th>
                        <td>{state.updatedAt}</td>
                    </tr>
                    <tr>
                        <th>작성일</th>
                        <td>{state.createdAt}</td>
                    </tr>
                </thead>
            </Table>
            <div className={cx("content")} dangerouslySetInnerHTML={{__html:state.content}}></div>
            {
                userName === state.writer ?
                <> 
                    <Button variant='warning' onClick={()=>{
                        navigate(`/posts/${state.num}/edit`);
                    }}>수정</Button>
                    <Button variant='danger' onClick={()=>setModalShow(true)}>삭제</Button>
                </>
                :   ""
            }
            <h4>댓글을 입력해 주세요</h4>
            <form onSubmit={handleCommentFormSubmit} className={cx("comment-form")} method="post">
                <input type="hidden" name="postNum" defaultValue={num}/>
                <input type="hidden" name="targetWriter" defaultValue={state.writer}/>
                <textarea name="content" defaultValue={!userName ? '댓글 작성을 위해 로그인이 필요 합니다' : '' }></textarea>
                <button type="submit">등록</button>
            </form>
            <div className={cx("comments")}>
                <ul>
                    { comments.list.map(item => <CommentLi key={item.num} postNum={num} comment={item} onRefresh={refreshComments}/> ) }
                </ul>
                <div className="d-grid col-sm-6 mx-auto mb-5">
                    <button className="btn btn-success" disabled={comments.btnDisabled} onClick={handleMoreBtn}>
                        { comments.isLoading ?
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            :
                            <span>댓글 더보기</span>
                        }
                    </button>
                </div>
            </div>
        </>
    );
}

/*
    <CommentLi  postNum={1}  comment={{댓글하나의정보}}  onRefresh={()=>{}}/>
*/
function CommentLi({postNum, comment, onRefresh}){
    //로그인된 userName 얻어내기 (로그인 상태가 아니면 null)
    const userName = useSelector(state => state.userInfo && state.userInfo.userName);

    // 프로필 이미지 처리
    const profileImage = comment.profileImage ? 
        <img className={cx("profile-image")} src={`/upload/${comment.profileImage}`} alt="프로필"/>
    : 
        <svg className={cx("profile-image","default-icon")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
        </svg>; 
                
    /*
        link 에 대입 되는 값은  false 또는 a 요소 2개가 들어 있는 jsx 객체가 대입된다.
        react 는 boolean 값은 UI 에 랜더링하지 않는다.
    */
    const link = userName === comment.writer && <>
        <button className={cx("update-link")} >수정</button>
        <button className={cx("delete-link")} >삭제</button>
    </>;
    
    //대댓글 등록폼 submit 이벤트 처리
    //postNum 은 li 에서 받아온 값으로 num 이랑 동일함.(원글의 글번호)
    const handleReInsertSubmit = (e)=>{
        e.preventDefault();
        //폼에 입력한 내용을 object 로 얻어낸다.
        const formData=new FormData(e.target);
        const formObject=Object.fromEntries(formData.entries());
        //새로운 댓글을 axios 를 이용해서 전송한다.
        api.post(`/posts/${postNum}/comments`, formObject)
        .then(res=>{
            onRefresh();
        })
        .catch(error=>console.log(error));
    };
    //댓글 수정폼 submit 이벤트 처리
    const handleUpdateSubmit = (e)=>{
        e.preventDefault();
        //폼에 입력한 내용을 object 로 얻어낸다.
        const formData=new FormData(e.target);
        const formObject=Object.fromEntries(formData.entries());
        api.patch(`/posts/${postNum}/comments`, formObject)
        .then(res=>{
            onRefresh();
        })
        .catch(error=>console.log(error));
    };

    return( 
    <>
        <li>
        { comment.deleted === "yes" ?
            <>
            	<svg style={{display:comment.num !== comment.parentNum ? "inline":"none"}}  
                    className={cx("reply-icon")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
		  			<path fillRule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5z"/>
				</svg>
				<pre>삭제된 댓글입니다</pre>
            </>
            :
            <>
            	<svg style={{display:comment.num !== comment.parentNum ? "inline":"none"}}  
                    className={cx("reply-icon")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
	  				<path fillRule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5z"/>
				</svg>
				<dl>
                    <dt className={cx("comment-header")}>
                        <div className={cx("comment-profile")}>
                            {profileImage}
                            <div className={cx("comment-meta")}>
                                <span className={cx("comment-writer")}>
                                    {comment.writer}
                                    {comment.num !== comment.parentNum ? '@' + comment.targetWriter : ''}
                                </span>
                                <small className={cx("comment-date")}>{comment.createdAt}</small>
                            </div>
                        </div>
                        <div className={cx("comment-actions")}>
                            <button className={cx("reply-link")}>답글</button>
                            {/* 로그인 사용자 === 댓글 작성자 link 에 수정, 삭제 버튼이 있음 */}
                            {link}
                        </div>
                    </dt>
					<dd>
						<pre>{comment.content}</pre>
					</dd>
				</dl>
				<form onSubmit={handleReInsertSubmit} className={cx("re-insert-form")}  method="post">
					<input type="hidden" name="postNum" defaultValue={postNum}/>
					<input type="hidden" name="targetWriter" defaultValue={comment.writer }/>
					<input type="hidden" name="parentNum" defaultValue={comment.parentNum }/>
					<textarea name="content"></textarea>
					<button type="submit">등록</button>
				</form>
				<form onSubmit={handleUpdateSubmit}  className={cx("update-form")}  method="post">
					<input type="hidden" name="num" defaultValue={comment.num}/>
					<textarea name="content" defaultValue={comment.content}></textarea>
					<button type="submit">수정확인</button>
				</form>	
            </>
        }
        </li>
    </>
    );
}


export default PostDetail;
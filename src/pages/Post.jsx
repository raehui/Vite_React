// src/pages/Post.jsx

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Pagination, Table } from 'react-bootstrap';
import { Prev } from 'react-bootstrap/esm/PageItem';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

function Post(props) {

    // "/posts?pageNum=x" 에서 pageNum 을 추출하기 위한 hook
    // 초기값 
    const [params, setParams] = useSearchParams({
        pageNum:1,
        condition:"",
        keyword : ""
    });

    //글 정보를 상태값으로 관리
    const [pageInfo, setPageInfo] = useState({
        list:[]
    });

    //글 목록 데이터를 새로 읽어오는 함수
    const refresh = (pageNum)=>{
        
        //검색조건과 keyword 에 관련된 정보 얻어내기
        const query = `condition=${params.get("condition")}&keyword=${params.get("keyword")}`;
        // console.log(query);
        api.get(`/posts?pageNum=${pageNum}${params.get("condition")&& "&"+query}`)
        .then(res=>{
            //pageInfo 은 PostListDto 내용을 가짐
            setPageInfo(res.data);
            //console.log(pageInfo);
            //페이징 숫자 배열을 만들어서 state 에 넣어준다.
            setPageArray(range(res.data.startPageNum, res.data.endPageNum));
        })
        .catch(error=>{
            console.log(error);
        });
    };

    //페이징 숫자를 출력할때 사용하는 배열을 상태값으로 관리
    const [pageArray, setPageArray]=useState([]);

    useEffect(()=>{
        //query 파라미터 값을 읽어와 본다
        let pageNum=params.get("pageNum")
        //만일 존재 하지 않는다면 1 페이지로 설정
        if(pageNum==null)pageNum=1
        //해당 페이지의 내용을 원격지 서버로 부터 받아온다 
        refresh(pageNum)
    }, [params]); 

    //페이지를 이동할 hook
    const navigate = useNavigate()

    //페이징 UI 를 만들때 사용할 배열을 리턴해주는 함수 
    function range(start, end) {
        const result = [];
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    }

    // 페이지 이동하는 함수
    const move = (pageNum) =>{
        //object 에 저장된 정보를 이용해서 query 문자열 만들어내기
        //컨디션 키워드 object 를 넣으면 기반 파람문자열 생성
        const query = new URLSearchParams(searchState).toString();
        navigate(`/posts?pageNum=${pageNum}${searchState.condition && "&"+query}`);
       
    }

    //검색조건과 키워드를 상태값으로 관리
    const [searchState, setSearchState] = useState({
        condition:"",
        keyword:""
    });

    //검색 조건을 변경하거나 검색어를 입력하면 호출되는 함수
    const handleSearchChange = (e) =>{
        setSearchState({
            ...searchState,
            [e.target.name] : e.target.value

        })
    }

    // Reset 버튼을 눌렀을 때 
    // 파람 문자열을 만들어서 pageNum 뒤에 달고가야 한다.
    const handleReset = () =>{
        setSearchState({
            condition:"",
            keyword : ""
        });
        move(1); // 1 page 내용이 보여지게 한다.
    }

    return (
        <>
            <Link to="/posts/new">새글 작성</Link>
            <h1>글 목록 입니다</h1>
            <Table striped bordered size="sm">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>조회수</th>
                        <th>등록일</th>
                    </tr>
                </thead>
                <tbody>
                {
                    pageInfo.list.map(item =>
                        <tr key={item.num}>
                            <td>{item.num}</td>
                            <td>
                                <Link to={`/posts/${item.num}${searchState.condition && "?condition="+searchState.condition+"&keyword="+searchState.keyword}`}>{item.title}</Link>
                            </td>
                            <td>{item.writer}</td>
                            <td>{item.viewCount}</td>
                            <td>{item.createdAt}</td>
                        </tr>
                    )
                }  
                </tbody>
            </Table>
            
            <Pagination className='mt-3'>
                {/* 이전버튼 */}
                {/* <Pagination.Prev disabled={pageInfo.startPageNum ==1} onClick={()=>{
                    // 클릭시 이전 pageNum(pageInfo) 으로 이동
                    console.log(pageInfo);
                    setParams({pageNum : pageInfo.pageNum -1 });

                }}>prev</Pagination.Prev> */}
                
                {/* 이전 T */}
                <Pagination.Item onClick={()=>move(pageInfo.startPageNum-1)} disabled={pageInfo.startPageNum ===1}>Prev</Pagination.Item>
                
                {/* 숫자 선택 버튼 */}
                {
                    pageArray.map(item => 
                        <Pagination.Item onClick={()=>{
                            //  console.log(pageInfo);
                            // setParams({pageNum : item});
                            move(item)
                        }} key={item} active={pageInfo.pageNum === item}>{item}</Pagination.Item>
                    )
                }
                
                {/* 다음버튼 */}
                {/* <Pagination.Next disabled={pageInfo.totalPageCount <= pageInfo.endPageNum} onClick={()=>{
                     console.log(pageInfo);
                    setParams({pageNum : pageInfo.endPageNum + 1 });
                }}>Next</Pagination.Next> */}

                {/* 다음버튼 T */}
                <Pagination.Item onClick={()=>move(pageInfo.endPageNum + 1)} disabled={pageInfo.endPageNum === pageInfo.totalPageCount}>Next</Pagination.Item>
            </Pagination>    
            <label htmlFor="search">검색조건</label>
            <select name="condition" id="search" onChange={handleSearchChange} value={searchState.condition}>
                <option value="">선택</option>
                <option value="title_content">제목+내용</option>
                <option value="title">제목</option>
                <option value="writer">작성자</option>                
            </select>
            <input type="text" placeholder='검색어....' name='keyword' onChange={handleSearchChange} value={searchState.keyword}  />
            <button onClick={()=>move(1)}>검색</button>
            <button onClick={handleReset}>Reset</button>
            { pageInfo.keyword && <p><strong>{pageInfo.totalRow}</strong>개의 글이 검색되었습니다.</p>}

        </>
    );
}

export default Post;
import React,{useEffect , useState} from 'react';
import BooksList from './BooksList';
import { useParams } from "react-router-dom";
import {backend_api} from '../master/ConstantData';
import PageNavigate from '../master/PageNavigate';
import { useNavigate } from "react-router-dom";
import {toAuthoruize} from '../master/authorizePage';

const SearchedResult = () =>{

    const navigate = useNavigate(); 
    const {mode,key} = useParams();
    const [dataList,setDataList] = useState([]);
    const [subject,setSubject] = useState('');
    const [apiUrl,setApiUrl] = useState('');
    const [size,setSize] = useState(0);
    const [page,setPage] = useState(1);
    const [maxPage,setMaxPage] = useState(0);
    const [pageRange,setPageRange] = useState([]);
    const itemShownNumber = 8;

    useEffect(()=>{
        const fetchItems = async () =>{
            toAuthoruize(backend_api,null,navigate);
            try{
                const url = backend_api+`/books/search?mode=${mode}&key=${key}&page=${page}&item_number=${itemShownNumber}`;
                const searchResponse = await fetch(url);
                const searchItems = await searchResponse.json();
                setSize(searchItems.size);
                setApiUrl(url);
                setDataList(searchItems.dataList);
            }catch(err){
                console.log(err.stack);
            }
        }
        (async () => await fetchItems() )();
    },[page])

    const changePage = (n) =>{
        if(maxPage > 5){
            const i = n < 3 ? 1 : (n >  maxPage-2 ? maxPage-4 : n-2);
            setPageRange([i,i+1,i+2,i+3,i+4]);
        }
        setPage(n);
    }

    const pageIndex = (event) =>{
        const pg = parseInt(event.target.text); 
        changePage(pg);
    }

    const nxtPage = () =>{
        if(page === maxPage) return;
        changePage(page+1);
    }

    const prvPage = () =>{
        if(page === 1) return;
        changePage(page-1);
    }

    return (
        <>
            <BooksList tagName={subject} lst={dataList} underLine={false}/>
            <PageNavigate page={page} setPage={setPage} dataSize={size} itemShownNumber={itemShownNumber}/>
        </>
    )
}

export default SearchedResult;
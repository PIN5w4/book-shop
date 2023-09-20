import React,{useEffect,useState,useLayoutEffect} from 'react';
import CreateTable,{sortTable} from '../master/CreateTable';
import {faSearch,faEdit} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import PageNavigate from '../master/PageNavigate';
import SearchBox from './SearchBox';
import {backend_api} from '../master/ConstantData';
import {toAuthoruize} from '../master/authorizePage';

const BookStock = () =>{

    const [bookList,setBookList] = useState([]);
    const [page,setPage] = useState(1);
    const [dataSize,setDataSize] = useState(0);
    const [searchKey,setSearchKey] = useState('');
    const [orderBy,setOrderBy] = useState('created desc');
    const itemShownNumber = 20;
    const navigate = useNavigate();
    const page_code = 'p_1';

    const tableOption = {
        setting : {
            header:['ลำดับ','ISBN','ชื่อหนังสือ','ผู้แต่ง','หมวด','ราคา','รายละเอียด','แก้ไข'],
            responsive:['col-1','col-2 col-lg-2','col-3 col-lg-2','col-2','col-2','col-2 col-lg-1','col-1','col-1'],
            parentStyle:[{textAlign:'center'},{textAlign:'center'},{},{},{},{textAlign:'right'},{textAlign:'center'},{textAlign:'center'}],
            color:{header:{backgroundColor:'#512507',color:'#dddddd'},even:{backgroundColor:'#ddffdd'},odd:{backgroundColor:'#ffe5e5'}},
            border:{border: 'solid 1px #ffffff'},
            sort: async (event)=> await sortTable(event.target,setOrderBy),
            page:itemShownNumber,
            hidden:[3,4]
        },
        dataRow : [
            {type:'running',start:page},
            {type:'text',column:'isbn'},
            {type:'text',column:'title'},
            {type:'text',column:'author'},
            {type:'text',column:'category'},
            {type:'text',column:'price',displayFunction:(p)=> p['price'].toLocaleString('en-US', {minimumFractionDigits:2})},
            {type:'button',icon:faSearch ,class:'btn btn-secondary' ,click: (e)=> navigate('/book_form/view/'+e['id'])},
            {type:'button',icon:faEdit ,class:'btn btn-secondary',click: (e)=> navigate('/book_form/edit/'+e['id'])},
        ]
    }



    const onClickNew = () =>{
        navigate('/book_form/new/0');
    }

    useEffect(()=>{
        const fetchItems = async () =>{
            toAuthoruize(backend_api,page_code,navigate);
            try{
                const response = await fetch(backend_api+`/books/get_books_table_list?page=${page}&itemShownNumber=${itemShownNumber}&order_by=${orderBy}&search=${searchKey}`);
                let listsItem = await response.json();
                setBookList(listsItem.booksTableList);
                setDataSize(listsItem.size);
            }catch(err){
                console.log(err.stack);
            }
        }
        (async () => await fetchItems() )();
    },[page,orderBy,searchKey]);

    const onClickSeach = (txt) =>{
        setSearchKey(txt);
    }

    return (
        <div>
            <SearchBox onClickNew={onClickNew} onClickSeach={onClickSeach}/>
            <div style={{marginBottom:'20px'}}>
            {
                bookList.length ?
                <div>
                    <CreateTable tableOption={tableOption} dataList={bookList}/>
                    <PageNavigate page={page} setPage={setPage} dataSize={dataSize} itemShownNumber={itemShownNumber}/>
                </div>
                : ''
            }
            </div>
        </div>
    )
}

export default BookStock;
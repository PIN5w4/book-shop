import React,{useEffect,useState} from 'react';
import { useParams } from "react-router-dom";
import CreateForm from '../master/CreateForm';
import {submitForm,keyPressNumber} from '../master/form-operate';
import {backend_api} from '../master/ConstantData';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import {toAuthoruize} from '../master/authorizePage';

const BookForm = () =>{

    const [file,setFile] = useState();
    const {id,mode} = useParams();
    const [itemList,setItemList] = useState({});
    const [publicerSelect,setPubilcerSelect] = useState([]);
    const [categorySelect,setCategorySelect] = useState([]);
    const navigate = useNavigate();
    const page_code = 'p_1';

    useEffect(()=>{
        const fetchItems = async () =>{
            toAuthoruize(backend_api,page_code,navigate);
            try{
                const publicerResponse = await fetch(backend_api+'/publicer/get_all');
                const publicer = await publicerResponse.json();
                const categoryResponse = await fetch(backend_api+'/category/get_all');
                const category = await categoryResponse.json();
                setCategorySelect([...category.categoryList].map(e=>{
                    return {value:e.code , label:e.category_name}
                }));
                setPubilcerSelect([...publicer.publicerList].map(e=>{
                    return {value:e.code , label:e.publicer_name}
                }));
                if(mode === 'new') return;
                const bookResponse = await fetch(backend_api+'/books/get_book_by_id?id='+id);
                const book = await bookResponse.json();
                const releaseDate = book.book[0].release_date.substring(0,10);
                book.book[0].release_date = mode === 'edit' ? releaseDate 
                    : releaseDate.split('-')[2]+'/'+releaseDate.split('-')[1]+'/'+releaseDate.split('-')[0] ;
                setItemList({books:book.book[0]});
            }catch(err){
                console.log(err.stack);
            }
        }
        (async () => await fetchItems() )();
    },[]);

    const objectForm = {class:'required' ,table:'books'}

    const formOption = {
        form:[
            {type: 'text', label:'ชื่อหนังสือ', name:'title' , ...objectForm},
            {type: 'text', label:'ผู้แต่ง', name:'author' , ...objectForm},
            {type: 'number', label:'จำนวนหน้า', name:'page_number' , ...objectForm},
            {type: 'number', label:'ราคา', name:'price' , ...objectForm},
            {type: 'radio' , name:'cover' , label: 'ปก' , table:'books' , option:[{value:'P',label:'ปกอ่อน'},{value:'H',label:'ปกแข็ง'}]},
            {type: 'text' , label:'ISBN' , name:'isbn', keyPress: keyPressNumber ,...objectForm},
            {type: 'date' , label:'วันที่ตีพิมพ์' , name:'release_date', ...objectForm},
            {type: 'select' , label:'หมวด' , name:'category_code' , option: categorySelect , ...objectForm},
            {type: 'select' , label:'สำนักพิมพ์' , name:'publicer_code' , option: publicerSelect ,...objectForm},
            {type: 'text-area' , label:'รายละเอียด' , name:'description' , ...objectForm},
            {type: 'image-file' , label:'แนบรูป' , name:'pic' ,path:'/public/files/books/' , change: (event)=>setFile(event.target.files[0])  , ...objectForm},
            {type: 'checkbox' , labelCheckbox:'หนังสือแนะนำ' , name:'recommend' , table:'books'}
        ],
        setting:{
            responsive:['col-2','col-3','col-2'],
            mode:mode
        }
    };

    const onSubmit = async() =>{
        const data = submitForm();
        if(data.message) return;
        try{
            
            if(file){
                const formData = new FormData();
                formData.append("file", file);
                const resp = await axios.post(backend_api+'/upload/book', formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "x-rapidapi-host": "file-upload8.p.rapidapi.com",
                        "x-rapidapi-key": "your-rapidapi-key-here",
                    },
                }).catch(err=>{
                    console.log(err)
                });
            }
            let optionObj = {
                method: mode === 'edit' ? 'PATCH' : 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({book : data.books ,condition:{id:id}})
            }
            await fetch(backend_api+`/books/${mode === 'edit' ? 'update_book' : 'insert_book'}`,optionObj).then(result=>{
                Swal.fire({
                    title : 'แจ้งเตือน',
                    text : mode === 'edit' ? 'แก้ไขข้อมูลสำเร็ต' : 'เพิ่มข้อมูลสำเร็จ'
                }).then(()=>{
                    navigate('/book_stock');
                })
            });
        }catch(err){
            console.log(err.stack);
        }
    }

    return (
        <div>
            {
                Object.keys(itemList).length || mode === 'new' ?
                <CreateForm formOption={formOption} itemList={itemList} />
                : ''
            }
            <div style={{textAlign:'center' , marginBottom: '20px'}}>
                {
                    mode !== 'view' ? 
                        <button className="btn btn-outline-secondary" onClick={onSubmit}>บันทึก</button>    
                        :''
                }
                <button className="btn btn-outline-secondary" style={{marginLeft:'20px'}} onClick={()=> navigate(-1)}>{mode !== 'view' ? 'ยกเลิก' : 'กลับหน้ารายการ'}</button>    
            </div>
        </div>
    )

}

export default BookForm;
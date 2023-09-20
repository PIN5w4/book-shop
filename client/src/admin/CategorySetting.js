import React,{useEffect,useState} from 'react';
import CreateTable,{sortTable} from '../master/CreateTable';
import PageNavigate from '../master/PageNavigate';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import SearchBox from './SearchBox';
import {backend_api} from '../master/ConstantData';
import {submitForm,removeWarningListener} from '../master/form-operate';
import { useNavigate } from "react-router-dom";
import {toAuthoruize} from '../master/authorizePage';

const CategorySetting = () =>{
    
    const navigate = useNavigate()
    const itemShownNumber = 20;
    const CATEGORY_API_URL = 'http://localhost:3500/category';
    const [dataList,setDataList] = useState([]);
    const [page,setPage] = useState(1);
    const [openModal,setOpenModal] = useState(false);
    const [dataModal,setDataModal] = useState({});
    const [orderBy,setOrderBy] = useState('created desc');
    const [searchKey,setSearchKey] = useState('');
    const [mode,setMode] = useState('');
    const page_code = 'p_5';
    const tableOption = {
        setting : {
            header:['ลำดับ','code','ชื่อ','Dropdown','แก้ไข'],
            responsive:['col-1','col-1 col-lg-1','col-2','col-1','col-1'],
            parentStyle:[{textAlign:'center'},{textAlign:'center'},{},{textAlign:'center'},{textAlign:'center'}],
            page:itemShownNumber,
            color:{header:{backgroundColor:'#512507',color:'#dddddd'},even:{backgroundColor:'#ddffdd'},odd:{backgroundColor:'#ffe5e5'}},
            border:{border: 'solid 1px #ffffff'},
            sort: async (event)=> await sortTable(event.target,setOrderBy),
        },
        dataRow : [
            {type:'running' , start:page },
            {type:'text' , column:'code' },
            {type:'text' , column:'category_name' },
            {type:'text' , column:'dropdown' },
            {type:'button' , icon: faEdit , class:'btn btn-secondary' , click:(r)=> onClickButton(r['id'])}
        ]
    }

    const onClickButton = (_id) =>{
        setDataModal(dataList.filter(e=>e.id===_id)[0]);
        setMode('edit');
        setOpenModal(true);
    }

    const onClickSeach = (txt) =>{
        setPage(1);
        setSearchKey(txt);
    }

    useEffect(()=>{
        const fetchItems = async () =>{
            toAuthoruize(backend_api,page_code,navigate);
            try{
                const categoryResponse = await fetch(backend_api+`/category/get_all??page=${page}&itemShownNumber=${itemShownNumber}&order_by=${orderBy}&search=${searchKey}`);
                const categoryList = await categoryResponse.json();
                setDataList(categoryList.categoryList);
            }catch(err){
                console.log(err.stack);
            }
        }
        (async () => await fetchItems() )();
    },[page,orderBy,searchKey]);

    const onClickNew = async () =>{
        const codeResponse = await fetch(backend_api+'/category/get_code');
        const code = await codeResponse.json();
        const cd = code.code[0].running+1;
        const newCode = (cd < 10 ? '0' : '')+(cd < 100 ? '0' : '')+cd;
        setMode('new');
        setDataModal({id: 0,code:newCode,category_name:'',dropdown:'N'});
        setOpenModal(true);
    }

    const onSubmit = async () =>{
        const data = submitForm();
        if(data.message) return;
        try{
            const optionObj = {
                method: mode === 'edit' ? 'PATCH' : 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({data : data.category ,condition:{id:dataModal.id}})
            }
            await fetch(backend_api+`/category/${mode === 'edit' ? 'update_category' : 'insert_category'}`,optionObj);
        }catch(err){
            console.log(err.stack);
        }
        window.location.reload();
    }

    return (
        <div>
            <SearchBox onClickNew={onClickNew} onClickSeach={onClickSeach} />
            {
                dataList.length?
                <><CreateTable dataList={dataList.filter((e,i)=>{
                    return i < page * itemShownNumber && i > page * itemShownNumber - itemShownNumber -1;
                })} tableOption={tableOption} /> 
                <PageNavigate page={page} setPage={setPage} dataSize={dataList.length} itemShownNumber={itemShownNumber}/></>
                : ''
            }
            {
                Object.keys(dataModal).length?
                <Modal ariaHideApp={false} onAfterOpen={removeWarningListener} style={{content:{padding:'0px',width:'650px',maxWidth:'50%',border:'1px solid #444444'}}} isOpen={openModal} contentLabel="รูป">
                    <div style={{borderBottom:'1px solid #444444',backgroundColor:'#f2c1c1' ,display: 'flex',justifyContent: 'center' , color:'#383838' , width:'100%',height:'50px',alignItems: 'center' ,textAlign:'center'}}><b>ตั้งค่าหมวดหนังสือ</b></div>
                    <div style={{padding:'15px'}}>
                        <div className="row mb-2">
                            <div className="col-3">code</div>
                            <div className="col-5"><input type="text" table="category" defaultValue={dataModal['code']} name="code" disabled={true}/></div>
                        </div>
                        <div className="row mb-2">
                            <div className="col-3 red-star">ชื่อหมวด</div>
                            <div className="col-5"><input type="text" table="category" className="required" name="category_name" defaultValue={dataModal['category_name']}/></div>
                            <div className="col-4 warning d-none" name="category_name"><label>กรุณากรอกชื่อหมวด</label></div>
                        </div>
                        <div className="mb-2">
                            <input type="checkbox" table="category" name="dropdown" className="form-check-input" style={{borderColor:'#888888'}} defaultChecked={dataModal['dropdown']==='Y'}/><label className="form-check-label" style={{marginLeft:'10px'}}>แสดงหน้าเมนู</label>
                        </div>
                    </div>
                    <div style={{textAlign:'center' , marginBottom:'30px'}}>
                        <button className="btn btn-outline-secondary" style={{width:'100px'}} onClick={async ()=> await onSubmit()}>บันทึก</button>
                        <button className="btn btn-outline-secondary" style={{width:'100px',marginLeft:'20px'}} onClick={() => setOpenModal(false)}>ปิด</button>
                    </div>
                </Modal>
                :''
            }
        </div>
    )
}

export default CategorySetting;
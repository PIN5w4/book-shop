import React,{useEffect,useState} from 'react';
import CreateTable,{sortTable} from '../master/CreateTable';
import PageNavigate from '../master/PageNavigate';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import SearchBox from './SearchBox';
import {backend_api} from '../master/ConstantData';
import {submitForm,removeWarningListener,dateFormate} from '../master/form-operate';
import { useNavigate } from "react-router-dom";
import {toAuthoruize} from '../master/authorizePage';


const UserSetting = () =>{

    const navigate = useNavigate()
    const itemShownNumber = 20;
    const USER_API_URL = 'http://localhost:3500/users';
    const [dataList,setDataList] = useState([]);
    const [page,setPage] = useState(1);
    const [openModal,setOpenModal] = useState(false);
    const [dataModal,setDataModal] = useState({});
    const [orderBy,setOrderBy] = useState('created desc');
    const page_code = 'p_4';
    const [searchKey,setSearchKey] = useState('');
    const tableOption = {
        setting : {
            header:['ลำดับ','User Name','ชื่อ','นามสกุล','เพศ','วันเกิด','แก้ไข'],
            responsive:['col-1','col-2 col-lg-1','col-2','col-2','col-1 col-lg-1','col-1','col-1'],
            parentStyle:[{textAlign:'center'},{},{},{},{textAlign:'center'},{textAlign:'center'},{textAlign:'center'}],
            page:itemShownNumber,
            color:{header:{backgroundColor:'#512507',color:'#dddddd'},even:{backgroundColor:'#ddffdd'},odd:{backgroundColor:'#ffe5e5'}},
            border:{border: 'solid 1px #ffffff'},
            sort: async (event)=> await sortTable(event.target,setOrderBy),
        },
        dataRow : [
            {type:'running' , start:page },
            {type:'text' , column:'username' },
            {type:'text' , column:'first_name' },
            {type:'text' , column:'last_name' },
            {type:'text' , column:'gender' , displayFunction:(g)=> g['gender'] === 'M' ? 'ชาย' : g['gender'] === 'F' ? 'หญิง' : 'ไม่ระบุ' },
            {type:'text' , column: 'birth_date' , displayFunction:(d)=> dateFormate(d['birth_date']) },
            {type:'button' , icon: faEdit , class:'btn btn-secondary' , click:(r)=> onClickButton(r['id'])}
        ]
    }

    const onClickButton = (_id) =>{
        setDataModal(dataList.filter(e=>e.id===_id)[0]);
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
                const usersResponse = await fetch(backend_api+`/users/get_all??page=${page}&itemShownNumber=${itemShownNumber}&order_by=${orderBy}&search=${searchKey}`);
                const userList = await usersResponse.json();
                setDataList(userList.userList);
            }catch(err){
                console.log(err.stack);
            }
        }
        (async () => await fetchItems() )();
    },[page,orderBy,searchKey]);

    const onSubmit = async () =>{
        const data = submitForm();
        const userGroup =  Object.keys(data.users).filter(e=>data.users[e] === 'Y').length ? 'admin' : 'customer';
        data.users = {...data.users , user_group : userGroup}
        try{
            const optionObj = {
                method: 'PATCH',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({data : data.users ,condition:{id:dataModal.id}})
            }
            await fetch(backend_api+`/users/update_user`,optionObj);
        }catch(err){
            console.log(err.stack);
        }
        window.location.reload();
    }

    const fillData = () =>{
        for(let i = 1 ; i < 8 ; i++){
            document.getElementsByName(`P_${i}`)[0].checked  = dataModal[`p_${i}`] === 'Y' 
        }
    }

    return(
        <div>
            <SearchBox canNew={false} onClickSeach ={onClickSeach} />
            <CreateTable dataList={dataList.filter((e,i)=>{
                return i < page * itemShownNumber && i > page * itemShownNumber - itemShownNumber -1;
            })} tableOption={tableOption} /> 
            <PageNavigate page={page} setPage={setPage} dataSize={dataList.length} itemShownNumber={itemShownNumber}/>
            <Modal ariaHideApp={false} onAfterOpen={fillData} style={{content:{padding:'0px',width:'650px',maxWidth:'50%',border:'1px solid #444444'}}} isOpen={openModal} contentLabel="รูป">
                <div style={{borderBottom:'1px solid #444444',backgroundColor:'#f2c1c1' ,display: 'flex',justifyContent: 'center' , color:'#383838' , width:'100%',height:'50px',alignItems: 'center' ,textAlign:'center'}}><b>ตั้งค่าผู้ใช้งาน</b></div>
                <div style={{padding:'15px'}}>
                    {  Object.keys(dataModal).length ? 
                        <div className="row">
                            <div className="col-3">
                                <div><label>User Name</label></div>
                                <div><label>ชื่อ-สกุล</label></div>
                                <div><label>วันเกิด</label></div>
                                <div><label>เพศ</label></div>
                            </div>
                            <div className="col-9">
                                <div><label>{dataModal.username}</label></div>
                                <div><label>{dataModal.first_name+' '+dataModal.last_name}</label></div>
                                <div><label>{dateFormate(dataModal.birth_date)}</label></div>
                                <div><label>{dataModal.gender === 'M' ? 'ชาย' : dataModal.gender === 'F' ? 'หญิง' : 'ไม่ระบุ'}</label></div>
                            </div>
                        </div> : ''
                    }
                    <br/>
                    <hr style={{width:'90%' , marginLeft:'10%'}}/>
                    <br/>
                    <div className="row">
                        <div className="col-3">
                            <input type="checkbox" table="users" name="P_1" className="form-check-input" style={{borderColor:'#888888'}} /><label className="form-check-label" style={{marginLeft:'10px'}}>รายการหนังสือ</label>
                        </div>
                        <div className="col-4">
                            <input type="checkbox" table="users" name="P_2" className="form-check-input" style={{borderColor:'#888888'}} /><label className="form-check-label" style={{marginLeft:'10px'}}>ยืนยันการชำระเงิน</label><br/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-3">
                            <input type="checkbox" table="users" name="P_4" className="form-check-input" style={{borderColor:'#888888'}} /><label className="form-check-label" style={{marginLeft:'10px'}}>ตั้งค่าผู้ใช้งาน</label>
                        </div>
                        <div className="col-4">
                            <input type="checkbox" table="users" name="P_5" className="form-check-input" style={{borderColor:'#888888'}} /><label className="form-check-label" style={{marginLeft:'10px'}}>ตั้งค่าหมวด</label>
                        </div>
                        <div className="col-5">
                        <input type="checkbox" table="users" name="P_6" className="form-check-input" style={{borderColor:'#888888',marginLeft:'50px'}} /><label className="form-check-label" style={{marginLeft:'10px'}}>ตั้งค่าสำนักพิมพ์</label><br/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-3">
                            <input type="checkbox" table="users" name="P_3" className="form-check-input" style={{borderColor:'#888888'}} /><label className="form-check-label" style={{marginLeft:'10px'}}>ส่งสินค้า</label>
                        </div>
                        <div className="col-4">
                            <input type="checkbox" table="users" name="P_7" className="form-check-input" style={{borderColor:'#888888'}} /><label className="form-check-label" style={{marginLeft:'10px'}}>รายงาน</label><br/>
                        </div>
                    </div>
                </div>
                <div style={{textAlign:'center' , marginBottom:'30px'}}>
                    <button className="btn btn-outline-secondary" style={{width:'100px'}} onClick={async ()=> await onSubmit()}>บันทึก</button>
                    <button className="btn btn-outline-secondary" style={{width:'100px',marginLeft:'20px'}} onClick={() => setOpenModal(false)}>ปิด</button>
                </div>
            </Modal>
        </div>
    )
}

export default UserSetting;
import React,{useState,useRef,useEffect} from 'react';
import DatePicker from "react-date-picker";
import CreateTable from '../master/CreateTable'
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import {backend_api} from '../master/ConstantData';
import {toAuthoruize} from '../master/authorizePage';

const Payment = () =>{

    const navigate = useNavigate();
    const PURCHASE_API_URL = 'http://localhost:3500/purchase_order';
    const UPLOAD_ENDPOINT = 'http://localhost:3200/upload';
    const PAYMENT_API_URL = 'http://localhost:3500/payment';
    const submitRef = useRef();
    const paymentDateRef = useRef();
    const [paymentDate,setPaymentDate] = useState(new Date());
    const [initialTimeArr,setInitialTimeArr] = useState([]);
    const [purchaseList,setPurchaseList] = useState([]);
    const [modalItemList,setModalItemList] = useState([]);
    const [openModal,setOpenModal] = useState(false);
    const [file,setFile] = useState();

    const tableOption = {
        setting : {
            header:['เลือก','วันที่สั่งซื้อ','เวลาสั่งซื้อ','รายการ','ยอดรวม',''],
            responsive:['col-1','col-3 col-lg-2','col-2','col-2','col-2 col-lg-2','col-1'],
            parentStyle:[{textAlign:'center'},{},{},{textAlign:'center'},{textAlign:'right'},{textAlign:'center'}],
            total:[3,4],
            lineSpace: true,
        },
        dataRow : [
            {type:'checkbox' , value:'id' , style:{borderColor:'#555555'},class:'check-box'},
            {type:'text' ,displayFunction : (d)=>{
                const date = new Date(d['purchase_date']).toLocaleString();
                const dateArr = date.split(',')[0].split('/');
                return (parseInt(dateArr[1]) < 10 ? '0' : '') + dateArr[1]+'/'+(parseInt(dateArr[0]) < 10 ? '0' : '')+dateArr[0]+'/'+dateArr[2];
            }},
            {type:'text' ,displayFunction : (t)=> t['purchase_time'].substring(0,5)+' น.'},
            {type:'text' , column:'number_of_item'},
            {type:'text' , column:'total_amount' , displayFunction : (t)=> t['total_amount'].toLocaleString('en-US', {minimumFractionDigits:2}) ,style:{textAlign:'right'}},
            {type:'button',icon:faSearch, class:'btn btn-outline-secondary',click : async(e)=>{ await onClickButton(e['id']);
            } ,style:{height:'30px'}}
        ]
    }

    const modalTableOption = {
        setting : {
            header:['','รูป','ชื่อหนังสือ','ราคา','จำนวน','รวม'],
            responsive:['col-1','col-2','col-3','col-2','col-2','col-2'],
            parentStyle:[{textAlign:'center'},{},{},{textAlign:'right'},{textAlign:'center'},{textAlign:'right'}],
            lineSpace: true,
        },
        dataRow : [
            {type:'text', column : 'order'},
            {type:'image', src:(p)=>backend_api+'/public/files/books/'+p['pic'],style:{display:'block',width:'50px',marginLeft:'auto',marginRight:'auto'}},
            {type:'text' , column:'title'},
            {type:'text' , displayFunction : (p)=> p['price'].toLocaleString('en-US', {minimumFractionDigits:2}),style:{textAlign:'right'}},
            {type:'text' , column:'quantity'},
            {type:'text' , displayFunction : (t)=> t['amount'].toLocaleString('en-US', {minimumFractionDigits:2}) ,style:{textAlign:'right'}},
        ]
    }

    useEffect(()=>{
        const fetchItems = async () =>{
            toAuthoruize(backend_api,null,navigate);
            let timeArr = [];
            for(let i = 0 ; i < 60 ; i++){
                timeArr.push(i < 10 ? '0'+i : ''+i);
            }
            setInitialTimeArr(timeArr);
            try{
                const usr = JSON.parse(localStorage.getItem('user'));
                const prchsResponse = await fetch(backend_api+'/purchase_order/purchase_order_for_payment?user_id='+usr.id);
                const prchsItem = await prchsResponse.json();
                setPurchaseList(prchsItem.purchaseList);

            }catch(err){
                console.log(err.stack);
            }
        }
        (async () => await fetchItems() )();
    },[])


    const onClickButton = async (e) =>{
        try{
            const response = await fetch(backend_api+'/cart/cart_list_by_purchase_order?purchase_order_id='+e);
            const detail = await response.json();
            setModalItemList(detail.cartList);
            setOpenModal(true);
        }catch(err){
            console.log(err.stack);
        }
    }

    const onSubmitForm = async (event) =>{
        event.preventDefault();
        const purchaseArr = [];
        
        const ckb = document.getElementsByClassName('check-box');
        for(let i = 0 ; i < ckb.length ; i++){
            if(ckb[i].checked) purchaseArr.push(ckb[i].value);
        }
        const rqr = document.getElementsByClassName('required');
        const pDate = document.getElementsByName('paymentDate');
        for(let i =0 ; i < rqr.length ; i++){
            if(rqr[i].value === '' || pDate[0].value === '' || purchaseArr.length === 0) return Swal.fire({title:'แจ้งเตือน',text:'กรุณากรอกข้อมูลให้ครบถ้วน'});
        }
        const formData = new FormData();
        formData.append("file", file);
        const resp = await axios.post(backend_api+'/upload/payment', formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "x-rapidapi-host": "file-upload8.p.rapidapi.com",
                "x-rapidapi-key": "your-rapidapi-key-here",
            },
        }).catch(err=>{
            console.log(err)
        });
        try{
            const usr = JSON.parse(localStorage.getItem('user'));
            const optionObj = {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                payment:{
                    payment_date : document.getElementsByName('paymentDate')[0].value,
                    payment_time: document.getElementsByName('hour')[0].value+':'+document.getElementsByName('minute')[0].value,
                    paid_amount: parseInt(document.getElementsByName('paid_amount')[0].value),
                    bank: document.getElementsByName('bank')[0].value,
                    attached_file: file.name,
                    user_id: usr.id ,
                },
                purchase_number : purchaseArr})
            }
            await fetch(backend_api+'/payment/insert_purchase',optionObj);
            Swal.fire({
                title:'แจ้งเตือน',
                text:'ยืนยันการชำระเงินสำเร็จ'
            }).then(result=>{
                navigate('/');
            })
        }catch(err){
            console.log(err.stack);
        }
        
    }

    return (
        <div style={{padding:'15px'}}>
            <h3>แจ้งการชำระเงิน</h3>
            <br/>
            <div className="row">
                <div className="col-12 col-sm-4 col-md-4 col-lg-3 col-xl-3 mb-2">
                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-5 col-xl-5 mb-2"><label>วันที่ชำระเงิน</label></div>
                        <div className="col-12 col-sm-12 col-md-12 col-lg-7 col-xl-7 mb-2"><DatePicker value={paymentDate} name="paymentDate" onChange={(date)=>setPaymentDate(date)}/></div>
                    </div>
                </div>
                <div className="col-12 col-sm-5 col-md-4 col-lg-5 col-xl-4 mb-2">
                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4 mb-2">
                            <label>เวลาชำระเงิน</label>
                        </div>
                        <div className="col-12 col-sm-12 col-md-12 col-lg-8 col-xl-8 mb-2">
                            <div>
                                <select name="hour" className="form-select required" style={{borderColor:'#777777' ,width:"90px",height:'30px',fontSize:'14px',display:'inline-block'}} >
                                    <option value="">ชั่วโมง</option>
                                    {
                                        initialTimeArr.map((e,i)=>{
                                            return <option key={i} value={e}>{e}</option>
                                        })
                                    }
                                </select>
                                <div style={{display:'inline-block'}}><b>&nbsp;&nbsp;:&nbsp;&nbsp;</b></div>
                                <select name="minute" className="form-select required" style={{borderColor:'#777777' ,width:"90px",height:'30px',fontSize:'14px',display:'inline-block'}} >
                                <option value="">นาที</option>
                                    {
                                        initialTimeArr.map((e,i)=>{
                                            return <option key={i} value={e}>{e}</option>
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                    </div>    
                </div>
                <div className="col-12 col-sm-3 col-md-4 col-lg-3 col-xl-3 mb-2">
                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-5 col-xl-5 mb-2"><label>จำนวนเงิน</label></div>
                        <div className="col-12 col-sm-12 col-md-12 col-lg-7 col-xl-7 mb-2"><input type="number" name="paid_amount" className="required" style={{width:'100px'}} /></div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-sm-4 col-md-4 col-lg-3 col-xl-3 mb-2">
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-12 col-lg-5 col-xl-5 mb-2"><label>ธนาคาร</label></div>
                            <div className="col-12 col-sm-12 col-md-12 col-lg-7 col-xl-7 mb-2">
                                <select name="hour" className="form-select required" name="bank" style={{borderColor:'#777777' ,width:"150px",height:'30px',fontSize:'14px',display:'inline-block'}} >
                                    <option value="">เลือกธนคาร</option>
                                    <option value="KBANK">กสิกรไทย</option>
                                    <option value="SCB">ไทยพาณิชย์</option>
                                    <option value="ฺBBL">ธนาคารกรุงเทพ</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-5 col-md-4 col-lg-5 col-xl-4 mb-2">
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4 mb-2">
                                <label>แนบไฟล์</label>
                            </div>
                            <div className="col-12 col-sm-12 col-md-12 col-lg-8 col-xl-8 mb-2">
                                <input type="file" name="file" className="required" onChange={(e)=> setFile(e.target.files[0])}/>
                            </div>
                        </div>
                    </div> 
                </div>
            </div>
            <br/>
            <div><button onClick={onSubmitForm} ref={submitRef} className="btn btn-outline-secondary">ยืนยันการชำระเงิน</button></div>
            <br/>
            <hr style={{width:'80%',marginLeft:'10%'}} />
            <br/>
            <div style={{maxWidth:'750px'}}>
            {
                purchaseList.length > 0 ? 
                <CreateTable tableOption={tableOption} dataList={purchaseList} />
                :''
            }
            </div>
            <Modal ariaHideApp={false} style={{content:{padding:'0px',width:'650px',maxWidth:'90%',border:'1px solid #444444'}}} isOpen={openModal} contentLabel="เพิ่มที่อยู่">
                <div style={{borderBottom:'1px solid #444444',backgroundColor:'#f2c1c1' ,display: 'flex',justifyContent: 'center' , color:'#383838' , width:'100%',height:'50px',alignItems: 'center' ,textAlign:'center'}}><b>รายการสั่งซื้อ</b></div>
                <div style={{paddingLeft:'10px',marginTop:'10px'}}>
                {
                    modalItemList.length ?
                    <CreateTable tableOption={modalTableOption} dataList={modalItemList} />
                    :''
                }
                </div>
                <br/>
                <div style={{textAlign : 'center'}}><button onClick={()=> setOpenModal(false)} className="btn btn-outline-secondary" style={{width:'200px'}}>ปิด</button></div>
            </Modal>
        </div>
    )

}

export default Payment;
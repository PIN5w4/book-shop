import React , {useEffect,useState,useRef} from 'react';
import CreateTable from '../master/CreateTable';
import {faCheck} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import CreateForm from '../master/CreateForm';
import PageNavigate from '../master/PageNavigate';
import {backend_api} from '../master/ConstantData';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import {toAuthoruize} from '../master/authorizePage';

const PaymentList = () =>{

    const navigate = useNavigate();
    const PAYMENT_API_URL = 'http://localhost:3500/payment';
    const PURCHASE_API_URL = 'http://localhost:3500/purchase_order';
    const USER_API_URL = 'http://localhost:3500/users';
    const [dataList,setDataList] = useState([]);
    const [openModal,setOpenModal] = useState(false); 
    const [dataModal,setDataModal] = useState({});
    const [formOptionLeftColumn,setFormOptionLeftColumn] = useState({});
    const [formOptionRightColumn,setFormOptionRightColumn] = useState({});
    const [dataModalTable,setDataModalTable] = useState([]);
    const [page,setPage] = useState(1);
    const confirmRef = useRef();
    const refreshRef = useRef();
    const itemShownNumber = 20;
    const page_code = 'p_2';

    const tableOption = {
        setting : {
            header:['ลำดับ','วันที่ชำระ','เวลาชำระ','ชื่อผู้ใช้งาน','ยอดชำระ','ยืนยันการชำระ'],
            responsive:['col-1','col-2 col-lg-1','col-1','col-2','col-2 col-lg-1','col-2'],
            parentStyle:[{textAlign:'center'},{},{},{},{textAlign:'right'},{textAlign:'center'}],
            page:20,
            color:{header:{backgroundColor:'#512507',color:'#dddddd'},even:{backgroundColor:'#ddffdd'},odd:{backgroundColor:'#ffe5e5'}},
            border:{border: 'solid 1px #ffffff'},
        },
        dataRow : [
            {type:'running' , start:page },
            {type:'text' , column : 'payment_date' , displayFunction: (d)=>{
                const date = new Date(d['payment_date']).toLocaleString();
                const dateArr = date.split(',')[0].split('/');
                return (parseInt(dateArr[1]) < 10 ? '0' : '') + dateArr[1]+'/'+(parseInt(dateArr[0]) < 10 ? '0' : '')+dateArr[0]+'/'+dateArr[2];
            }},
            {type:'text' ,displayFunction: (t)=> t['payment_time'].substring(0,5)+' น.' },
            {type:'text' , column:'user_name'},
            {type:'text' ,displayFunction: (p)=> p['paid_amount'].toLocaleString('en-US', {minimumFractionDigits:2})},
            {type:'button' ,icon:faCheck , class:'btn btn-secondary' , click:async (row) => await onClickConfirm(row['id'])}
        ]
    }

    const tableModalOption = {
        setting : {
            header:['ลำดับ', 'ID' ,'วันที่สั่งซื้อ','เวลาสั่งซื้อ','ยอดเงิน'],
            responsive:['col-1','col-1','col-2','col-2','col-2'],
            parentStyle:[{textAlign:'center'},{textAlign:'center'},{textAlign:'center'},{textAlign:'center'},{textAlign:'right'}],
            total : [4],
            page:20
        },
        dataRow : [
            {type:'running' , start:1 },
            {type:'text' , column:'id'},
            {type:'text' , displayFunction: (d)=>{
                const date = new Date(d['purchase_date']).toLocaleString();
                const dateArr = date.split(',')[0].split('/');
                return (parseInt(dateArr[1]) < 10 ? '0' : '') + dateArr[1]+'/'+(parseInt(dateArr[0]) < 10 ? '0' : '')+dateArr[0]+'/'+dateArr[2];
            }},
            {type:'text' ,displayFunction: (t)=> t['purchase_time'].substring(0,5)+' น.' },
            {type:'text' , column: 'total_amount',displayFunction: (p)=> p['total_amount'].toLocaleString('en-US', {minimumFractionDigits:2})},
        ]
    }

    const onClickConfirm = async(_id) =>{
        const paymentResponse = await fetch(backend_api+'/payment/get_payment_by_id?id='+_id);
        const payment = await paymentResponse.json();
        setFormOptionLeftColumn({
            form:[
                {type:'text',name:'user_name',label:'ชื่อผู้ใช้งาน',table:'data'},
                {type:'text',name:'payment_date',label:'วันที่ชำระเงิน',table:'data', displayFunction : (d)=>{
                    const date = new Date(d).toLocaleString();
                    const dateArr = date.split(',')[0].split('/');
                    return (parseInt(dateArr[1]) < 10 ? '0' : '') + dateArr[1]+'/'+(parseInt(dateArr[0]) < 10 ? '0' : '')+dateArr[0]+'/'+dateArr[2];
                }},
                {type:'text',name:'paid_amount',label:'ยอดชำระ',table:'data' ,displayFunction:(p)=>p.toLocaleString('en-US', {minimumFractionDigits:2})}
            ],
            setting:{
                responsive:['col-7','col-5'],
                mode:'view'
            }
        });
        const bankOption = [
            {value:'KBANK',label:'กสิกรไทย'},
            {value:'SCB',label:'ไทยพาณิชย์'},
            {value:'BBL',label:'ธนาคารกรุงเทพ'},
        ];
        setFormOptionRightColumn({
            form:[
                {type:'select',name:'bank',option:bankOption ,label:'ธนาคาร',table:'data'},
                {type:'text', displayFunction: (t) => t.substring(0,5)+' น.' ,name:'payment_time' , label:'เวลาชำระเงิน',table:'data'},
                {type:'image-file', name:'attached_file' , path:'/public/files/payment/' , label: 'ไฟล์แนบ',table:'data'}
            ],
            setting:{
                responsive:['col-7','col-5'],
                mode:'view'
            }
        });
        const purchaseListResponse = await fetch(backend_api+'/purchase_order/get_purchase_order_by_payment?id='+_id); 
        const purchaseList = await purchaseListResponse.json();
        setDataModalTable(purchaseList.purchaseList);
        setOpenModal(true);
        setDataModal({data:payment.payment[0]});
    }

    useEffect(()=>{

        const fetchItems = async () =>{
            try{
                toAuthoruize(backend_api,page_code,navigate);
                const paymentResponse = await fetch(backend_api+'/payment/get_payment_table_list');
                const paymentList = await paymentResponse.json();
                setDataList(paymentList.paymentList);
            }catch(err){
                console.log(err.stack);
            }
        }
        (async () => await fetchItems() )();
    },[])

    const onConfirmPayment = async () => {
        const today = new Date();
        try{
            const optionObj = {
                method: 'PATCH',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({update : {confirm_payment : 'Y'} ,condition:{id:dataModal.id}})
            }
            await fetch(backend_api+'/payment/confirm_payment',optionObj).then(result=>{
                Swal.fire({
                    title : 'แจ้งเตือน',
                    text : 'ยืนยันการชำระเงินเรียบร้อยแล้ว'
                }).then(()=>{
                    window.location.reload();
                })
            })
        }catch(err){
            console.log(err.stack)
        }
    }

    return (
        <div>
            <div>
                <CreateTable tableOption={tableOption} dataList={dataList.filter((e,i)=>{
                    return i < page * itemShownNumber && i > page * itemShownNumber - itemShownNumber -1;
                })} />
                <PageNavigate page={page} setPage={setPage} dataSize={dataList.length} itemShownNumber={itemShownNumber}/>

            </div>
            <Modal ariaHideApp={false} style={{content:{padding:'0px',width:'650px',maxWidth:'50%',border:'1px solid #444444'}}} isOpen={openModal} contentLabel="รูป">
                <div style={{borderBottom:'1px solid #444444',backgroundColor:'#f2c1c1' ,display: 'flex',justifyContent: 'center' , color:'#383838' , width:'100%',height:'50px',alignItems: 'center' ,textAlign:'center'}}><b>ยืนยันการชำระเงิน</b></div>
                <div className="row" style={{padding:'15px'}}>
                <div className="col-6">
                    {
                        Object.keys(dataModal).length && Object.keys(formOptionLeftColumn).length ?
                        <CreateForm formOption={formOptionLeftColumn} itemList={dataModal} />
                        :''

                    }
                </div>
                <div className="col-6">
                    {
                        Object.keys(dataModal).length && Object.keys(formOptionRightColumn).length ?
                        <CreateForm formOption={formOptionRightColumn} itemList={dataModal} />
                        :''
                    }
                </div>
                <hr style={{width:'90%',marginLeft:'10%',marginTop:'10px'}} />
                </div>
                <div style={{marginLeft:'15px'}}>
                {
                    dataModalTable.length ?
                    <CreateTable tableOption={tableModalOption} dataList={dataModalTable} />
                    : ''
                }
                <br />
                <input type="checkbox" name="confirm" value="confirm" onChange={(event)=>{
                    confirmRef.current.disabled = !event.target.checked
                    if(event.target.checked){
                        confirmRef.current.addEventListener('click',onConfirmPayment);
                    }else{
                        confirmRef.current.removeEventListener('click',onConfirmPayment)
                    }
                    
                }} /><label>&nbsp;&nbsp;ยืนยันการชำระ</label>
                </div>
                <br />
                <div style={{textAlign:'center' , marginBottom:'20px'}}>
                    <button ref={confirmRef} className="btn btn-outline-secondary" disabled={true} style={{width:'200px'}} >ตกลง</button>
                    <button className="btn btn-outline-secondary" style={{width:'200px',marginLeft:'20px'}} onClick={() => setOpenModal(false)}>ปิด</button>
                    <a hrer="/payment_lsit" ref={refreshRef} />
                </div>
            </Modal>
        </div>
    )
}

export default PaymentList;
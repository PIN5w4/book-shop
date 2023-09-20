import React,{useEffect,useState,useRef} from 'react';
import {faShippingFast} from '@fortawesome/free-solid-svg-icons';
import CreateTable from '../master/CreateTable';
import Modal from 'react-modal';
import DeliverySheet from './DeliverySheet'
import Reciept from './Reciept';
import {backend_api} from '../master/ConstantData';
import PageNavigate from '../master/PageNavigate';
import {dateFormate} from '../master/form-operate';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import {toAuthoruize} from '../master/authorizePage';

const DeliveryList = () =>{

    const navigate = useNavigate();
    const [page,setPage] = useState(1);
    const [dataList,setDataList] = useState([]);
    const [dataSize,setDataSize] = useState(0);
    const [purchaseDetailList,setPurchaseDetailList] = useState([]);
    const [purchaseList,setPurchaseList] = useState([]);
    const [address,setAddress] = useState([]);
    const [openModal,setOpenModal] = useState(false);
    const itemShownNumber = 20;
    const [isChecked,setIsChecked] = useState(false);
    const [printReciept,setPrintReciept] = useState(false);
    const [printDeliverySheet,setPrintDeliverySheet] = useState(false);
    const deliverySheefRef = useRef();
    const page_code = 'p_3';

    const tableOption = {
        setting : {
            header:['ลำดับ','วันที่สั่งซื้อ','เวลาสั่งซื้อ','ชื่อผู้ใช้งาน','รายการ','จำนวนเล่ม','จัดส่ง'],
            responsive:['col-1','col-2 col-lg-1','col-1','col-2','col-1 col-lg-1','col-1','col-1'],
            parentStyle:[{textAlign:'center'},{},{},{},{textAlign:'center'},{textAlign:'center'},{textAlign:'center'}],
            page:20,
            color:{header:{backgroundColor:'#512507',color:'#dddddd'},even:{backgroundColor:'#ddffdd'},odd:{backgroundColor:'#ffe5e5'}},
            border:{border: 'solid 1px #ffffff'},
        },
        dataRow : [
            {type:'running' , start:page },
            {type:'text' , column : 'purchase_date' , displayFunction: (d)=>{
                const date = new Date(d['purchase_date']).toLocaleString();
                const dateArr = date.split(',')[0].split('/');
                return (parseInt(dateArr[1]) < 10 ? '0' : '') + dateArr[1]+'/'+(parseInt(dateArr[0]) < 10 ? '0' : '')+dateArr[0]+'/'+dateArr[2];
            }},
            {type:'text' ,displayFunction: (t)=> t['purchase_time'].substring(0,5)+' น.' },
            {type:'text' , column:'user_name'},
            {type:'text' , column:'number_of_item'},
            {type:'text' , column:'quantity'},
            {type:'button' ,icon:faShippingFast , class:'btn btn-secondary' , click:(r)=> onClickButton(r['id'])}
        ]
    }

    const tableModalOption = {
        setting : {
            header:['ลำดับ','รูป','ISBN','ชื่อเรื่อง','หมวด','จำนวน'],
            responsive:['col-1','col-2 col-lg-1','col-3','col-3','col-3 col-lg-2','col-1'],
            parentStyle:[{textAlign:'center'},{},{textAlign:'center'},{},{},{textAlign:'center'}],
            page:1,
            hidden : [2,4],
            lineSpace: true
        },
        dataRow : [
            {type:'running' , start:page },
            {type:'image', src:(r)=> backend_api+'/public/files/books/'+r['pic'],style:{display:'block',width:'50px',marginLeft:'auto',marginRight:'auto'}},
            {type:'text',column:'isbn'},
            {type:'text',column:'title'},
            {type:'text',column:'category'},
            {type:'text',column:'quantity'}
        ]
    }

    useEffect(()=>{
        const fetchItems = async () =>{
            toAuthoruize(backend_api,page_code,navigate);
            try{
                const response = await fetch(backend_api+'/purchase_order/get_purchase_order_for_delivery?page='+page+'&itemShownNumber='+itemShownNumber);
                const purchaseList = await response.json();
                setDataSize(purchaseList.size);
                setDataList(purchaseList.purchaseList);
            }catch(err){
                console.log(err.stack);
            }
        }
        (async () => await fetchItems() )();
    },[page]);

    const onClickButton = async (purchaseId) =>{
        const detailResponse = await fetch(backend_api+'/purchase_order/get_purchase_order_by_id?id='+purchaseId);
        const detail = await detailResponse.json();
        let prList = {user_name: detail.purchaseList[0].user_name};
        prList = {...prList,purchase_date: dateFormate(detail.purchaseList[0].purchase_date)}
        setPurchaseList(prList);
        setPurchaseDetailList(detail.purchaseList);
        setAddress(detail.address[0]);
        setOpenModal(true);
    }

    const deliveryPurchase = async () =>{
        const response = await fetch(backend_api+'/purchase_order/get_reciept_no');
        const running = await response.json();
        const nmbr = parseInt(running.recieptNo[0].running);
        const recieptNo = ((new Date()).getFullYear() - 2000) + '/' + (nmbr < 100 ? '0' : '' ) + (nmbr < 10 ? '0' : '' ) + (nmbr+1);
        const today = new Date();
        const deliveryDate = today.getFullYear()+'-'+(today.getMonth() < 9 ? '0' : '')+(today.getMonth()+1)+'-'+(today.getDate < 10 ? '0' : '')+today.getDate();
        const optionObj = {
            method: 'PATCH',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({data : {reciept_number: recieptNo, delivery_date : deliveryDate} , condition : {id: purchaseDetailList[0].id}})
        }
        await fetch(backend_api+'/purchase_order/delivery',optionObj);
        //console.log(purchaseDetailList[0])
        navigate(-1);
    }

    const onDelivery = async () => {
        if(!isChecked){
            setOpenModal(false)
        }else{
            if(!printDeliverySheet || !printReciept){
                Swal.fire({
                    title: 'แจ้งเตือน',
                    text : 'ยังไม่ได้พิมพ์'+(!printDeliverySheet ? ' ใบส่งของ' : '') 
                        + (!printDeliverySheet &&  !printReciept ? ' และ' : '') + (!printReciept ? ' ใบเสร็จ' : '')+ ' ต้องการทำรายการต่อหรือไม่',
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: "ตกลง",
                    cancelButtonText: "ยกเลิก"
                }).then(async (result) =>{
                    if(result.isConfirmed) await deliveryPurchase();
                })
            }else{
                await deliveryPurchase();
            }
            
        }
    }

    return (
        <div>
            <CreateTable tableOption={tableOption} dataList={dataList} />
            <PageNavigate page={page} setPage={setPage} dataSize={dataSize} itemShownNumber={itemShownNumber}/>
            { Object.keys(address).length ?
            <Modal ariaHideApp={false} style={{content:{padding:'0px',width:'800px',maxWidth:'90%',border:'1px solid #444444'}}} isOpen={openModal} contentLabel="รูป">
                <div style={{borderBottom:'1px solid #444444',backgroundColor:'#f2c1c1' ,display: 'flex',justifyContent: 'center' , color:'#383838' , width:'100%',height:'50px',alignItems: 'center' ,textAlign:'center'}}><b>จัดส่งสินค้า</b></div>
                <div style={{padding:'15px'}}>
                    <div className="row">
                        <div className="col-3">ชื่อผู้สั่งสินค้า</div>
                        <div className="col-8">{purchaseList.user_name}</div>
                    </div>
                    {
                        address.building ? 
                        <div className="row">
                            <div className="col-3">ที่อยู่</div>
                            <div className="col-8">{address.building}</div>
                        </div> :''
                    }
                    <div className="row">
                        <div className="col-3">{!address.building ? 'ที่อยู่' : ''}</div>
                        <div className="col-8">
                            {'บ้านเลขที่ '+address.house_no+' ถนน '+address.road
                                +(address.alley ? ' ซอย '+address.alley : '')+(address.village_no ? ' หมู่ที่ '+address.alley : '')}<br/>
                                {(address.province !== 'กรุงเทพมหานคร' ? 'ตำบล ' : 'แขวง') + address.sub_district + (address.province !== 'กรุงเทพมหานคร' ? ' อำเภอ ' : ' ')+address.district}<br/>
                                {' จังหวัด '+ address.province+' '+address.zip_code
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-3">วันที่สั่งซื้อ</div>
                        <div className="col-8">{purchaseList.purchase_date}</div>
                    </div>
                    <br/>
                    <hr/>
                    <br/>
                    <h5>รายการหนังสือ</h5>
                    {
                        purchaseDetailList.length ? 
                        <CreateTable tableOption={tableModalOption} dataList={purchaseDetailList}/>
                        :''
                    }
                </div>
                <div style={{marginTop : '15px',marginLeft:'15px'}}>
                    <input type="checkbox" name="delivery" onChange={(evnet)=>setIsChecked(evnet.target.checked)} />&nbsp;&nbsp;ส่งสินค้า
                </div>
                <div style={{textAlign:'center', marginBottom:'15px'}} className={isChecked ? '' : 'd-none'}>
                    <DeliverySheet user_name={purchaseList.user_name} address={address} setPrintDeliverySheet={setPrintDeliverySheet}/>
                    <Reciept userName={purchaseList.user_name} purchaseDate={purchaseList.purchase_date} dataList={purchaseDetailList} setPrintReciept={setPrintReciept} />
                </div>
                <div style={{textAlign:'center', marginBottom:'15px'}}>
                    <button className="btn btn-outline-secondary" style={{width:'200px'}} onClick={async() => await onDelivery()}>{isChecked ? 'ส่งสินค้า' : 'ปิด'}</button>
                </div>
            </Modal>
            :''}
        </div>
    )
    
}

export default DeliveryList;
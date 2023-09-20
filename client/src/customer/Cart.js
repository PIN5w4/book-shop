import React ,{useEffect,useState,useRef} from 'react';
import {FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faX,faAngleLeft,faAngleRight,faPlus} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import Swal from 'sweetalert2'
import {submitForm,removeWarningListener,onChangeZipCode,onDistrictChange,keyPressNumber} from '../master/form-operate';
import { useNavigate } from "react-router-dom";
import CreateForm from '../master/CreateForm';
import CreateTable from '../master/CreateTable';
import {backend_api} from '../master/ConstantData';
import {toAuthoruize} from '../master/authorizePage';

const Cart = () =>{

    const USER_API_URL = 'http://localhost:3500/users';
    const API_URL = 'http://localhost:3500/books';
    const ADDRESS_API_URL = 'http://localhost:3500/address';
    const PURCHASE_API_URL = 'http://localhost:3500/purchase_order';
    const DETAIL_API_URL = 'http://localhost:3500/purchase_detail';
    const [cartList,setCartList] = useState([]);
    const [addressArr,setAddressArr] = useState([]);
    const [addressIndex,setAddressIndex] = useState(0);
    const [district,setDistrict] = useState([]);
    const [subDistrict,setSubDistrict] = useState([]);
    const [openModal,setOpenModal] = useState(false);
    const provinceRef = useRef();
    const districtRef = useRef();
    const subDistrictRef = useRef();
    const addressIdRef = useRef();
    const navigate = useNavigate();

    useEffect(()=>{
        const fetchItems = async () =>{
            toAuthoruize(backend_api,null,navigate);
            try{
                const usr = JSON.parse(localStorage.getItem('user'));
                const cartResponse = await fetch(backend_api+'/cart/card_list?user_id='+usr.id);
                const cartItems = await cartResponse.json();
                const adressResponse = await fetch(backend_api+'/address/address_by_user_id?user_id='+usr.id);
                const addressItems = await adressResponse.json();
                setAddressArr(addressItems.addressList);
                setCartList(cartItems.cartList);
            }catch(err){
                console.log(err.stack);
            }
        }
    (async () => await fetchItems() )();
    },[])

    const tableOption = {
        setting : {
            header:['ลำดับ','รูป','ชื่อหนังสือ','ราคา','จำนวน','รวม','ลบ'],
            responsive:['col-1','col-2','col-3','col-1','col-1','col-1','col-1'],
            parentStyle:[{textAlign:'center'},{textAlign:'center'},{},{textAlign:'right'},{textAlign:'center'},{textAlign:'right'},{textAlign:'center'}],
            page:20,
            lineSpace:true,
            total:[4,5]
        },
        dataRow : [
            {type:'running',start:1},
            {type:'image', src: (p)=>backend_api+'/public/files/books/'+p['pic'],style:{display:'block',width:'50px',marginLeft:'auto',marginRight:'auto'}},
            {type:'text',column:'title'},
            {type:'text',column:'price',displayFunction:(p)=> p['price'].toLocaleString('en-US', {minimumFractionDigits:2})},
            {type:'text',column:'quantity'},
            {type:'text',column:'total',displayFunction:(p)=> (Number(p['total'])).toLocaleString('en-US', {minimumFractionDigits:2})},
            {type:'button', icon:faX ,style:{backgroundColor:'#ffffff' , border:'solid 1px #ffffff'} ,click: (e)=>removeCartList(e['id'])},
        ]
    }

    const changeAddress = (n) =>{
        if((addressIndex === 0 && n < 0) || (addressIndex === addressArr.length-1 && n > 0)) return;
        setAddressIndex(addressIndex+n);
    }

    const toggleModal = () =>{
        setOpenModal(!openModal);

    } 

    const removeCartList = (itm) =>{
        Swal.fire({
            title:'แจ้งเตือน',
            text:'ต้องการนำรายการนี้ออกจากตะกร้าสินค้าใช่หรือไม่'
        }).then(async (result)=>{
            if(result.isConfirmed){
                const newList = [...cartList].filter(e=>e.id !== itm);
                console.log(itm)
                const optionObj = {
                    method: 'PATCH',
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({id:itm})
                }
                await fetch(backend_api+'/cart/remove_item',optionObj);
                setCartList(newList);
            }
        })
    }

    const formOption = {
        form:[
            {type: 'text', label:'อาคาร', name:'building' , table:'address'},
            {type: 'text', label:'บ้านเลขที่', name:'house_no' , table:'address',class:'required'},
            {type: 'text', label:'หมู่ที่', name:'village_no' , table:'address'},
            {type: 'text', label:'ถนน', name:'road' , table:'address',class:'required'},
            {type: 'text', label:'ซอย', name:'alley' , table:'address'},
            {type: 'text', label:'รหัสไปรษณีย์', name:'zip_code' , table:'address',class:'required' 
            ,maxLength : 5 ,keyPress: keyPressNumber , change: async(event) =>{
                const result = await onChangeZipCode(event,provinceRef.current);
                if(result.district) setDistrict(result.district);
            }},
            {type: 'text', label:'จังหวัด', name:'province' , ref:provinceRef , table:'address', disabled: true},
            {type: 'select', label:'อำเภอ/เขต', name:'district' , ref:districtRef , table:'address',class:'required' , option:district , change:(event)=>{
                const result = onDistrictChange(districtRef.current,district,subDistrictRef.current);
                setSubDistrict(result)} },
            {type: 'select', label:'ตำบล / แขวง', name:'sub_district' , option: subDistrict, ref:subDistrictRef , table:'address',class:'required'},
        ],
        setting:{
            responsive:['col-12','col-12','col-12'],
            mode:'new'
        }
    }

    const onPurchaseOrder = async() => {
        const today = new Date();
        const purcahseDate = today.getFullYear()+'-'+(today.getMonth() < 9 ? '0'+(today.getMonth()+1):(today.getMonth())+1)+'-'+(today.getDate() < 10 ? '0'+today.getDate():today.getDate());
        const purcahseTime = (today.getHours() <10 ? '0' : '')+today.getHours()+':'+(today.getMinutes() <10 ? '0' : '')+today.getMinutes();
        
        try{
            const usr = JSON.parse(localStorage.getItem('user'));
            const purchaseOrder = {
                purchase_date:purcahseDate,
                purchase_time:purcahseTime,
                user_id:usr.id,
                address_id: parseInt(addressIdRef.current.innerHTML),
            }
            let cartUpdate = [...cartList].map(e=> e.id);
            const optionObj = {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({purchaseOrder:purchaseOrder,cartUpdate,cartUpdate})
            }
            await fetch(backend_api+'/purchase_order/insert_purchase',optionObj);
            Swal.fire({
                title:'แจ้งเตือน',
                text:'การสั่งซื้อสำเร็จ'  
            }).then(result=>{
                navigate('/');
            })
        }catch(err){
            console.log(err);
        }
        
    }

    const onSubmitForm = async () =>{
        const data = submitForm();
        if(!data.message){
            const usr = JSON.parse(localStorage.getItem('user'));
            data.address ={...data.address,user_id:usr.id};

                const optionObj = {
                    method: 'POST',
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
                await fetch(backend_api+'/address/insert_address',optionObj);
                const adressResponse = await fetch(backend_api+'/address/address_by_user_id?user_id='+usr.id);
                const addressItems = await adressResponse.json();
                setAddressIndex(addressArr.length);
                setAddressArr(addressItems.addressList);
                toggleModal();
        }
        
    }

    return(
        <div>
            <h3 style={{marginLeft:'10px'}}>ตะกร้าสินค้า</h3><br/>
            <div className="row mb-3" style={{maxWidth:'1000px',fontSize:'14px'}}>
            { cartList.length ?
               <CreateTable tableOption={tableOption} dataList={cartList}/>  :   (<h5 style={{marginLeft:'300px'}}>ไม่มีสินค้าในตะกร้าสินค้า</h5>)            
            }</div>
                <><br/>
                <br/>
                { addressArr.length ?
                <div style={{width:'500px', maxWidth:'90%',borderStyle:'solid',borderColor:'#444444',borderWidth:'2px',borderRadius:'10px',padding:'10px',marginLeft:'20px',marginBottom:'20px'}}>
                    <div className="row mb-2">
                        <div className="col-7"><h5>ที่อยู่ในการจัดส่ง</h5></div>
                        <div className="col-5">
                            <button onClick={()=>changeAddress(-1)} className="btn btn-outline-secondary" style={{marginLeft:'10px'}}><FontAwesomeIcon icon={faAngleLeft} /></button>
                            <button onClick={()=>changeAddress(1)} className="btn btn-outline-secondary" style={{marginLeft:'10px'}}><FontAwesomeIcon icon={faAngleRight} /></button>
                            <button onClick={toggleModal} className="btn btn-outline-secondary" style={{marginLeft:'20px'}}><FontAwesomeIcon icon={faPlus} /></button>
                        </div>
                    </div>
                    <div className="d-none"><label ref={addressIdRef}>{addressArr[addressIndex].id}</label></div>
                    <p>{
                        addressArr[addressIndex].building ? 
                        <>
                            {addressArr[addressIndex].building} <br/>
                        </>
                        : ''
                    }{'บ้านเลขที่ '+addressArr[addressIndex].house_no+' ถนน '+addressArr[addressIndex].road
                        +(addressArr[addressIndex].alley ? ' ซอย '+addressArr[addressIndex].alley : '')+(addressArr[addressIndex].village_no ? ' หมู่ที่ '+addressArr[addressIndex].alley : '')}<br/>
                        {(addressArr[addressIndex].province !== 'กรุงเทพมหานคร' ? 'ตำบล ' : 'แขวง') + addressArr[addressIndex].sub_district + (addressArr[addressIndex].province !== 'กรุงเทพมหานคร' ? ' อำเภอ ' : ' ')+addressArr[addressIndex].district}<br/>
                        {' จังหวัด '+ addressArr[addressIndex].province+' '+addressArr[addressIndex].zip_code
                    }</p>
                </div> : ''}
                <Modal ariaHideApp={false} onAfterOpen={removeWarningListener} style={{content:{padding:'0px',width:'500px',maxWidth:'80%',border:'1px solid #444444'}}} isOpen={openModal} contentLabel="เพิ่มที่อยู่">
                <div style={{borderBottom:'1px solid #444444',backgroundColor:'#f2c1c1' ,display: 'flex',justifyContent: 'center' , color:'#383838' , width:'100%',height:'50px',alignItems: 'center' ,textAlign:'center'}}><b>เพิ่มที่อยู่</b></div>
                    <div style={{padding:'15px'}}>
                        <CreateForm formOption={formOption}/>
                    </div>
                    <div style={{textAlign:'center',marginTop:'15px',marginBottom:'10px'}}>
                        <button className="btn btn-outline-secondary" onClick={onSubmitForm}>บันทึก</button>
                        <button style={{marginLeft:'20px'}} className="btn btn-outline-secondary" onClick={toggleModal}>ปิด</button>
                    </div>
                </Modal>
                <br/>
                <button onClick={onPurchaseOrder} disabled={cartList.length === 0} className="btn btn-outline-danger" style={{width:'250px',display:'block',marginLeft:'auto',marginRight:'auto',marginBottom:'50px'}}>สั่งซื้อ</button>
                </>       
        </div>
    )

}

export default Cart;
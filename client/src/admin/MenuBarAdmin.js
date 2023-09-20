import React,{useRef,useEffect} from 'react';
import {FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCaretDown} from '@fortawesome/free-solid-svg-icons';  
import {backend_api} from '../master/ConstantData';

const MenuBarAdmin = () =>{
    
    const homeRef = useRef();
    const parentStyle = {
        borderColor:'#bbbbbb',
        borderStyle:'solid',
        borderWidth: '1px',
        textAlign:'left',
        marginBottom:'10px',
        color:'#ffffff',
        backgroundColor:'#333333',
        width:'100%',
        padding:'10px'
    };

    const linkStyle = {
        color:'#ffffff' ,
        textDecorationLine: 'none'
    };

    const onLogout = () =>{
        localStorage.clear();
        homeRef.current.click();
    };

    useEffect(()=>{
        const fetchItems = async () =>{
            try{
                const usr = JSON.parse(localStorage.getItem('user'));
                if(usr){
                    const usrResponse = await fetch(backend_api+'/users/getUserById?id='+usr.id);
                    const usrItem = await usrResponse.json();
                    for(let i = 1 ; i < 8 ; i++){
                        if(usrItem.user[0][`p_${i}`] === 'N' && document.querySelector(`[page = "p_${i}"]`)) document.querySelector(`[page = "p_${i}"]`).remove(); 
                    }
                    if(usrItem.user[0]['p_4'] === 'N' && usrItem.user[0]['p_5'] === 'N' && usrItem.user[0]['p_6'] === 'N' && document.querySelector(`[page = "setting"]`)){
                        document.querySelector(`[page = "setting"]`).remove();
                    }
                }
            }catch(err){
                console.log(err.stack)
            }
        }
        (async () => await fetchItems() )();
    },[])

    return (
        <div style={parentStyle}>
            <div className="row" style={{maxWidth:'850px' ,display:'inline-block'}}>
                <span className="d-none"><a href="/" ref={homeRef}>home</a></span>
                <span className="col-3 col-md-2 menu-bar"><a onClick={onLogout} style={linkStyle}>ออกจากระบบ</a></span>
                <span className="col-3 col-md-2 menu-bar" page="p_1"><a href="/book_stock" style={linkStyle}>รายการหนังสือ</a></span>
                <span className="col-3 col-md-2 menu-bar" page="p_2"><a href="/payment_list" style={linkStyle}>ยืนยันการชำระเงิน</a></span>
                <span className="col-3 col-md-2 menu-bar" page="p_3"><a href="/delivery_list" style={linkStyle}>ส่งสินค้า</a></span>
                <span page="setting">
                    <div className="dropdown">
                        <button className="dropbtn">ตั้งค่า&nbsp;<FontAwesomeIcon icon={faCaretDown} /></button>
                        <div className="dropdown-content">
                            <a page="p_4" href="/setting/user">สิทธิผู้ใช้งาน</a>
                            <a page="p_5" href="/setting/category">หมวด</a>
                            <a page="p_6" href="/setting/publicer">สำนักพิมพ์</a>
                        </div>
                    </div>
                </span>
                <span className="col-3 col-md-2 menu-bar" page="p_7"><a href="/report" style={linkStyle}>รายงาน</a></span>
            </div>
        </div>
    )
}

export default MenuBarAdmin;
import React , {useRef , useState ,useEffect} from 'react';
import {FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSearch , faUser , faShoppingCart, faCaretDown , faMoneyBill , faHome , faHeart} from '@fortawesome/free-solid-svg-icons';  
import { useNavigate } from "react-router-dom";
import {backend_api} from '../master/ConstantData';

const MenuBarCustomer = () =>{

    const [searchBox,setSearchBox] = useState('');
    const navigate = useNavigate();
    const homeRef = useRef();
    const searchIconRef = useRef();
    const searchBoxRef = useRef();
    const [categoryDropdown,setCategoryDropdown] = useState([]);
    const [publicerDropdown,setPublicerDropdown] = useState([]);
    const [userId,setUserId] = useState(0);
    const parentStyle = {
        borderColor:'#bbbbbb',
        borderStyle:'solid',
        borderWidth: '1px',
        textAlign:'left',
        marginBottom:'10px',
        color:'#ffffff',
        backgroundColor:'#333333',
        width:'100%',
    }

    const inputStyle={
        marginLeft:'10px',
        display: 'inline-block',
        paddingRight:'20px',
        paddingLeft:'10px',
        width:'250px'
    }

    const searchIconStyle={
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'inline-block',
        position: 'absolute',
        top: '8px',
        color:'#444444',
        left: '235px',
        pointerEvents: searchBox ? 'auto' : 'none'
    }

    const inlineStyle ={
        display: 'inline-block'
    }

    const onChangeInput = (event) =>{
        setSearchBox(event.target.value)
    }

    const onKeyDownInput = (e) =>{
        if(e.key==='Enter' && searchBox){
            searchIconRef.current.click();
        }
    }

    const onLogout = () =>{
        localStorage.clear();
        homeRef.current.click();
    }

    useEffect(()=>{
        const fetchItems = async () =>{
            try{
                const categoryResponse = await fetch(backend_api+'/category/navibar');
                const categoryList =  await categoryResponse.json()
                setCategoryDropdown(categoryList.categoryList);
                const publicerResponse = await fetch(backend_api+'/publicer/navibar');
                const publicerList =  await publicerResponse.json()
                setPublicerDropdown(publicerList.publicerList); 
                const usr = JSON.parse(localStorage.getItem('user'));
                if(usr) setUserId(usr.id);
            }catch(err){
                console.log(err.stack)
            }
        }
        (async () => await fetchItems() )();

    },[])

    return(
        <div style={parentStyle}>
            <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-5 p-2" style={{position: 'relative' , display: 'inline-block'}}>
                <span className="menu-bar" style={{marginLeft:'10px'}}><a ref={homeRef} href="/" style={{color:'#ffffff' , textDecorationLine: 'none'}}><FontAwesomeIcon icon={faHome} />&nbsp;Home</a></span>
                { localStorage.getItem("user") ? 
                    <span className="menu-bar" style={{marginLeft:'10px'}}><a onClick={onLogout} style={{color:'#ffffff' , textDecorationLine: 'none'}}><FontAwesomeIcon icon={faUser} />&nbsp;ออกจากระบบ</a></span>
                :
                    <span className="menu-bar" style={{marginLeft:'10px'}}><a href="/login" style={{color:'#ffffff' , textDecorationLine: 'none'}}><FontAwesomeIcon icon={faUser} />&nbsp;เข้าสู่ระบบ</a></span>
                }
                <span className="menu-bar" style={{marginLeft:'10px'}}><a href="/cart" style={{color:'#ffffff' , textDecorationLine: 'none'}}><FontAwesomeIcon icon={faShoppingCart} />&nbsp;ตะกร้าสินค้า</a></span>
                <span className="menu-bar" style={{marginLeft:'10px'}}><a href="/payment" style={{color:'#ffffff' , textDecorationLine: 'none'}}><FontAwesomeIcon icon={faMoneyBill} />&nbsp;ชำระเงิน</a></span>
            </div>
            <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 p-2" style={{position: 'relative', display: 'inline-block'}}>
                <input ref={searchBoxRef} style={inputStyle} onChange={onChangeInput} onKeyDown={onKeyDownInput} />
                <a  href={searchBox ? `/search/search/${searchBox}` : ''} ref={searchIconRef} style={searchIconStyle}><FontAwesomeIcon icon={faSearch} /></a>
            </div>
            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4 p-1" style={{display: 'inline-block'}}>
                <div className="dropdown">
                    <button className="dropbtn">หมวด&nbsp;<FontAwesomeIcon icon={faCaretDown} /></button>
                    <div className="dropdown-content">
                        {
                            categoryDropdown.length ?
                            categoryDropdown.map((e,i)=>{
                                return <a href={`/search/category/${e.code}`} key={i}>{e.category_name}</a>
                            }) : ''
                        }
                    </div>
                </div>
                <div className="dropdown">
                    <button className="dropbtn">สำนักพิมพ์&nbsp;<FontAwesomeIcon icon={faCaretDown} /></button>
                    <div className="dropdown-content">
                    {
                        publicerDropdown.length ?
                        publicerDropdown.map((e,i)=>{
                            return <a href={`/search/publicer/${e.code}`} key={i}>{e.publicer_name}</a>
                        }) : ''
                    }
                    </div>
                </div>
                <span className="menu-bar" style={{marginLeft:'20px'}}><a href={`/search/interest/${userId}`} style={{color:'#ffffff' , textDecorationLine: 'none'}}><FontAwesomeIcon icon={faHeart} />&nbsp;หนังสือที่สนใจ</a></span>
            </div>
            
        </div>
    )
}

export default MenuBarCustomer;
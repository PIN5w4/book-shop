import React , {useState , useEffect ,useRef} from 'react';
import { useParams } from "react-router-dom";
import {FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faHeart , faShoppingCart} from '@fortawesome/free-solid-svg-icons';  
import BookItem from './BookItem';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import {backend_api} from '../master/ConstantData';
import {toAuthoruize} from '../master/authorizePage';

const BookDetail = () => {
    
    const BOOK_API_URL = 'http://localhost:3500/books';
    const USER_API_URL = 'http://localhost:3500/users';
    const navigate = useNavigate();
    const {id} = useParams();
    const [book,setBook] = useState({});
    const [interest,setInterest] = useState(0);
    const [cartList,setCartList] = useState(0);
    const [recommendList,setRecommendList] = useState([]);
    const [interestList,setInterestList] = useState([]);
    const [cartNumber,setCartNumber] = useState('1');
    const order = useRef();

    useEffect(()=>{
        const fetchItems = async () =>{
            toAuthoruize(backend_api,null,navigate);
            try{
                const bookResponse = await fetch(backend_api+'/books/get_book_by_id?id='+id);
                const listsItem = await bookResponse.json();
                let recommendBook = listsItem.mayBeInterest;
                let idArr = [listsItem.book[0].id];
                let recommendArr = [];
                let count = 0;
                let index = 0;
                while(count < 3){
                    if(idArr.indexOf(recommendBook[index].id) === -1 && Math.random() < 0.35){
                        idArr.push(recommendBook[index].id);
                        recommendArr.push(recommendBook[index]);
                        count++;
                    }
                    index = index === recommendBook.length - 1 ? 0 : index+1;
                }
                const usr = JSON.parse(localStorage.getItem('user'));
                if(usr && usr.id){
                    const response = await fetch(backend_api+'/interested/is_interested?user_id='+usr.id+'&book_id='+id);
                    const interestedItem = await response.json();
                    setInterest(interestedItem.interested.length);
                }
                setBook(listsItem.book[0]);
                setRecommendList(recommendArr);
            }catch(err){
                console.log(err.stack);
            }
        }
        (async () => await fetchItems() )();
    },[])

    const addToCart = async() =>{
        const usr = JSON.parse(localStorage.getItem('user'));
        if(!usr) return navigate('/login');
        try{
            const existResponse = await fetch(backend_api+'/cart/check_exist?book_id='+id+'&user_id='+usr.id);
            const existList = await existResponse.json();

            let isExist = existList.cartList.legnth ? true : false;
            Swal.fire({
                title: 'แจ้งเตือน',
                text: (isExist ? 'คุณมีสินค้ารายการนี้แล้วในตะกร้า ' : '')+'ต้องการเพิ่มรายการนี้ลงในตะกร้าสินค้าหรือไม่',
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: "ตกลง",
                cancelButtonText: "ยกเลิก"}).then(async (result)=>{
                    if(result.isConfirmed){
                        const optionObj = {
                            method: 'POST',
                            headers:{
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                data:{ 
                                        user_id:usr.id,
                                        book_id:id,
                                        quantity:order.current.value
                                    },
                                insert: !isExist,
                                beginningQuatity : isExist ?  existList.cartList[0].quantity : 0
                                
                            })
                        }
                        await fetch(backend_api+'/cart/add_to_cart',optionObj); 
                    }
                })
            }catch(err){
                console.log(err.stack)
            }
    }

    const onClickInterest = async() =>{
        const usr = JSON.parse(localStorage.getItem('user'));
        if(!usr) return navigate('/login');
        let update = [...interestList];
        const updateInterest = 1 - interest; 
        const obj = {
            interest: updateInterest,
            user_id: usr.id,
            book_id: id
        }
        const optionObj = {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        }
        await fetch(backend_api+`/interested/interested`,optionObj);
        setInterest(updateInterest);
    }

    const adjustOrder = (opr) =>{
        const ordr = order.current.value;
        if(opr==='-' && ordr === '1') return;
        order.current.value = eval(ordr+opr+'1');
    }

    return (
        <div style={{marginBottom:'30px'}}>
            <div className="row">
                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                    <img style={{marginLeft:'20%',marginRight:'20%',width:'60%'}} src={Object.keys(book).length ? backend_api+'/public/files/books/'+book.pic : ''} />
                </div>
                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                    { Object.keys(book).length ?
                        (   <>
                                <h3>{book.title}</h3>
                                <table>
                                    <tbody>
                                        <tr><td>สำนักพิมพ์</td><td>{book.publicer_name}</td></tr>
                                        <tr><td>ผู้เขียน</td><td>{book.author}</td></tr>
                                        <tr><td>จำนวนหน้า</td><td>{book.page_number} หน้า</td></tr>
                                        <tr><td>หมวด</td><td>{book.category_name}</td></tr>
                                        <tr><td>ปก</td><td>{book.cover === 'P' ? 'ปกอ่อน' : 'ปกแข็ง'}</td></tr>
                                        <tr><td>ISBN</td><td>{book.isbn}</td></tr>
                                        <tr><td>ราคา</td><td>{book.price}</td></tr>
                                    </tbody>
                                </table>
                            </>
                        ):''
                    }
                    <br/>
                    <div>
                        <div style={{display:'inline-block',borderStyle:'solid',borderColor:'#888888',borderRadius:'10px',borderWidth:'1px',padding:'7px'}}>
                            <button style={{display:'inline-block'}} className="btn btn-outline-danger" onClick={addToCart}><FontAwesomeIcon icon={faShoppingCart} /></button>
                            <button style={{display:'inline-block',marginLeft:'30px',height:'39px',width:'44px',fontSize:'20px',paddingTop:'3px'}} onClick={()=>adjustOrder('+')} className="btn btn-outline-danger">+</button>
                            <input type="text" ref={order} value={cartNumber} style={{display:'inline-block',marginLeft:'5px',textAlign:'center',width:'35px' ,height:'30px'}} disabled={true} />
                            <button style={{display:'inline-block',marginLeft:'5px',height:'39px',width:'44px',fontSize:'20px',paddingTop:'3px'}} onClick={()=>adjustOrder('-')} className="btn btn-outline-danger">-</button>
                        </div>
                        <div style={{display:'inline-block', marginLeft:'25px' }}>
                            <button className={"btn btn"+(interest ? "" : "-outline")+"-danger"} onClick={onClickInterest}><FontAwesomeIcon icon={faHeart} /></button>
                        </div>
                    </div>
                    <br/>
                    <hr style={{width:'70%',marginLeft:'15%'}}/>
                    <br/>
                    <h4 style={{marginBottom: '20px'}}>คำอธิบายหนังสือ</h4>
                    <p style={{width:'70%'}}>{book.description}</p>
                </div>
            </div>
            <hr style={{width:'80%',marginLeft:'10%'}} />
            <h4 style={{marginLeft:'10px'}}>หนังสือที่คิดว่าคุณน่าจะสนใจ</h4><br/>
            {
                recommendList.length ?
                (
                    <div className="row">
                        <a href={'/book/'+recommendList[0].id} className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3" style={{color:'#000000',textDecorationLine: 'none',display:'inline-block'}}><BookItem item={recommendList[0]} /></a>
                        <a href={'/book/'+recommendList[1].id} className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3" style={{color:'#000000',textDecorationLine: 'none',display:'inline-block'}}><BookItem item={recommendList[1]} /></a>
                        <a href={'/book/'+recommendList[2].id} className="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-3" style={{color:'#000000',textDecorationLine: 'none',display:'inline-block'}}><BookItem item={recommendList[2]} /></a>
                    </div>
                ):''
                
            }
        </div>
    ) 
}

export default BookDetail;
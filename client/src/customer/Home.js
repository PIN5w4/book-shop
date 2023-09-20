import React , {useEffect,useState, useContext} from 'react'
import BooksList from './BooksList';
import {backend_api} from '../master/ConstantData';
import {AppContext} from '../App';

const Home = () =>{

    const API_URL = 'http://localhost:3500/books';
    const [newItemList,setNewItemList] = useState([]);
    const [bestSellerList,setBestSellerList] = useState([]);
    const [recommendList,setRecommendList] = useState([]);
    const {isAdmin,setIsAdmin} = useContext(AppContext);

    useEffect(()=>{
        const fetchItems = async () =>{
            try{
                const response = await fetch(backend_api+'/books/home');
                const books = await response.json();
                const usr = JSON.parse(localStorage.getItem('user'));
                if(usr){
                    const usrResponse = await fetch(backend_api+'/users/getUserById?id='+usr.id);
                    const usrItem = await usrResponse.json();
                    setIsAdmin(usrItem.user[0].user_group === 'admin');
                }else{
                    setIsAdmin(false);
                }
                setNewItemList(books.newItems);
                setBestSellerList(books.bestSeller);
                setRecommendList(books.recommend);
            }catch(err){
                console.log(err.stack);
            }
        }
        (async () => await fetchItems() )();
    },[])
     
    return (
        <div>
            {
                !isAdmin  && newItemList && bestSellerList && recommendList ?
                <>
                    <BooksList tagName="หนังสือมาใหม่" lst={newItemList} underLine={true} btn={'/search/newBook/all'} />
                    <BooksList tagName="หนังสือขายดี" lst={bestSellerList} underLine={true}  btn={'/search/bestSeller/all'} />
                    <BooksList tagName="หนังสือแนะนำ" lst={recommendList} underLine={false} btn={'/search/recommend/all'} />
                </>: 
                <div style={{width:'100%' ,height:'500px'}}></div>
            }   
        </div>
    )
}

export default Home;
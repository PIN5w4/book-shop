import React , {useEffect, useContext} from 'react';
import MenuBarCustomer from '../customer/MenuBarCustomer';
import MenuBarAdmin from '../admin/MenuBarAdmin';
import {AppContext} from '../App';
import {backend_api} from './ConstantData'

const MenuBar = () =>{

    const {isAdmin,setIsAdmin} = useContext(AppContext);

    useEffect(()=>{
        const fetchItems = async () =>{
            try{
                const usr = JSON.parse(localStorage.getItem('user'));
                if(usr){
                    const usrResponse = await fetch(backend_api+'/users/getUserById?id='+usr.id);
                    const usrItem = await usrResponse.json();
                    setIsAdmin(usrItem.user[0].user_group === 'admin');
                }else{
                    setIsAdmin(false);
                }
            }catch(err){
                console.log(err.stack)
            }
        }
        (async () => await fetchItems() )();
    },[]);

    return(
        <div>
            {   !isAdmin ?
                <MenuBarCustomer />:<MenuBarAdmin />
            }
            
        </div>
    )
}

export default MenuBar;
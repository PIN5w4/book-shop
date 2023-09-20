const toAuthoruize =  async (backend_api,page_code,navigate) =>{
    try{
        const usr = JSON.parse(localStorage.getItem('user'));
        if(usr){
            const usrResponse = await fetch(backend_api+'/users/getUserById?id='+usr.id);
            const usrItem = await usrResponse.json();
            console.log(usrItem.user[0]['user_group']);
            if((usrItem.user[0]['user_group'] === 'admin' && page_code === null) || (usrItem.user[0][page_code] === 'N')) navigate('/');
        }else{
            if(page_code !== null) navigate('/');
        }
    }catch(err){
        console.log(err.stack)
    }
}

export {toAuthoruize};
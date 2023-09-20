const db = require('../config/db');
const helper = require('../master/helper');

exports.checkExist = async (req,res) =>{
    console.log('req ',req.query);
    const cartList = await db.execute(`
        select *
        from cart
        where user_id = ? and book_id = ? and status ='A' and  purchase_order_id is null
    `,[req.query.user_id,req.query.book_id]);
    res.status(200).json({
        cartList
    })
}

exports.addToCart = async(req,res)=>{
    console.log(req)
    if(req.body.insert){
        const insertCart = helper.createInsertString('cart',req.body.data);
        await db.execute(insertCart.sql,insertCart.value);
    }else{
        await db.execute("update cart set quantity = ? where user_id = ? and book_id = ? and status ='A' and  purchase_order_id is null"
        ,[req.body.data.quantity+req.body.beginningQuatity,req.body.data.user_id,req.body.data.book_id]);
    }
    res.status(200).json({messge:'success!!'});
}

exports.getCartList = async (req,res) => {
    const [cartList,_cartList] = await db.execute(`
        select  c.id , b.title , b.pic , b.price , c.quantity ,
                b.price*c.quantity as total 
        from    cart c
        join    books b on c.book_id = b.id 
        where   user_id = ? and status = 'A' and purchase_order_id is null`
    ,[req.query.user_id]);
    res.status(200).json({cartList});
}

exports.removeItem = async (req,res) =>{
    console.log('body ',req)
    await db.execute("update cart set status = 'I' where id = ?",[req.body.id])
    res.status(200).json({message:'deleted'});
}

exports.getCartListByPurchaseOrder = async (req,res) =>{
    const [cartList,_cartList] = await db.execute(`
        select  c.id , b.title , b.pic , b.price , c.quantity ,
                b.price*c.quantity as amount 
        from    cart c
        join    books b on c.book_id = b.id 
        where   status = 'A' and purchase_order_id = ?`
    ,[req.query.purchase_order_id]);
    res.status(200).json({cartList});
}
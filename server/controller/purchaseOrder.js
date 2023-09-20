const db = require('../config/db');
const helper = require('../master/helper');

exports.insertPurchase = async (req,res) => {
    const cartUpdate = req.body.cartUpdate;
    try{
        const insertPurchaseOrder = helper.createInsertString('purchase_order',req.body.purchaseOrder);
        const [newPuchaseOrder,_newPurchaseOrder] = await db.execute(insertPurchaseOrder.sql,insertPurchaseOrder.value);
        console.log(newPuchaseOrder.insertId)
        for(let i = 0 ; i < cartUpdate.length ; i++){
            await db.execute(`update cart set purchase_order_id = ? where id = ?`,[newPuchaseOrder.insertId,cartUpdate[i]]);
        }
            
    }catch(err){
        console.log(err.stack);
    }
    
    res.status(200).json({message:'inserted already'});
}

exports.getPuchaseOrderForPaymnet = async (req,res) =>{
    const [purchaseList,_PurchaseList] = await db.execute(`
        with dataTable as ( 
            select c.purchase_order_id , c.quantity*b.price as total 
            from cart c 
            join books b on c.book_id = b.id
            join purchase_order p on c.purchase_order_id = p.id
            where c.user_id = ? and p.payment_id is null 
        ) 
        
        select p.id , p.purchase_date , p.purchase_time , count(1) as number_of_item , sum(d.total) as total_amount 
        from dataTable d
        join purchase_order p on p.id = d.purchase_order_id
        group by p.id     
    `,[req.query.user_id]);
    res.status(200).json({purchaseList});
}

exports.getPuchaseOrderByPayment = async (req,res) => {
    const [purchaseList,_purchaseList] = await db.execute(`
        with dataTable as ( 
            select c.purchase_order_id , c.quantity*b.price as total 
            from cart c
            join books b on c.book_id = b.id
            join purchase_order p on p.id = c.purchase_order_id 
            where p.payment_id = ?
        )
        select p.id , p.purchase_date , p.purchase_time , sum(d.total) as total_amount
        from purchase_order p
        join dataTable d on d.purchase_order_id = p.id
        group by p.id
    `,[req.query.id])
    console.log(purchaseList);
    res.status(200).json({purchaseList});
}
exports.getPuchaseOrderForDelivery = async( req,res) =>{
    const page = req.query.page;
    const item_number = req.query.itemShownNumber;
    let [purchaseList,_purchaseList] = await db.execute(`
        select  p.id , p.purchase_date , p.purchase_time 
                , concat(u.first_name,' ',u.last_name) as user_name , count(1) as number_of_item
                , sum(c.quantity) as quantity 
        from    purchase_order p
        join    users u on u.id = p.user_id 
        join    cart c on p.id = c.purchase_order_id
        join    payment py on py.id = p.payment_id
        where   py.confirm_payment = 'Y' and p.delivery_date is null
        group by p.id
    `);
    const size = purchaseList.length; 
    purchaseList = [...purchaseList].filter((e,i)=> i >= (page-1)*item_number && i < page*item_number);
    res.status(200).json({purchaseList,size});
}

exports.getPurchaseById = async (req,res) =>{
    const [purchaseList,_purchaseList] = await db.execute(`
        select  p.id , b.pic , b.isbn , b.title , cat.category_name as category , c.quantity , concat(u.first_name,' ',u.last_name) as user_name
                , p.purchase_date , b.price , b.price * c.quantity as amount
        from    purchase_order p
        join    cart c on c.purchase_order_id = p.id
        join    books b on b.id = c.book_id 
        join    category cat on b.category_code = cat.code
        join    users u on u.id = p.user_id 
        where p.id = ?
    `,[req.query.id]);

    const [address,_address] = await db.execute(`
        select a.*
        from purchase_order p
        join address a on a.id = p.address_id 
        where p.id = ?
    `,[req.query.id]);

    res.status(200).json({purchaseList,address});
}

exports.delivery = async (req,res) => {
    const updateItem = helper.createUpdateString('purchase_order',req.body.data,req.body.condition);
    console.log(updateItem);
    await db.execute(updateItem.sql,updateItem.value);
    const yr = (new Date()).getFullYear();
    const [running,_running] = await db.execute(`
        select *
        from running
        where type = 'purchase' and year = '${yr}'
    `);
    console.log(running[0].running+1)
    if(running.length > 0){
        await db.execute("update running set running = ? where type = 'purchase' and year = ? ",[running[0].running+1,yr]);
    }else{
        await db.execute("insert into running (type,year,running) values('purchase',?,1)",[yr]);
    }
    res.status(200).json({messagge : 'updated'})
}

exports.getRecieptNo = async (req,res) =>{
    const [recieptNo,_recieptNo] = await db.execute(`
        select running
        from running
        where type = 'purchase' and year = '${(new Date()).getFullYear()}' 
    `)
    console.log(recieptNo[0])
    res.status(200).json({recieptNo});
}
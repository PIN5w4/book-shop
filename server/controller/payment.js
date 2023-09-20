const db = require('../config/db');
const helper = require('../master/helper');

exports.insertPayment = async (req,res) => {
    const insertPayment = helper.createInsertString('payment',req.body.payment);
    const [payment,_payment] = await db.execute(insertPayment.sql,insertPayment.value);
    const purchaseArr = req.body.purchase_number;
    for(let i = 0 ; i < purchaseArr.length ; i++){
        await db.execute(`
            update purchase_order
            set payment_id = ?
            where id = ?
        `,[payment.insertId,purchaseArr[i]])
    }
    res.status(200).json({message : 'inserted already!!'});
}

exports.getPaymentTableList = async (req,res) =>{
    const [paymentList,_paymentList] = await db.execute(`
        select py.* , concat(ur.first_name,' ',ur.last_name) as user_name
        from payment py
        join users ur on ur.id = py.user_id
        where py.confirm_payment = 'N'
    `);
    res.status(200).json({paymentList});
}

exports.getPaymentById = async (req,res) =>{
    const [payment,_payment] = await db.execute(`
        select py.* , concat(ur.first_name,' ',ur.last_name) as user_name
        from payment py
        join purchase_order po on py.id = po.payment_id
        join users ur on ur.id = py.user_id
        where py.id = ?
    `,[req.query.id]);
    res.status(200).json({payment});
}

exports.confirmPayment = async (req,res) => {
    const updatePayment = helper.createUpdateString('payment',req.body.update,req.body.condition);
    await db.execute(updatePayment.sql,updatePayment.value);
    res.status(200).json({message: 'updated!!'});
}
const db = require('../config/db');
const helper = require('../master/helper');

exports.getAddressByUserId = async (req,res) =>{
    const [addressList,_addressList] = await db.execute('select * from address where user_id = ?',[req.query.user_id]);
    res.status(200).json({addressList}); 
}

exports.insertAddress = async (req,res) =>{
    const insertAddress = helper.createInsertString('address',req.body.address);
    const [newAddress,_newAddress] = await db.execute(insertAddress.sql,insertAddress.value);
    res.status(200).json({message:'inserted'});
}
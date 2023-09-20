const db = require('../config/db');
const helper = require('../master/helper');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");


exports.createNewUser = async (req,res)=>{
    const [checkExistUser,_checkExistUser] = await db.execute('select * from users where username = ?',[req.body.users.username]);
    if(checkExistUser.length) return res.status(200).json({err : 'มี username นี้แล้ว'}); 
    await bcrypt.hash(req.body.users.password,10,async (err,hash)=>{
        if(err) return res.status(401).json({message:'Encoded Fail'});
        req.body.users.password = hash;
        const insertUser = helper.createInsertString('users',req.body.users);
        const [newUser,_user] = await db.execute(insertUser.sql,insertUser.value);
        const addressItem = {...req.body.address , user_id : newUser.insertId};
        const insertAddress = helper.createInsertString('address',addressItem);
        const [newAddress,_address] = await db.execute(insertAddress.sql,insertAddress.value);
        return res.status(200).json({id : newUser.insertId});
    })
    
}


exports.login = async (req,res) =>{

    const [user,_] = await db.execute('select * from users where username = ?',[req.query.username]);
    if(!user.length){
        return res.status(401).json({message:'Auth failed'});
    }
    bcrypt.compare(req.query.password,user[0].password , (err,result)=>{
        console.log(result);
        if(err){
            return res.status(401).json({message:'Auth failed'});
        }
        if(result){
            return res.status(200).json({user});
        }else{
            return res.status(401).json({message:'Auth failed'});
        }
    })
    
}


exports.getUserById = async (req,res) =>{
    const [user,_] = await db.execute('select * from users where id = ?',[req.query.id]);
    return res.status(200).json({user});
}

exports.getAll = async (req,res) =>{
    const search = req.query.search ? '%'+req.query.search+'%' : '%%';
    const orderBy = req.query.order_by ? req.query.order_by :  'created desc';
    const page = req.query.page ? req.query.page : 1;
    const item_number = req.query.itemShownNumber ? req.query.itemShownNumber : 20;
    const [userList,_userList] = await db.execute(`
        select  * 
        from    users
        where   username like ? or first_name like ? or last_name like ? 
        order by ${orderBy}
    `,[search,search,search]);
    res.status(200).json({
        userList
    });
}

exports.updateUser = async(req,res) => {
    const updateItem = helper.createUpdateString('users',req.body.data,req.body.condition);
    console.log(updateItem);
    await db.execute(updateItem.sql,updateItem.value);
    res.status(200).json({message:'updated already!!'});
}
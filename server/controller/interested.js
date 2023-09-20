const db = require('../config/db');
const helper = require('../master/helper');

exports.isInterested = async (req,res) => {
    const [interested,_interested] = await db.execute(`
        select *
        from interested
        where user_id = ? and book_id = ? and status = 'A'
    `,[req.query.user_id,req.query.book_id]);
    res.status(200).json({interested});
}

exports.interested = async (req,res) => {
    const [exist,_exist] = await db.execute(`
        select *
        from interested
        where user_id = ? and book_id = ?
    `,[req.body.user_id,req.body.book_id]);
    if(!exist.length){
        await db.execute(`insert into interested (book_id,status,user_id) values(${req.body.book_id},'A',${req.body.user_id})`)
    }else{
        const status = req.body.interest ? 'A' : 'I' ;
        await db.execute(`update interested set status = ? where user_id = ${req.body.user_id} and book_id = ${req.body.book_id}`,[status]);
    }
    res.status(200).json({message:'success!'});
}
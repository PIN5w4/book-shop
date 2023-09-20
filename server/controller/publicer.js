const db = require('../config/db');
const helper = require('../master/helper');

exports.navibar = async(req,res) =>{
    const [publicerList,_publicerList] = await db.execute("select * from publicer where dropdown = 'Y'");
    res.status(200).json({
        publicerList
    })
}

exports.getAll = async (req,res) =>{
    const search = req.query.search ? '%'+req.query.search+'%' : '%%';
    const orderBy = req.query.order_by ? req.query.order_by :  'created desc';
    const page = req.query.page ? req.query.page : 1;
    const item_number = req.query.itemShownNumber ? req.query.itemShownNumber : 20;
    const [publicerList,_publicerList] = await db.execute(`
        select  * 
        from    publicer
        where   publicer_name like ?
        order by ${orderBy}
    `,[search]);
    res.status(200).json({
        publicerList
    });
}

exports.getCode = async (req,res) =>{
    const [code,_code] = await db.execute(`
        select running
        from running
        where type = 'publicer' 
    `)
    res.status(200).json({code});
}

exports.insertPublicer = async(req,res) => {
    const insertItem = helper.createInsertString('publicer',req.body.data);
    await db.execute(insertItem.sql,insertItem.value);
    await db.execute("update running set running = ? where type ='publicer'",[parseInt(req.body.data.code)]);
    res.status(200).json({message:'inserted already!!'});
}

exports.updatePublicer = async(req,res) => {
    const updateItem = helper.createUpdateString('publicer',req.body.data,req.body.condition);
    await db.execute(updateItem.sql,updateItem.value);
    res.status(200).json({message:'updated already!!'});
}
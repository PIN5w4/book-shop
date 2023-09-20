const db = require('../config/db');
const helper = require('../master/helper');

exports.navibar = async(req,res) =>{
    const [categoryList,_categoryList] = await db.execute("select * from category where dropdown = 'Y'");
    res.status(200).json({
        categoryList
    });
}

exports.getAll = async (req,res) =>{
    const search = req.query.search ? '%'+req.query.search+'%' : '%%';
    const orderBy = req.query.order_by ? req.query.order_by :  'created desc';
    const page = req.query.page ? req.query.page : 1;
    const item_number = req.query.itemShownNumber ? req.query.itemShownNumber : 20; 
    let [categoryList,_categoryList] = await db.execute(`
        select  * 
        from    category
        where   category_name like ?
        order by ${orderBy}
    `,[search]);
    const size = categoryList.length; 
    categoryList = [...categoryList].filter((e,i)=> i >= (page-1)*item_number && i < page*item_number);
    res.status(200).json({
        categoryList
    });
}

exports.getCode = async (req,res) =>{
    const [code,_code] = await db.execute(`
        select running
        from running
        where type = 'category' 
    `)
    res.status(200).json({code});
}

exports.insertCategory = async(req,res) => {
    const insertItem = helper.createInsertString('category',req.body.data);
    await db.execute(insertItem.sql,insertItem.value);
    await db.execute("update running set running = ? where type ='category'",[parseInt(req.body.data.code)]);
    res.status(200).json({message:'inserted already!!'});
}

exports.updateCategory = async(req,res) => {
    const updateItem = helper.createUpdateString('category',req.body.data,req.body.condition);
    await db.execute(updateItem.sql,updateItem.value);
    res.status(200).json({message:'updated already!!'});
}
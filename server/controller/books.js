const db = require('../config/db');
const helper = require('../master/helper');

exports.home = async(req,res) =>{
    const [newItems,_newTems] = await db.execute('select * from books order by release_date desc limit 8');
    const [recommend,_recommend] = await db.execute("select * from books where recommend =  'Y' order by release_date desc limit 8");
    const [bestSeller,_recomend] = await db.execute(`
        select  b.* , sum(c.quantity)
        from    books b
        join    cart c on c.book_id = b.id
        join    purchase_order p on p.id = c.purchase_order_id
        where   p.delivery_date is not null and release_date > '2023-01-01'
        group by b.id
        order by sum(c.quantity)
        limit 8
    `);
    res.status(200).json({
        newItems,recommend,bestSeller
    });
}

exports.search = async (req,res) =>{
    const mode = req.query.mode;
    const key = req.query.key;
    let keyArr = [key];
    const page = req.query.page;
    const item_number = req.query.item_number;
    let sql = 'select b.* from books b ';
    if(mode === 'category' || mode === 'publicer'){
        sql += `where b.${mode}_code =? `;
    }else if(mode === 'recommend'){
        sql += `where b.recommend ='Y' `;
    }else if(mode === 'bestSeller'){
        sql += `join    cart c on c.book_id = b.id
                join    purchase_order p on p.id = c.purchase_order_id
                where   p.delivery_date is not null and release_date > '2023-01-01'
                group by b.id
                order by sum(c.quantity)`
    }else if(mode === 'search'){
        sql += `join    publicer p on b.publicer_code = p.code 
                where   b.title like ? or b.author like ? or p.publicer_name like ? `;
        keyArr = ['%'+key+'%','%'+key+'%','%'+key+'%'];
    }else if(mode === 'interest'){
        sql += `
                join    interested i on i.book_id = b.id
                where   i.user_id = ? and i.status = 'A'
        `;
    }
    sql += mode !== 'bestSeller' && mode !== 'interested' ? 'order by release_date desc ' : '';
    //sql += `limit ${(page-1)*item_number},${item_number}`
    let [dataList,_dataList] = await db.execute(sql,keyArr);
    const size = dataList.length;
    dataList = [...dataList].filter((e,i)=> i >= (page-1)*item_number && i < page*item_number);
    res.status(200).json({
        size,dataList
    });
}

exports.getBookById = async (req,res) =>{
    const [book,_book] = await db.execute(`
        select  b.* , c.category_name , p.publicer_name
        from    books b
        join    category c on c.code = b.category_code
        join    publicer p on p.code = b.publicer_code
        where   b.id = ?
    `,[req.query.id]);
    const [mayBeInterest,_mayBeInterest] = await db.execute(`
        select  b.* , sum(c.quantity)
        from    books b
        join    cart c on c.book_id = b.id
        join    purchase_order p on p.id = c.purchase_order_id
        where   p.delivery_date is not null and category_code = ?
        group by b.id
        order by sum(c.quantity)`,[book[0].category_code])
    
    res.status(200).json({
        book,mayBeInterest
    });
}

exports.getBooksTableList = async (req,res) =>{
    const page = req.query.page;
    const item_number = req.query.itemShownNumber;
    //console.log(req.query.order_by.split(' ')[0])
    let [booksTableList,_booksTableList] = await db.execute(`
        select b.* , c.category_name category
        from books b
        join category c on c.code = b.category_code
        where b.title like ?
        order by ${req.query.order_by}
    `,['%'+req.query.search+'%']);
    const size = booksTableList.length; 
    booksTableList = [...booksTableList].filter((e,i)=> i >= (page-1)*item_number && i < page*item_number);
    res.status(200).json({booksTableList : booksTableList , size : size});
}

exports.InsertBook = async (req,res) => {
    const insertItem = helper.createInsertString('books',req.body.book);
    await db.execute(insertItem.sql,insertItem.value);
    res.status(200).json({massage:'inserted!!'});
}

exports.updateBook = async (req,res) => {
    const updateItem = helper.createUpdateString('books',req.body.book,req.body.condition);
    await db.execute(updateItem.sql,updateItem.value);
    res.status(200).json({massage:'updated!!'});
}

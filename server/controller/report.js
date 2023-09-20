const db = require('../config/db');

exports.exportExcel = async (req,res) => {

    const [report,_report] = await db.execute(`
        select  p.delivery_date , p.reciept_number , concat(u.first_name,' ',u.last_name) as user_name ,
                u.birth_date , case when u.gender = 'M' then 'ชาย' else 'หญิง' end gender ,
                a.province , b.title , ct.category_name as category , pb.publicer_name as publicer ,
                cast(b.price as decimal(7,2)) as price , c.quantity , cast(b.price*c.quantity as decimal(7,2)) as total
        from    purchase_order p
        join    users u on u.id = p.user_id
        join    cart c on c.purchase_order_id = p.id
        join    books b on b.id = c.book_id
        join    address a on a.id = p.address_id
        join    publicer pb on pb.code = b.publicer_code
        join    category ct on ct.code = b.category_code
        where   delivery_date is not null and delivery_date >= ? and delivery_date <= ?
        order by p.delivery_date
    `,[req.query.form_date,req.query.to_date]);
    res.status(200).json({report});
}

const convertDateFormat = (date,timeAgo) =>{
    if(date.getMonth() === 1 && date.getDate() === 29){
        date.setDate(28);
    }
    let strDate = (date.getFullYear()-timeAgo)+'-';
    strDate += (date.getMonth() < 9 ? '0' : '')+(date.getMonth()+1)+'-';
    strDate += (date.getDate() < 10 ? '0' : '')+date.getDate();
    return strDate;
}

exports.byGender = async (req,res) => {
    const today = new Date();
    const ago20 = convertDateFormat(today,20);
    const ago40 = convertDateFormat(today,40);
    const ago60 = convertDateFormat(today,60);

    const [report,_report] = await db.execute(`
        select  u.gender ,  
                case when birth_date < ? then '60+' when birth_date < ? then '40-59' when birth_date < ? then '20-39' else '20-' end as age_group ,
                sum(b.price*c.quantity) as amount
        from    users u
        join    purchase_order p on u.id = p.user_id
        join    cart c on c.purchase_order_id = p.id
        join    books b on b.id = c.book_id
        where   delivery_date is not null and delivery_date >= ? and delivery_date <= ? 
        group by u.gender , age_group
    `,[ago60,ago40,ago20,req.query.form_date,req.query.to_date]);
    res.status(200).json({report});
}

exports.categoryRatio = async (req,res) => {
    
    const [report,_report] = await db.execute(`
        select  ct.category_name , sum(b.price*c.quantity) as amount
        from    purchase_order p
        join    cart c on c.purchase_order_id = p.id
        join    books b on b.id = c.book_id
        join    category ct on b.category_code = ct.code
        where   delivery_date is not null and delivery_date >= ? and delivery_date <= ?
        group by ct.category_name
        order by amount desc
    `,[req.query.form_date,req.query.to_date]);
    res.status(200).json({report});
}

exports.accumulateIncome = async (req,res) =>{
    const [report,_report] = await db.execute(`
        select  p.delivery_date , sum(b.price*c.quantity) as amount
        from    purchase_order p
        join    cart c on c.purchase_order_id = p.id
        join    books b on b.id = c.book_id
        where   p.delivery_date is not null and p.delivery_date >= ? and p.delivery_date <= ?
        group by p.delivery_date
        order by p.delivery_date
    `,[req.query.form_date,req.query.to_date]);
    res.status(200).json({report});
}
exports.createInsertString = (table,insertObj) =>{
    let columnStr = '';
    let valueStr = '';
    let valueArr = [];
    for(let key of Object.keys(insertObj)){
        columnStr += (columnStr.length ? ' , ' : '' ) + key;
        valueStr += valueStr.length ? ' , ?' : '?';
        valueArr.push(insertObj[key]);
    }
    return {sql : `insert into ${table} (${columnStr}) values(${valueStr})` , value : valueArr};
}

exports.createUpdateString = (table,updateObj,where) =>{
    let columnStr = '';
    let valueArr = [];
    for(let key of Object.keys(updateObj)){
        columnStr += (columnStr.length ? ' , ' : '' ) + key+' = ?';
        valueArr.push(updateObj[key]);
    }
    let whereStr = '';
    for(let key of Object.keys(where)){
        whereStr += 'and '+key+' = ? ';
        valueArr.push(where[key]); 
    }
    return {sql : `update ${table} set ${columnStr} where 1=1 ${whereStr}` , value : valueArr};
}
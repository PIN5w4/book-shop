import React from 'react';
import {backend_api} from '../master/ConstantData';

const BookItem = ({item}) =>{
    return (
        <div className="book-item App" style={{width:'180px',marginLeft:'auto',marginRight:'auto'}}>
            <img src={backend_api+'/public/files/books/'+item.pic} height="180px"/>
            <div style={{fontSize:'12px'}}>
                <div >{item.title}</div>
                <div>{item.author}</div>
                <div>{item.price.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
            </div>
        </div>
    )
}

export default BookItem;
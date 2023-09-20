import React,{useRef} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch,faPlus} from '@fortawesome/free-solid-svg-icons';

const SearchBox = ({onClickSeach,onClickNew,canNew = true}) =>{
    
    const searchBoxRef = useRef();
    const inpt = document.getElementById('search');

    return (
        <div style={{marginLeft:'15px',marginBottom:'20px'}}>
            <input type="text" id="search" onKeyPress={(e)=>{
                if(e.key==='Enter' && inpt.value.length > 0) onClickSeach(inpt.value);
            }} style={{paddingLeft:'5px' , borderRadius:'10px 0px 0px 10px', borderWidth:'2px' , width:'250px'}}/>
            <button style={{ borderWidth:'1px' , height : '30px' , width:'50px' , backgroundColor:'#999999' , color:'#ffffff' , borderRadius:'0px 10px 10px 0px'}} onClick={()=>onClickSeach(inpt.value)}><FontAwesomeIcon icon={faSearch} /></button>
            <button className={'btn btn-outline-secondary'+(canNew ? '' : ' d-none')} onClick={onClickNew} style={{marginLeft:'60px'}}><FontAwesomeIcon icon={faPlus} />&nbsp;เพิ่มรายการ</button>
        </div>
    )
}

export default SearchBox;
import React from 'react'
import {FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPhone} from '@fortawesome/free-solid-svg-icons';

const Footer = () =>{

    const footerStyle={
        color: 'white',
        backgroundColor:'#833c0c',
        margin: '0px',
        padding: '15px'
    };

    return(
        <div style={footerStyle}>
            <div>บริษัท บุคส์ช้อป จำกัด</div>
            <div>บ้านเลขที่ 123 ถนน หนังสือ ซอย นักเขียน3</div>
            <div>แขวงสวนหลวง เขตสวนหลวง</div>
            <div>กรุงเทพมหานคร 10250</div>
            <div><FontAwesomeIcon icon={faPhone} />&nbsp;&nbsp;081-234-5678</div>
        </div>
    )
}

export default Footer;
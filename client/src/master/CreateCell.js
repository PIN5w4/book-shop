import React,{useEffect,useState} from 'react';
import {FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from 'react-modal';

const CreateCell = ({data,setting,rowNumber,colNumber}) =>{
    
    const [parentStyle,setParentStyle] = useState({});
    const [openModal,setOpenModal] = useState(false);
    const [pic,setPic] = useState('');
    const modalImageStyle = {
        width:'600px',
        maxWidth:'90%',
        display:'block',
        marginLeft:'auto', 
        marginRight:'auto'
    }

    const onClickImage = (src) =>{
        setPic(src);
        setOpenModal(true);
    }

    useEffect(()=>{
        let pStyle = {};
        if(setting.parentStyle) pStyle = {...setting.parentStyle[colNumber]};
        if(rowNumber % 2 === 0 && setting.color && setting.color.odd) pStyle = {...setting.color.odd,...pStyle};
        if(rowNumber % 2 === 1 && setting.color && setting.color.even) pStyle = {...setting.color.even,...pStyle};
        if(setting.border) pStyle = {...setting.border,...pStyle};
        setParentStyle(pStyle);
    },[]);


    const createImageElement = (e) =>{
        return <div><img src={e.image} style={e.style} className={e.class+' img'} onClick={() => onClickImage(e.image)}/></div>
    }
    
    const createChcekboxElement = (e) =>{
        return (
            <div>
                <input type="checkbox" value={e.val} style={e.style} className={e.class ? "form-check-input "+e.class : "form-check-input"} />
                <label>{e.txt}</label>
            </div>
        )
    }
    
    const createButtonElement = (e) =>{
        return (
            e.icon ? <button style={e.style} value={e.val} className={e.class} onClick={e.onClick}><div style={{display:'flex',justifyContent:'center',alignItems: 'center'}}><FontAwesomeIcon icon={e.icon}/></div></button> :
            <button style={e.style} className={e.class} onClick={e.onClick}>{e.txt}</button>
        )
    }

    const createTextElement = (e) =>{
        return <label style={rowNumber < 0 ? {...e.style,fontWeight: 'bold'}: e.style} className={e.class}>{e.txt}</label>;
    }
    
    return (
        <div className={setting.responsive[colNumber]+(setting.hidden && setting.hidden.indexOf(colNumber) > -1 ? ' hidden' : '' ) } style={parentStyle}>
            {
                data.type === 'image' ? createImageElement (data) :
                    data.type === 'checkbox' ? createChcekboxElement(data) :
                        data.type === 'button' ? createButtonElement(data) :
                            data.type === 'text' || data.type === 'running' ? createTextElement(data) : ''
                
            }
            <Modal ariaHideApp={false} style={{content:{padding:'0px',width:'650px',maxWidth:'50%',border:'1px solid #444444'}}} isOpen={openModal} contentLabel="รูป">
                <div style={{borderBottom:'1px solid #444444',backgroundColor:'#f2c1c1' ,display: 'flex',justifyContent: 'center' , color:'#383838' , width:'100%',height:'50px',alignItems: 'center' ,textAlign:'center'}}><b>รูป</b></div>
                <div style={{padding:'15px'}}>
                {
                    pic ? <img style={modalImageStyle} src={pic} /> : ''
                    
                }
                </div>
                <div style={{textAlign:'center' , marginBottom:'20px'}}>
                    <button className="btn btn-outline-secondary" style={{width:'200px'}} onClick={() => setOpenModal(false)}>ปิด</button>
                </div>
            </Modal>
        </div>
    )
}

export default CreateCell;
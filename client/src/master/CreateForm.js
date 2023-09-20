import React,{useEffect,useState} from 'react';
import {removeWarningListener} from './form-operate';
import Modal from 'react-modal';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {backend_api} from './ConstantData';

const CreateForm = ({formOption,itemList}) =>{

    const [imageAttached,setImageAttached] = useState({});
    const [openModal,setOpenModal] = useState(false);
    const [picName,setPicName] = useState('');
    const modalImageStyle = {
        width:'600px',
        maxWidth:'90%',
        display:'block',
        marginLeft:'auto', 
        marginRight:'auto'
    }


    useEffect(()=>{
        removeWarningListener();
        for(let e of formOption.form){
            if(e.type === 'radio'){
                document.getElementsByName(e.name)[0].checked = true;
            }
        }
        if(formOption.setting.mode === 'edit') toSetEitForm();
        if(formOption.setting.mode === 'view') toSetViewForm();
    },[])

    const getImgURL = (url, callback) =>{
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            callback(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

    const toSetViewForm = () =>{
        const lbl = document.getElementsByClassName('data');
        for(let i = 0 ; i < lbl.length ; i++){
            if(itemList[lbl[i].getAttribute('table')] && itemList[lbl[i].getAttribute('table')][lbl[i].getAttribute('name')]){
                const value = itemList[lbl[i].getAttribute('table')][lbl[i].getAttribute('name')];
                const formObj = formOption.form.filter(e=>e.table === lbl[i].getAttribute('table') && e.name === lbl[i].getAttribute('name'))[0]; 
                const typ = formObj ? formObj.type : '';
                if(['text','text-area','number','date'].indexOf(typ) > -1){
                    if(formObj.displayFunction){
                        lbl[i].innerHTML = formObj.displayFunction(value);
                    }else{
                        lbl[i].innerHTML = value;
                    }
                }else if(['select','radio'].indexOf(typ) > -1){
                    const option = formObj.option;
                    lbl[i].innerHTML = option.filter(e=>e.value === value).length ? option.filter(e=>e.value === value)[0].label : '-';
                }else if(typ === 'image-file'){
                    lbl[i].innerHTML = value;
                    let imgAttached = {...imageAttached};
                    const path = formOption.form.find(e=>e.table === lbl[i].getAttribute('table') && e.name === lbl[i].getAttribute('name')).path
                    imgAttached[lbl[i].getAttribute('name')] = backend_api+path+value;
                    setImageAttached(imgAttached);
                }
            }
        }
        const cb = document.querySelectorAll('input[type="checkbox"]');
        for(let i = 0 ; i < cb.length ; i++){
            const tbl = cb[i].getAttribute('table');
            const nm = cb[i].getAttribute('name');
            if(tbl) cb[i].checked = itemList[tbl][nm] === 'Y';
        }
    }

    const toSetEitForm = () =>{
        const inpt = document.querySelectorAll('input,select,textarea');
        for(let i = 0 ; i < inpt.length ; i++){
            if(itemList[inpt[i].getAttribute('table')] && itemList[inpt[i].getAttribute('table')][inpt[i].getAttribute('name')]){
                const vl = itemList[inpt[i].getAttribute('table')][inpt[i].getAttribute('name')];
                if(['text','number','textarea'].indexOf(inpt[i].type) > -1){
                    inpt[i].value = vl;

                }else if(inpt[i].type === 'date'){
                    inpt[i].value = vl;
                    const dateArr = vl.split('-');
                    document.getElementsByName(inpt[i].getAttribute('name')+'-show')[0].value = dateArr[2]+'/'+dateArr[1]+'/'+dateArr[0];
                }else if(inpt[i].type === 'radio'){
                    inpt[i].checked = inpt[i].getAttribute('value') === vl;
                }else if(inpt[i].type === 'file'){
                    const path = formOption.form.find(e=>e.table === inpt[i].getAttribute('table') && e.name === inpt[i].getAttribute('name')).path
                    const url = backend_api+path+vl;
                    getImgURL(url, (imgBlob)=>{
                        let fileName = vl;
                        let file = new File([imgBlob], fileName,{type:"image/jpeg", lastModified:new Date().getTime()}, 'utf-8');
                        let container = new DataTransfer(); 
                        container.items.add(file);
                        inpt[i].files = container.files;
                        let imgAttached = {...imageAttached};
                        imgAttached[inpt[i].getAttribute('name')] = file;
                        setImageAttached(imgAttached);
                    })
                }else if(inpt[i].type === 'checkbox'){
                    inpt[i].checked = vl === 'Y';
                }else{ // ----- select element ------//
                    //console.log(formOption.form.filter(e=> e.name === inpt[i].name)[0].option);
                    if( formOption.form.filter(e=> e.name === inpt[i].name)[0].option.filter(e=>e.value === vl).length > 0){
                        inpt[i].value = vl;
                    }
                }
            }
            
        }
    }

    const onClickImage = (event) =>{
        setOpenModal(true);
        setPicName(event.target.getAttribute('name'));
    }

    const onFileSelected = (name,file) =>{
        //console.log(file);
        let imgAttached = {...imageAttached};
        imgAttached[name] = file;
        setImageAttached(imgAttached);
    }

    const createPrefixWarning = (type) =>{
        switch(type){
            case 'text' : 
                return 'กรุณากรอก';
            case 'number' : 
                return 'กรุณากรอก';
            case 'select' : 
                return 'กรุณาเลือก';
            case 'text-area':
                return 'กรุณากรอก';
                case 'date':
                    return 'กรุณากรอก';    
            default:
                return 'กรุณา';
        }
    }


    const createLabel = (e) =>{
        return (
            <div className={formOption.setting.responsive[0]}>
                <h5 className={e.class && e.class.indexOf('required') > -1 ? 'red-star' : ''}>{e.label}</h5>
            </div>
        )
    }

    const createWarning = (e) =>{
        return (
            <div className={formOption.setting.responsive[2]+' warning d-none'} name={e.name}>
                <label>{createPrefixWarning(e.type)+e.label}</label>
            </div>
        )
    }

    const createElementText = (e) =>{
        return(
            <div className={formOption.setting.responsive[1]} >
                <input type={e.type} name={e.name} maxLength={e.maxLength} ref={e.ref} table={e.table} disabled={e.disabled ? true : false} onChange={e.change ? e.change : undefined} onKeyPress={e.keyPress ? (event)=>e.keyPress(event) : undefined} className={e.class}/>
            </div>
        )
    }

    const createElementRadio = (e) =>{
        return (
            <div className={formOption.setting.responsive[1]} >
                {
                    e.option.map((opt,i)=>{
                        return (
                            <span key={i}>
                                <input type="radio" name={e.name} table={e.table} value={opt.value} style={{marginRight:'10px'}}/>
                                <label style={{marginRight:'10px'}}>{opt.label}</label>
                            </span>
                        );
                    })
                }
            </div>
        )
    }

    const createElementSelect = (e) =>{
        return (
            <div className={formOption.setting.responsive[1]} >
                <select className={e.class+" form-select"} name={e.name} ref={e.ref} table={e.table} onChange={e.change ? e.change : undefined}>
                    <option value="">กรุณาเลือก{e.label}</option>
                    {
                        e.option && e.option.length ?
                        e.option.map((opt,i)=>{
                            return <option value={opt.value} key={i}>{opt.label}</option>
                        }) : ''
                    }
                </select>
            </div>
        )
    }

    const createElementTextArea = (e) =>{
        return (
            <div className={formOption.setting.responsive[1]} >
                <textarea className={e.class+' form-control'} name={e.name} table={e.table} rows="4" cols="50"></textarea>
            </div>
        )
    }

    const createElementImageFile = (e) =>{
        return (
            <div className={formOption.setting.responsive[1]} >
                <input type="file" name={e.name} className={e.class} table={e.table} table={e.table} onChange={(event)=>{
                    e.change(event);
                    onFileSelected(e.name,event.target.files[0]);
                }}/>
                {imageAttached[e.name] ? <img onClick={(event) => onClickImage(event)} name={e.name} src={URL.createObjectURL(imageAttached[e.name])} style={{height:'100px',marginTop:'10px'}} className="img"/> : ''}
            </div>
        )
    }   

    const createElementLabel = (e) =>{
        return (
            <div className={formOption.setting.responsive[1]} >
                <label name={e.name} table={e.table} className="data"></label>
            </div>
        )
    }

    const createElementViewImage = (e) =>{
        return (
            <div className={formOption.setting.responsive[1]} >
                <label name={e.name} table={e.table} className="data"></label>
                {imageAttached[e.name] ? <div><img onClick={(event) => onClickImage(event)} name={e.name} src={imageAttached[e.name]} style={{height:'100px',marginTop:'10px'}} className="img"/></div> : ''}
            </div>
        )
    }

    const createElementDate = (e) =>{
        return (
            <div className={formOption.setting.responsive[1]} style={{position:'relative'}}>
                <input type="text"  name={e.name+'-show'} disabled style={{maxWidth:'110px',height:'30px',position:'absolute',top:'2px' , left:'15px' ,backgroundColor:'#ffffff', borderStyle:'none'}} />
                <input type="date" table={e.table} name={e.name} className={e.class} id={e.name} onChange={(event)=>{
                    const dateArr = event.target.value.split('-');
                    document.getElementsByName(event.target.getAttribute('name')+'-show')[0].value = dateArr[2]+'/'+dateArr[1]+'/'+dateArr[0];
                    document.getElementsByName(event.target.getAttribute('name')+'-show')[0].classList.remove("input-warning");
                }} style={{maxWidth:'150px',height:'35px'}} />
            </div>
        )

    }

    const createElementCheckbox = (e) =>{
        return (
            <div className={formOption.setting.responsive[1]} >
                <input type="checkbox" table={e.table} name={e.name} disabled={formOption.setting.mode === 'view'} className="form-check-input" style={{borderColor:'#888888',marginRight : '10px'}}/>
                <label type="form-check-label">{e.labelCheckbox}</label>
            </div>
        )
    }

    return(
        <div>
            {
                formOption.form.length ? 
                    formOption.form.map((e,i)=>{
                        return (
                            <div className="row mb-2" key={i}>
                                {createLabel(e)}
                                {   e.type === 'checkbox' ? createElementCheckbox(e) :
                                        formOption.setting.mode === 'view' && e.type === 'image-file' ? createElementViewImage(e) :
                                            formOption.setting.mode === 'view' && e.type !== 'image-file'? createElementLabel(e) :
                                                e.type === 'text' || e.type === 'number' || e.type === 'password' ? createElementText(e) : 
                                                    e.type === 'radio' ? createElementRadio(e) : 
                                                        e.type === 'select' ? createElementSelect(e) : 
                                                            e.type === 'text-area' ? createElementTextArea(e) : 
                                                                e.type === 'image-file' ? createElementImageFile(e) :
                                                                    e.type === 'date' ? createElementDate(e) :  ''}
                                {formOption.setting.mode !== 'view' && e.class && e.class.indexOf('required') > -1 ? createWarning(e) : ''}
                            </div>
                        )
                    })
                : ''
            }
            <Modal ariaHideApp={false} style={{content:{padding:'0px',width:'650px',maxWidth:'50%',border:'1px solid #444444'}}} isOpen={openModal} contentLabel="รูป">
                <div style={{borderBottom:'1px solid #444444',backgroundColor:'#f2c1c1' ,display: 'flex',justifyContent: 'center' , color:'#383838' , width:'100%',height:'50px',alignItems: 'center' ,textAlign:'center'}}><b>รูป</b></div>
                <div style={{padding:'15px'}}>
                {
                    !imageAttached[picName] ? '' :
                    formOption.setting.mode === 'view' ?
                    <img style={modalImageStyle} src={imageAttached[picName]} />
                    :
                    <img style={modalImageStyle} src={URL.createObjectURL(imageAttached[picName])} />
                }
                </div>
                <div style={{textAlign:'center' , marginBottom:'20px'}}>
                    <button className="btn btn-outline-secondary" style={{width:'200px'}} onClick={() => setOpenModal(false)}>ปิด</button>
                </div>
            </Modal>
        </div>
    )
}

export default CreateForm;
import React,{useState,useRef,useEffect} from 'react';
import Modal from 'react-modal';
import ReactToPdf from'react-to-pdf';
import CreateTable from '../master/CreateTable';
import {backend_api} from '../master/ConstantData';

const Reciept = ({userName,purchaseDate,dataList,setPrintReciept}) =>{

    const [openModal,setOpenModal] = useState(false);
    const [blankArr,setBlankArr] = useState([]);
    const [totalAmount,setTotalAmount] = useState(0);
    const [totalQuantity,setTotalQuantity] = useState(0);
    const [recieptNo,setRecieptNo] = useState(0);
    const printedRef = useRef();

    useEffect(()=>{
        const fetchItems = async () =>{
            try{
                let arr = [];
            for(let i = dataList.length ; i < 10 ; i++){
                arr.push(i);
            }
            const runningResponse = await fetch(backend_api+'/purchase_order/get_reciept_no');
            const running = await runningResponse.json();
            const nmbr = parseInt(running.recieptNo[0].running);
            const recieptNo = ((new Date()).getFullYear() - 2000) + '/' + (nmbr < 100 ? '0' : '' ) + (nmbr < 10 ? '0' : '' ) + (nmbr+1);
            setRecieptNo(recieptNo);
            setTotalAmount([...dataList].reduce((value,e)=>parseInt(e.amount)+value,0));
            setTotalQuantity([...dataList].reduce((value,e)=>parseInt(e.quantity)+value,0));
            setBlankArr(arr);
            }catch(err){
                console.log(err.stack);
            }
        }
        (async () => await fetchItems() )();
    },[])

    const tableOption = {
        setting : {
            header:['ลำดับ','ISBN','ชื่อหนังสือ','ราคา','จำนวน','รวม'],
            responsive:['col-1','col-2 col-lg-2','col-5','col-1','col-1 col-lg-1','col-2'],
            parentStyle:[{textAlign:'center'},{},{},{textAlign:'right'},{textAlign:'center'},{textAlign:'right'}],
            page:1,
            border:{border:'solid 1px #000000'}
        },
        dataRow : [
            {type:'running' , start:1 },
            {type:'text',column:'isbn'},
            {type:'text',column:'title'},
            {type:'text',displayFunction: (p)=> p['price'].toLocaleString('en-US', {minimumFractionDigits:2})},
            {type:'text',column:'quantity'},
            {type:'text',displayFunction: (p)=> p['amount'].toLocaleString('en-US', {minimumFractionDigits:2})}
        ]
    }

    return(
        <div style={{display:'inline-block' , marginLeft:'20px'}}>
            <button className="btn btn-outline-secondary" style={{width:'100px'}} onClick={()=> setOpenModal(true)}>พิมพ์ใบเสร็จ</button>
            <Modal ariaHideApp={false} style={{content:{padding:'0px',width:'900px',border:'1px solid #444444'}}} isOpen={openModal} contentLabel="ใบเสร็จ">
                <div style={{borderBottom:'1px solid #444444',backgroundColor:'#f2c1c1' ,display: 'flex',justifyContent: 'center' , color:'#383838' , width:'100%',height:'50px',alignItems: 'center' ,textAlign:'center'}}><b>ใบเสร็จ</b></div>
                <br/>
                <div ref={printedRef} style={{padding:'20px'}}>
                    <div style={{textAlign:'center'}}><h2>ใบเสร็จ</h2></div>
                    <br/>
                    <div className="row">
                        <div className="col-6">
                            <h5>ผู้ขาย</h5>
                            <div>บริษัท บุคส์ช้อป์ จำกัด</div>
                            <div>เบอร์โทร 081-234-5678</div>
                            <div>เวบไซต์ www.bookshop.com</div>
                            <div>Line @bookshop</div>
                        </div>
                        <div className="col-6">
                            <h5>ผู้ซื้อ</h5>
                            <div>คุณ{userName}</div>
                            <div>วันที่ {purchaseDate}</div>
                            <br/>
                            <div>หมายเลขใบเสร็จ : {recieptNo}</div>
                        </div>    
                    </div>
                    <br/>
                    <CreateTable tableOption={tableOption} dataList={dataList}/>
                    {
                        blankArr.length ?
                        blankArr.map((e,i)=>{
                            return (
                                <div className="row" key={i}>
                                    <div className={tableOption.setting.responsive[0]} style={{...tableOption.setting.border}}>&nbsp;</div>
                                    <div className={tableOption.setting.responsive[1]} style={{...tableOption.setting.border}}>&nbsp;</div>
                                    <div className={tableOption.setting.responsive[2]} style={{...tableOption.setting.border}}>&nbsp;</div>
                                    <div className={tableOption.setting.responsive[3]} style={{...tableOption.setting.border}}>&nbsp;</div>
                                    <div className={tableOption.setting.responsive[4]} style={{...tableOption.setting.border}}>&nbsp;</div>
                                    <div className={tableOption.setting.responsive[5]} style={{...tableOption.setting.border}}>&nbsp;</div>
                                </div>
                            )
                        })
                        : ''
                    }
                    <div className="row">
                        <div className={tableOption.setting.responsive[0]} style={{borderTop:'solid 1px #000000',borderLeft:'solid 1px #000000' , borderBottom: 'solid 1px #000000'}}>&nbsp;</div>
                        <div className={tableOption.setting.responsive[1]} style={{borderTop:'solid 1px #000000',borderBottom: 'solid 1px #000000'}}>&nbsp;</div>
                        <div className={tableOption.setting.responsive[2]} style={{borderTop:'solid 1px #000000',borderBottom: 'solid 1px #000000'}}>&nbsp;</div>
                        <div className={tableOption.setting.responsive[3]} style={{borderTop:'solid 1px #000000',borderRight:'solid 1px #000000' , borderBottom: 'solid 1px #000000'}}>&nbsp;</div>
                        <div className={tableOption.setting.responsive[4]} style={{...tableOption.setting.border , textAlign:'center'}}><b>{totalQuantity}</b></div>
                        <div className={tableOption.setting.responsive[5]} style={{...tableOption.setting.border , textAlign:'right'}}><b>{totalAmount.toLocaleString('en-US', {minimumFractionDigits:2})}</b></div>
                    </div>
                </div>
                <div style={{textAlign:'center' , marginTop:'20px',marginBottom:'20px'}}>
                        <ReactToPdf targetRef={printedRef} filename="div-blue.pdf" scale={0.9}>
                            {({toPdf}) => (
                                <button className="btn btn-outline-secondary" onClick={()=>{
                                    setPrintReciept(true);
                                    toPdf();
                                }}>พิมพ์ใบเสร็จ</button>
                            )}
                        </ReactToPdf>
                        <button className="btn btn-outline-secondary" style={{marginLeft:'20px'}} onClick={()=> setOpenModal(false)}>ออก</button>
                    </div>
            </Modal>
        </div>
    )
}

export default Reciept;
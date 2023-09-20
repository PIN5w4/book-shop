import React,{useState,useRef} from 'react';
import Modal from 'react-modal';
import ReactToPdf from'react-to-pdf';

const DeliverySheet = ({user_name,address,setPrintDeliverySheet}) =>{

    const [openModal,setOpenModal] = useState(false);
    const printedRef = useRef();
    const zipCodeBlockStyle = {
        display:'inline-block' ,
        height:'37px',
        width:'25px',
        border:'solid 1px #000000',
        marginRight:'3px',
    };
    const alighCenter ={
        display:'flex',
        textSize:'20px',
        justifyContent: 'center',
        alignItems: 'center',
        width:'100%',
        height:'100%',
        fontWeight:'bold'
    }

    return(
        <div style={{display:'inline-block'}}>
            <button className="btn btn-outline-secondary" style={{width:'100px'}} onClick={()=> setOpenModal(true)}>พิมพ์ใบส่งของ</button>
            <Modal ariaHideApp={false} style={{content:{padding:'0px',width:'900px',border:'1px solid #444444'}}} isOpen={openModal} contentLabel="ใบส่งของ">
                <div style={{borderBottom:'1px solid #444444',backgroundColor:'#f2c1c1' ,display: 'flex',justifyContent: 'center' , color:'#383838' , width:'100%',height:'50px',alignItems: 'center' ,textAlign:'center'}}><b>ใบส่งของ</b></div>
                <div style={{padding:'25px'}}>
                    <div ref={printedRef} style={{padding:'10px'}}>
                        <div style={{padding:'3px',border: 'solid 1px #000000',width:'820px' , height:'595px'}}>
                            <div style={{border: 'solid 4px #000000',width:'100%' , height:'100%'}}>
                                <div style={{marginLeft:'15px',marginTop:'15px' , position:'relative'}}>
                                    <h4>ผู้ส่ง</h4>
                                    <div>บริษัท บุคส์ช้อป จำกัด</div>
                                    <div>บ้านเลขที่ 123 ถนน หนังสือ ซอย นักเขียน3</div>
                                    <div>แขวงสวนหลวง เขตสวนหลวง</div>
                                    <div>กรุงเทพมหานคร</div>
                                    <div style={{marginTop:'5px'}}>
                                        <div style={zipCodeBlockStyle}><div style={alighCenter}>1</div></div>
                                        <div style={zipCodeBlockStyle}><div style={alighCenter}>0</div></div>
                                        <div style={zipCodeBlockStyle}><div style={alighCenter}>2</div></div>
                                        <div style={zipCodeBlockStyle}><div style={alighCenter}>5</div></div>
                                        <div style={zipCodeBlockStyle}><div style={alighCenter}>0</div></div>
                                    </div>
                                </div>
                                <div style={{height:'170px'}}></div>
                                <div style={{float:'right',marginRight:'15px'}}>
                                    <h4>ผู้รับ</h4>
                                    <div>คุณ{user_name}</div>
                                    {
                                        address.building ?
                                        <div>{address.building}</div> : ''
                                    }
                                    <div>{'บ้านเลขที่ '+address.house_no+' ถนน '+address.road
                                    +( address.alley ? ' ซอย '+ address.alley : '')+( address.village_no ? ' หมู่ที่ '+ address.alley : '')}</div>
                                    <div>{( address.province !== 'กรุงเทพมหานคร' ? 'ตำบล ' : 'แขวง') +  address.sub_district + ( address.province !== 'กรุงเทพมหานคร' ? ' อำเภอ ' : ' ')+ address.district}</div>
                                    <div>{' จังหวัด '+  address.province}</div>
                                    <div style={{marginTop:'5px'}}>
                                        <div style={zipCodeBlockStyle}><div style={alighCenter}>{address.zip_code.substring(0,1)}</div></div>
                                        <div style={zipCodeBlockStyle}><div style={alighCenter}>{address.zip_code.substring(1,2)}</div></div>
                                        <div style={zipCodeBlockStyle}><div style={alighCenter}>{address.zip_code.substring(2,3)}</div></div>
                                        <div style={zipCodeBlockStyle}><div style={alighCenter}>{address.zip_code.substring(3,4)}</div></div>
                                        <div style={zipCodeBlockStyle}><div style={alighCenter}>{address.zip_code.substring(4,5)}</div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{textAlign:'center'}}>
                        <ReactToPdf targetRef={printedRef} filename="div-blue.pdf" options={{orientation: 'landscape'}} scale={1.3}>
                            {({toPdf}) => (
                                <button className="btn btn-outline-secondary" onClick={()=> {
                                    setPrintDeliverySheet(true);
                                    toPdf()
                                }}>พิมพ์ใบส่งของ</button>
                            )}
                        </ReactToPdf>
                        <button className="btn btn-outline-secondary" style={{marginLeft:'20px'}} onClick={()=> setOpenModal(false)}>ออก</button>
                    </div>
                </div>
            </Modal>
        </div>
    )

}

export default DeliverySheet;
import React,{useState,useRef,useEffect} from 'react';
import CreateForm from '../master/CreateForm'
import {submitForm,keyPressNumber,onChangeZipCode,onDistrictChange} from '../master/form-operate';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import {backend_api} from '../master/ConstantData'
import emailjs from '@emailjs/browser';


const SignUp = () =>{

    const navigate = useNavigate();
    const usernameRef = useRef('');
    const birthDateRef = useRef();
    const provinceRef = useRef();
    const districtRef = useRef();
    const subDistrictRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();
    const [district,setDistrict] = useState([]);
    const [subDistrict,setSubDistrict] = useState([]);
    
    
    useEffect(()=>{
        const usr = JSON.parse(localStorage.getItem('user'));
        if(usr) navigate('/');
        document.getElementsByName('email')[0].addEventListener("change", checkEmailFomat);
    },[])

    const checkEmailFomat = (event) => {
        const email = event.target.value;
        const checkEmail = email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
        if(!checkEmail){
            Swal.fire({
                title: 'แจ้งเตือน',
                text: 'ข้อมูลอีเมลไม่ถูกต้อง'
            }).then(()=>{
                event.target.value = '';
            })
        }
    }

    const formOption = {
        form:[
            {type: 'text', label:'Username', name:'username' , table:'users' , ref:usernameRef , class:'required'},
            {type: 'password', label:'Password', name:'password' , table:'users' , ref:passwordRef ,class:'required'},
            {type: 'password', label:'Confirm Password', class:'required' , ref:confirmPasswordRef},
        ],
        setting:{
            responsive:['col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2'
            ,'col-12 col-sm-12 col-md-4 col-lg-4 col-xl-3','col-12 col-sm-12 col-md-6 col-lg-6 col-xl-7'],
            mode:'new'
        }
    }

    const formOption2 = {
        form:[
            {type: 'text', label:'ชื่อ', name:'first_name' , table:'users' , class:'required'},
            {type: 'text', label:'นามสกุล', name:'last_name' , table:'users',class:'required'},
            {type: 'radio', label:'เพศ',name:'gender' , option:[{value:'M',label:'ชาย'},{value:'F',label:'หญิง'}]},
            {type: 'date', label:'วันเกิด', name:'birth_date' , table:'users',class:'required'},
            {type: 'text', label:'e-Mail', name:'email'  , table:'users',class:'required'},
            {type: 'text', label:'อาคาร', name:'building' , table:'address'},
            {type: 'text', label:'บ้านเลขที่', name:'house_no' , table:'address',class:'required'},
            {type: 'text', label:'หมู่ที่', name:'village_no' , table:'address'},
            {type: 'text', label:'ถนน', name:'road' , table:'address',class:'required'},
            {type: 'text', label:'ซอย', name:'alley' , table:'address'},
            {type: 'text', label:'รหัสไปรษณีย์', name:'zip_code' , table:'address',class:'required' 
            ,maxLength : 5 ,keyPress: keyPressNumber , change: async(event) =>{
                const result = await onChangeZipCode(event,provinceRef.current);
                if(result.district) setDistrict(result.district);
            }},
            {type: 'text', label:'จังหวัด', name:'province' , ref:provinceRef , table:'address', disabled: true},
            {type: 'select', label:'อำเภอ/เขต', name:'district' , ref:districtRef , table:'address',class:'required' , option:district , change:(event)=>{
                const result = onDistrictChange(districtRef.current,district,subDistrictRef.current);
                setSubDistrict(result)} },
            {type: 'select', label:'ตำบล / แขวง', name:'sub_district' , option: subDistrict, ref:subDistrictRef , table:'address',class:'required'},
        ],
        setting:{
            responsive:['col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2'
            ,'col-12 col-sm-12 col-md-4 col-lg-4 col-xl-3','col-12 col-sm-12 col-md-6 col-lg-6 col-xl-7'],
            mode:'new'
        }
    }

    const onSubmitForm = async() =>{
        if(confirmPasswordRef.current.value !== passwordRef.current.value){
            return Swal.fire({
                title: 'แจ้งเตือน',
                text: 'รหัสไม่ตรงกัน'})
        }
        const data = submitForm();
        if(!data.message){
            data.users = {...data.users,user_group:'customer'};
            try{
                const optionObj = {
                    method: 'POST',
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
                const response = await fetch(backend_api+'/users/create_user',optionObj);
                const checkNewUser = await response.json(); 
                if(checkNewUser.err){
                    return Swal.fire({
                        title:'แจ้งเตือน',
                        text: checkNewUser.err
                    })
                }
                Swal.fire({
                    title:'แจ้งเตือน',
                    text:'สมัครสมาชิกสำเร็จแล้ว'
                }).then((result)=>{
                    navigate('/');
                })
            }catch(err){
                console.log(err);
            }
        }
    }


    return (
        <div style={{padding:'15px'}}>
            <h3 className="ps-2">สมัครสมาชิก</h3>
            <br/>
            <hr style={{width : '96%' , marginLeft : '2%'}}/>
            <CreateForm formOption={formOption}/>
            <br/>
            <hr style={{width : '96%' , marginLeft : '2%'}}/>
            <CreateForm formOption={formOption2}/>
            <div style={{marginTop:'20px',marginBottom:'20px'}}>
                <span style={{marginLeft:'50px',marginRight:'50px'}}><button className="btn btn-outline-secondary" onClick={async()=> await onSubmitForm()}>ตกลง</button></span>
                <span><button className="btn btn-outline-secondary" onClick={()=> navigate(-1)}>ยกเลิก</button></span>
            </div>
        </div>
    )
}

export default SignUp;
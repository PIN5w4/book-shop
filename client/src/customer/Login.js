import React,{useRef,useContext,useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import {AppContext} from '../App';
import {backend_api} from '../master/ConstantData';
import {toAuthoruize} from '../master/authorizePage';

const Login = () =>{

    const {setIsAdmin} = useContext(AppContext);
    const navigate = useNavigate();
    const usernameRef = useRef();
    const passwordRef = useRef();

    const containerStyle = {
        width:'370px',
        borderStyle:'solid',
        borderColor:'#888888',
        borderWidth:'1px',
        borderRadius:'10px',
        marginTop:'20px',
        marginBottom:'20px',
        padding:'15px'
    };

    useEffect(()=>{
        const usr = JSON.parse(localStorage.getItem('user'));
        if(usr) navigate('/');
    },[])

    const onLogin = () =>{
        const fetchItems = async () =>{
            try{
                const usr = usernameRef.current.value;
                const psswrd = passwordRef.current.value;
                const response = await fetch(backend_api+`/users/login?username=${usr}&password=${psswrd}`);
                return response.json();
            }catch(err){
                console.log(err.stack);
            }
        }
        (async () => await fetchItems() )().then((result)=>{
            console.log(result);
            if(result.user && result.user.length > 0){
                const obj = {
                    id:result.user[0].id,
                    username:usernameRef.current.value
                }
                localStorage.setItem("user", JSON.stringify(obj));
                setIsAdmin(result.user[0].user_group === 'admin')
                navigate('/');
            }else{
                Swal.fire({
                    title: 'แจ้งเตือน',
                    text: 'ไม่มีชื่อผู้ใช้หรือรหัสนี้'}).then(()=>{
                        usernameRef.current.value='';
                        passwordRef.current.value='';
                    })
            }
        });
        
    }

    return (
        <div style={{paddingLeft:'30px',paddingTop:'20px'}}>
            <h3>เข้าสู่ระบบ</h3>
            <div style={containerStyle}>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                ชื่อผู้ใช้งาน
                            </td>
                            <td>
                                <input ref={usernameRef} type="text" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                รหัส
                            </td>
                            <td style={{paddingTop:'10px'}}>
                                <input ref={passwordRef} type="password" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <hr/>
                <div style={{marginTop:'10px'}}>
                    <span><button className="btn btn-outline-secondary" onClick={onLogin} style={{marginRight:'10px'}}>ตกลง</button></span>
                    <span><a href="/" className="btn btn-outline-secondary" style={{marginRight:'10px'}}>ยกเลิก</a></span>
                    <span><a href="/sign_up" className="btn btn-outline-secondary" >สมัคร</a></span>
                </div>
            </div>
        </div>
    )
}

export default Login;
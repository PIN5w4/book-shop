const PROVINCE_API_URL = 'https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json';

const submitForm = () =>{
    if(validForm()){
        let obj = {};
        const inpt = document.querySelectorAll('input,select,textarea');
        for(let i = 0 ; i < inpt.length ; i++){
            if(!inpt[i].getAttribute('table')) continue;
            if(obj[inpt[i].getAttribute('table')] === undefined) obj[inpt[i].getAttribute('table')] ={};
            if(inpt[i].type === 'radio'){
                if(inpt[i].checked) obj[inpt[i].getAttribute('table')][inpt[i].name] = inpt[i].value;
            }else if(inpt[i].type === 'file'){
                let value = inpt[i].value
                if(value.indexOf(`C:\\fakepath\\`) > -1 ){
                    value = value.split(`C:\\fakepath\\`)[1];
                } 
                obj[inpt[i].getAttribute('table')][inpt[i].name] = value; 
            }else if(inpt[i].type === 'checkbox'){
                obj[inpt[i].getAttribute('table')][inpt[i].name] = inpt[i].checked ? 'Y' : 'N';
            }else if(!inpt[i].getAttribute('inputmode') && inpt[i].name){
                obj[inpt[i].getAttribute('table')][inpt[i].name] = inpt[i].value;
            }
        }
        return obj;
    }
    return {message:'incomplete fiiling form'};
}

const validForm = () =>{
    const rqrd = document.getElementsByClassName("required");
    const wrn = document.getElementsByClassName("warning");
    let result = true;
    let firstElement;
    for(let i = 0 ; i < rqrd.length ; i++){
        if(rqrd[i].name !== undefined && rqrd[i].value.trim().length === 0){
            rqrd[i].classList.add("input-warning");
            if(document.getElementsByName(rqrd[i].name+'-show').length) document.getElementsByName(rqrd[i].name+'-show')[0].classList.add("input-warning");
            if(wrn[rqrd[i].name] !== undefined){
                wrn[rqrd[i].name].classList.remove("d-none");
            }
            if(result) firstElement = rqrd[i];
            result = false;
        }
    }
    
    if(!result) firstElement.focus();
     
    return result;
}

const removeWarningListener = () =>{

    const inpt = document.getElementsByClassName('required');
    const wrn = document.getElementsByClassName('warning');

    for(let i = 0 ; i < inpt.length ; i++){
        inpt[i].addEventListener('change',()=>{
            inpt[i].classList.remove("input-warning");
            if(wrn[inpt[i].name]) wrn[inpt[i].name].classList.add("d-none");
        });
    }

}

const onChangeZipCode = async (event,provice) =>{
    const zipCode = event.target.value;  
    if(event.target.value.length === 5){
        const result = await getAddressByZipCode(zipCode);
        if(!result.message){
            provice.value = result.province;
            return result;
        }else{
            console.log('not found')
            return {};
        }
    }
    return {};
}

const keyPressNumber = (event) => {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
}

const getAddressByZipCode = async(zCode) =>{
    const response = await fetch(PROVINCE_API_URL);
    const addressArr = await response.json();
    const provinceCode = parseInt(zCode.substring(0,2));
    let i = 0;
    while(i < addressArr.length && provinceCode !== parseInt(addressArr[i].amphure[0].id/100)){
        i++
    }
    if(i === addressArr.length) return {message:'not found'};
    const provicnceName = addressArr[i].name_th;
    const amphure = addressArr[i].amphure;
    const _zCode = parseInt(zCode);
    let subDistrictArr = [];
    let districtArr = [];
    for(let j = 0 ; j < amphure.length ; j++){
        let cndt = true;
        subDistrictArr = [];
        for(let k = 0 ; k < amphure[j].tambon.length ; k++){
            if(_zCode === amphure[j].tambon[k].zip_code){
                if(cndt){
                    districtArr.push({value : amphure[j].name_th,label : amphure[j].name_th , subDistrict : []});
                    cndt = false;
                }
                districtArr[districtArr.length-1].subDistrict.push({value : amphure[j].tambon[k].name_th,label: amphure[j].tambon[k].name_th});
            }
        }

    }
    return districtArr.length > 0 ? {
            province : provicnceName,
            district : districtArr,
            subDistrict : subDistrictArr
        } : {message:'not found'};
}

const onDistrictChange = (districtRef,district,subDistrictRef) =>{
    subDistrictRef.value = '';
    const districtValue = districtRef.value;
    if(! districtValue) return []
    const subDistrictArr = [...district].filter(e=>e.value === districtValue)[0].subDistrict;
    return subDistrictArr;
}

const dateFormate = (d) => {
    const date = new Date(d).toLocaleString();
                const dateArr = date.split(',')[0].split('/');
                return (parseInt(dateArr[1]) < 10 ? '0' : '') + dateArr[1]+'/'+(parseInt(dateArr[0]) < 10 ? '0' : '')+dateArr[0]+'/'+dateArr[2];
}

export {submitForm,removeWarningListener,onChangeZipCode,onDistrictChange,keyPressNumber,dateFormate};
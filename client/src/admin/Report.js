import React,{useRef,useEffect,useState} from 'react';
import * as FileSaver from 'file-saver';
import XLSX from 'sheetjs-style';
import {Bar,Line,Pie} from 'react-chartjs-2';
import {Chart as Chartjs} from 'chart.js/auto';
import {backend_api} from '../master/ConstantData';
import {dateFormate} from '../master/form-operate';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import CreateTable,{sortTable} from '../master/CreateTable';
import PageNavigate from '../master/PageNavigate';
import { useNavigate } from "react-router-dom";
import {toAuthoruize} from '../master/authorizePage';

const Report = () =>{
    
    const filetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8';
    const fileExtension = '.xlsx';
    const [dataReport,setDataReport] = useState({});
    const [incomeData,setIncomeData] = useState([]);
    const [barData,setBarData] = useState({});
    const [formDate,setFormDate] = useState('');
    const [toDate,setToDate] = useState('');
    const [chartShow,setChartShow] = useState('');
    const [tableOption,setTableOption] = useState({});
    const [dataTable,setDataTable] = useState([]);
    const [orderBy,setOrderBy] = useState('created desc');
    const formDateRef = useRef();
    const toDateRef = useRef();
    const typeRef = useRef();
    const [page,setPage] = useState(1);
    const [dataSize,setDataSize] = useState(0);
    const itemShownNumber = 12;
    const navigate = useNavigate();
    const page_code = 'p_7';

    useEffect(()=>{
        toAuthoruize(backend_api,page_code,navigate);
    },[]);

    const barOption = {
        labels:['น้อยกว่า 20','20-39','40-59','มากกว่า 60'],
        datasets: [
            {
                label: "ชาย",
                data: dataReport.male,
                backgroundColor : '#6666ff'
            },
            {
                label: "หญิง",
                data: dataReport.female,
                backgroundColor : 'pink'
            }
        ]   
    }
    
    const pieOption = {
        labels: dataReport.label,
        datasets: [
            {
                label: "ยอดขาย",
                data: dataReport.value,
                backgroundColor : dataReport.backgroundColor
            }
        ]   
    }

    const lineOption = {
        labels: dataReport.label,
        datasets: [
            {
                label: "ยอดขาย",
                data: dataReport.value,
                pointRadius: 0
            }
        ]   
    }

    const chartOption = {
        plugins: {
            datalabels: {
               display: true,
               color: 'white'
            }
        }
    }

    const getPeriodKey = (dateValue,period) =>{
        const date = new Date(dateValue);
        if(period === 'daily'){
            return dateFormate(date);
        }else if(period === 'weekly'){
            const bg = date.setDate(date.getDate()-date.getDay());
            const ed = date.setDate(date.getDate()-date.getDay()+6);
            const beginning = new Date(bg);
            const endding = new Date(ed);
            return dateFormate(beginning)+' - '+ dateFormate(endding);
        }else if(period === 'monthly'){
            const bg = new Date(`${date.getFullYear()}-${(date.getMonth() < 9 ? '0' : '')+(date.getMonth()+1)}-01`);
            let ed;
            if([3,5,8,10].indexOf(date.getMonth()) > -1){
                ed = new Date(`${date.getFullYear()}-${(date.getMonth() < 9 ? '0' : '')+(date.getMonth()+1)}-30`);
            }else if(date.getMonth() === 1){
                let _date = new Date(`${date.getFullYear()}-03-01`);
                _date = _date.setDate(_date.getDate()-1);
                ed = new Date(`${date.getFullYear()}-02-${new Date(_date).getDate()}`);
            }else{
                ed = new Date(`${date.getFullYear()}-${(date.getMonth() < 9 ? '0' : '')+(date.getMonth()+1)}-31`);
            }
            const beginning = new Date(bg);
            const endding = new Date(ed);
            return (date.getMonth() < 9 ? '0' : '')+(date.getMonth()+1)+'/'+(date.getFullYear());
        }
    }

    const getIncomeData = (data) =>{
        const period = document.querySelector('input[name="period"]:checked') ? document.querySelector('input[name="period"]:checked').value : 'daily';
        let size = 1;
        let datePointer = new Date(formDate);
        let result = [{period:getPeriodKey(datePointer,period) , amount : 0 , accumulate : 0}];
        let keyPointer = getPeriodKey(datePointer,period);
        const endDate = new Date(toDate);
        let  i = 0;
        while(datePointer < endDate){
            if(i >= data.length || keyPointer !== getPeriodKey(data[i].delivery_date,period)){
                const acc = result[size-1].accumulate;
                size++;
                if(period === 'daily'){
                    datePointer.setDate(datePointer.getDate()+1);
                    datePointer = new Date(datePointer);
                }else if(period === 'weekly'){
                    datePointer.setDate(datePointer.getDate()-datePointer.getDay()+7);
                    datePointer = new Date(datePointer);
                }else{
                    const y = datePointer.getMonth() === 11 ? datePointer.getFullYear()+1 : datePointer.getFullYear();
                    const m =  datePointer.getMonth() === 11 ? '01' : datePointer.getMonth() < 8 ? '0'+(datePointer.getMonth()+2) : datePointer.getMonth()+2;
                    datePointer = new Date(`${y}-${m}-01`);
                    console.log(`${y}-${m}-01`);
                }
                keyPointer = getPeriodKey(datePointer,period);
                if(datePointer <= endDate) result.push({period:keyPointer , amount : 0 , accumulate : acc})
            }

            if(i < data.length && keyPointer === getPeriodKey(data[i].delivery_date,period)){
                result[size-1].amount += parseInt(data[i].amount);
                result[size-1].accumulate += parseInt(data[i].amount);
                i++;
            }
        }
        return result;

    }

    const removeSort = () =>{
        const element = document.querySelector('div[column="amount"]'); 
        if(!element) return;
        element.setAttribute('sort','');
        if(element.children[0]) element.children[0].classList.add("d-none");
    } 

    const incomeTableOption = {
        setting : {
            header:['ช่วงเวลา','ยอดขาย','ยอดขายสะสม'],
            responsive:[`col-${document.querySelector('input[name="period"]:checked') && document.querySelector('input[name="period"]:checked').value !== 'weekly' ? '2' : '3'}`,'col-3 col-lg-2','col-3 col-lg-2'],
            parentStyle:[{},{textAlign:'right'},{textAlign:'right'}],
            color:{header:{backgroundColor:'#512507',color:'#dddddd'},even:{backgroundColor:'#ddffdd'},odd:{backgroundColor:'#ffe5e5'}},
            border:{border: 'solid 1px #ffffff'},
            sort: async (event)=> {
                sortIncomeTable(event);
                await sortTable(event.target,setOrderBy);
            }
        },dataRow : [
            {type:'text',displayFunction : (r)=>r['period']},
            {type:'text', column:'amount' , displayFunction : (r) => r['amount'].toLocaleString('en-US', {minimumFractionDigits:2})},
            {type:'text',displayFunction : (r) => r['accumulate'].toLocaleString('en-US', {minimumFractionDigits:2})},
        ]    
    }


    const createTableGender = (data) =>{
        const tblOption = {
            setting : {
                header:['ช่วงอายุ','ชาย','หญิง','รวม'],
                responsive:['col-2','col-3 col-lg-2','col-3 col-lg-2','col-3 col-lg-2'],
                parentStyle:[{},{textAlign:'right'},{textAlign:'right'},{textAlign:'right'}],
                color:{header:{backgroundColor:'#512507',color:'#dddddd'},even:{backgroundColor:'#ddffdd'},odd:{backgroundColor:'#ffe5e5'}},
                border:{border: 'solid 1px #ffffff'},
                total:[1,2,3]
            },dataRow : [
                {type:'text',column:'ageGroup'},
                {type:'text',column:'male',displayFunction : (r) => r['male'].toLocaleString('en-US', {minimumFractionDigits:2})},
                {type:'text',column:'female',displayFunction : (r) => r['female'].toLocaleString('en-US', {minimumFractionDigits:2})},
                {type:'text',column:'total',displayFunction : (r) => r['total'].toLocaleString('en-US', {minimumFractionDigits:2})},
            ]
            
        }
        
        const _data = [{ageGroup : 'น้อยกว่า 20' , male : data.male[0] , female : data.female[0] , total : data.male[0]+data.female[0]}];
        _data.push({ageGroup : 'อายุ 20-39' , male : data.male[1] , female : data.female[1] , total : data.male[1]+data.female[1]});
        _data.push({ageGroup : 'อายุ 40-59' , male : data.male[2] , female : data.female[2] , total : data.male[2]+data.female[2]});
        _data.push({ageGroup : 'มากกว่า 60' , male : data.male[3] , female : data.female[3] , total : data.male[3]+data.female[3]});
        
        setTableOption(tblOption);
        setDataTable(_data);
        
    }

    const createTableCategory = (data) =>{
        const tblOption = {
            setting : {
                header:['หมวด','ยอดขาย','เปอร์เซ็นต์'],
                responsive:['col-2','col-3 col-lg-2','col-3 col-lg-2'],
                parentStyle:[{},{textAlign:'right'},{textAlign:'right'}],
                color:{header:{backgroundColor:'#512507',color:'#dddddd'},even:{backgroundColor:'#ddffdd'},odd:{backgroundColor:'#ffe5e5'}},
                border:{border: 'solid 1px #ffffff'},
                total:[1,2]
            },dataRow : [
                {type:'text',column:'category_name'},
                {type:'text',column:'amount',displayFunction : (r) => r['amount'].toLocaleString('en-US', {minimumFractionDigits:2})},
                {type:'text',column:'percentage',displayFunction : (r) => r['percentage'].toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2})+' %'},
            ]
        }
        const total = [...data].reduce((value,e)=>parseInt(e.amount)+value,0);
        for(let i = 0 ; i < data.length ; i++){
            data[i].amount = parseInt(data[i].amount);
            data[i] = {...data[i] , percentage : parseInt(data[i].amount)* 100 /total}
        }
        setTableOption(tblOption);
        setDataTable(data);
    }

    const onGenerateReport = async () => {
        if(typeRef.current.value === 'export_excel'){
            const reportResonse = await fetch(backend_api+`/report/export_excel?form_date=${formDate}&to_date=${toDate}`);
            const listItem = await reportResonse.json();
            const report = listItem.report;
            for(let i = 0 ; i < report.length ; i++){
                report[i].delivery_date =  dateFormate(report[i].delivery_date);
                report[i].birth_date =  dateFormate(report[i].birth_date);
                report[i].price = Number(report[i].price);
                report[i].total = Number(report[i].total);
            }
            exportExcel(report,'excel-data');  
        }else if(typeRef.current.value === 'gender'){
            const reportResonse = await fetch(backend_api+`/report/by_gender?form_date=${formDate}&to_date=${toDate}`);
            const listItem = await reportResonse.json();
            const ageGroup = ['20-','20-39','40-59','60+'];
            let male = [];
            let female = [];
            for(let gr of ageGroup){
                male.push(listItem.report.find(e=>e.gender === 'M' && e.age_group === gr) ? parseInt(listItem.report.find(e=>e.gender === 'M' && e.age_group === gr).amount) : 0);
                female.push(listItem.report.find(e=>e.gender === 'F' && e.age_group === gr) ? parseInt(listItem.report.find(e=>e.gender === 'F' && e.age_group === gr).amount) : 0);
            }
            const data = {male,female}
            createTableGender(data);
            setDataReport(data);
        }else if(typeRef.current.value === 'category'){
            const reportResonse = await fetch(backend_api+`/report/category_ratio?form_date=${formDate}&to_date=${toDate}`);
            const listItem = await reportResonse.json();
            const report = listItem.report;
            let label = [];
            let value = [];
            let backgroundColor = [];
            for(let r of report){
                label.push(r['category_name']);
                value.push(parseInt(r['amount']));
                backgroundColor.push(`rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`)
            }
            createTableCategory(report);
            setDataReport({label,value,backgroundColor});
        }else if(typeRef.current.value === 'income'){
            const reportResonse = await fetch(backend_api+`/report/accumulate_income?form_date=${formDate}&to_date=${toDate}`);
            const listItem = await reportResonse.json();
            const report = listItem.report;
            const _data = getIncomeData(report);
            setDataSize(_data.length);
            setIncomeData(report);
            //setIncomeTableOption();
            setDataTable(_data);
            const accumutlate = document.getElementsByName('accumulate').length ? document.getElementsByName('accumulate')[0].checked : true;
            setDataReport({label : _data.map(e=>e.period) , value : accumutlate ? _data.map(e=>e.accumulate) : _data.map(e=>e.amount)});
        }
        setChartShow(typeRef.current.value);
    }

    const exportExcel = async (excelData,fileName) => {
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = {Sheets:{'data':ws} ,SheetNames: ['data']};
        const excelBuffer = XLSX.write(wb,{booktype:'xlsx',type:'array'});
        const data = new Blob([excelBuffer],{type:filetype});
        FileSaver.saveAs(data,fileName+fileExtension);
    }

    const onChangePeriod = () =>{
        const accumutlate = document.getElementsByName('accumulate').length ? document.getElementsByName('accumulate')[0].checked : true;
        const _data = getIncomeData([...incomeData]);
        removeSort();
        setDataSize(_data.length);
        setDataTable(_data);
        setDataReport({label : _data.map(e=>e.period) , value : accumutlate ? _data.map(e=>e.accumulate) : _data.map(e=>e.amount)});
        setPage(1);
    }

    const sortIncomeTable = (event) =>{
        const column = event.target.getAttribute('column');
        const sort = event.target.getAttribute('sort');
        const _data = getIncomeData([...incomeData]);
        if(sort !== 'desc'){
            setDataTable(_data.sort((a,b)=>{
                return (a[column] - b[column]) * (sort ? -1 : 1)
            }));
        }else{
            
            setDataTable(_data);
        }
    }

    return (
        <div style={{marginLeft:'15px'}}>
            <div className="row">
                <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-4 mb-2">
                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-5 col-lg-4 col-xl-3">จากวันที่</div>
                        <div className="col-12 col-sm-12 col-md-7 col-lg-8 col-xl-9" style={{position:'relative'}}>
                            <input type="date" ref={formDateRef} name="form-date" style={{height:'35px',maxWidth:'150px'}} 
                                onChange={(event)=>{
                                    const date = event.target.value;
                                    if(!date) return;
                                    setFormDate(date);
                                    const dateArr = date.split('-');
                                    document.getElementsByName('form-date-show')[0].value = dateArr[2]+'/'+dateArr[1]+'/'+dateArr[0];
                                }} />
                            <input type="text" name="form-date-show" disabled style={{maxWidth:'110px',height:'30px',position:'absolute',top:'2px' , left:'15px' ,backgroundColor:'#ffffff', borderStyle:'none'}} />
                        </div>
                    </div>    
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3 mb-2">
                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-5 col-lg-4 col-xl-3">ถึงวันที่</div>
                        <div className="col-12 col-sm-12 col-md-7 col-lg-8 col-xl-9" style={{position:'relative'}}>
                        <input type="date" name="to-date" ref={toDateRef} style={{height:'35px',maxWidth:'150px'}} 
                                onChange={(event)=>{
                                    const date = event.target.value;
                                    if(!date) return;
                                    setToDate(date);
                                    const dateArr = date.split('-');
                                    document.getElementsByName('to-date-show')[0].value = dateArr[2]+'/'+dateArr[1]+'/'+dateArr[0];
                                }} />
                            <input type="text" name="to-date-show" disabled style={{maxWidth:'110px',height:'30px',position:'absolute',top:'2px' , left:'15px' ,backgroundColor:'#ffffff', borderStyle:'none'}} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-5 col-xl-5 3 mb-2">
                    <div className="row">
                    <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-3">เลือกรายงาน</div>
                        <div className="col-12 col-sm-12 col-md-7 col-lg-7 col-xl-8">
                            <select className="form-select" ref={typeRef} name="report-type">
                                <option value="">กรุณาเลือกรายงาน</option>
                                <option value="export_excel">ส่งออกข้อมูลขาย</option>
                                <option value="income">ยอดขายสะสม</option>
                                <option value="gender">ยอดขายแบ่งตามกลุ่มผู้ใช้งาน</option>
                                <option value="category">สัดส่วนยอดขายแบ่งตามหมวด</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <button className="btn btn-outline-secondary" onClick={ async () => await onGenerateReport()}>สร้างรายงาน</button>
            <br/>
            <hr style={{width:'80%',marginLeft:'10%'}}/>
            <br/>
            {
                chartShow === 'gender' ?
                    <div style={{width:'80%' , marginLeft:'10%'}}> <Bar  data={barOption}/></div> : 
                        chartShow === 'category' ? <div style={{width:'30%' , marginLeft:'40%'}}> <Pie  data={pieOption}  /></div> :
                            chartShow === 'income' ? <div style={{width:'70%' , marginLeft:'15%'}}> <Line  data={lineOption} options={{scales:{y:{beginAtZero: true}}}}  /></div> : '' 
            }
            {
                chartShow === 'income' ? 
                    <div style={{marginLeft:'10%' , marginTop:'20px'}}>
                        <div><input type="checkbox" name="accumulate" defaultChecked={true} onChange={onChangePeriod} className="form-check-input" style={{borderColor:'#888888'}} /><label>&nbsp;&nbsp;ข้อมูลสะสม</label></div>
                        <div className="d-none"><input type="checkbox" defaultChecked={true} onChange={onChangePeriod} className="form-check-input" style={{borderColor:'#888888'}} /><label>&nbsp;&nbsp;ข้อมูลสะสม</label></div>
                        <div>
                            <input type="radio" name="period" value="daily" defaultChecked={true} onChange={onChangePeriod}/>&nbsp;&nbsp;รายวัน
                            <input type="radio" name="period" style={{marginLeft:'15px'}} value="weekly" onChange={onChangePeriod}/>&nbsp;&nbsp;รายสัปดาห์
                            <input type="radio" name="period" style={{marginLeft:'15px'}} value="monthly" onChange={onChangePeriod}/>&nbsp;&nbsp;รายเดือน
                        </div>
                    </div>
                : ''
            }
            {
                chartShow.length && chartShow !== 'export_excel' ?
                    <div style={{marginLeft:'10%' , marginTop:'20px' , marginBottom:'20px'}}>
                        <CreateTable  tableOption={chartShow !== 'income' ? tableOption : incomeTableOption} dataList={[...dataTable].filter((e,i)=> i >= (page-1)*itemShownNumber && i < page*itemShownNumber)} />
                    </div>  : ''
            }
            {
                chartShow === 'income' ? <PageNavigate page={page} setPage={setPage} dataSize={dataSize} itemShownNumber={itemShownNumber}/> : ''
            }
        </div>
    )
}

export default Report;
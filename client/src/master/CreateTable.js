import React,{useEffect,useState,createElement} from 'react';
import CreateCell from './CreateCell';
import {FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSortUp,faSortDown} from '@fortawesome/free-solid-svg-icons';

let sortObj = {};

export const sortTable = async (e,setOrderBy) =>{
    const col = e.getAttribute('column');
    if(!col) return;

    if(!e.getAttribute('sort')){
        e.setAttribute('sort','asc');
        setOrderBy(col+' asc');
        sortObj = {sort:'asc',column: col};
    }else if(e.getAttribute('sort') === 'asc'){
        e.setAttribute('sort','desc');
        setOrderBy(col+' desc');
        sortObj = {sort:'desc',column: col};
    }else{
        e.setAttribute('sort','');
        setOrderBy('created desc');
        sortObj = {};
    }
}; 

const CreateTable = ({tableOption,dataList}) =>{

    const [total,setTotal] = useState({});
    const [headerStyle,setHeaderStyle] = useState({});

    useEffect(()=>{
        let result = {};
        if(tableOption.setting.total){
            for(let i = 0 ; i < tableOption.setting.total.length ; i++){
                const totalCol = tableOption.dataRow[tableOption.setting.total[i]].column;
                result[totalCol] = 0;
                let sum = 0;
                for(let j = 0 ; j < dataList.length ; j++){
                    sum += Number(dataList[j][totalCol]);
                }
                result[totalCol] = sum;
            }
            setTotal(result);
        }
        let hStyle = {textAlign:'center'};
        if(tableOption.setting.color && tableOption.setting.color.header) hStyle = {...hStyle,...tableOption.setting.color.header};
        if(tableOption.setting.border) hStyle = {...hStyle,...tableOption.setting.border};
        setHeaderStyle(hStyle);
    },[dataList])

    const generateRow = (row,n) =>{
        return(
            <div className={'row'+(tableOption.setting.lineSpace ? ' mb-2' : '')} key={n} >
                {
                    tableOption.dataRow.map((e,i)=>{
                        if(e.type === 'running'){
                            e.txt = (e.start-1)*tableOption.setting.page+n+1;
                        }else if(e.text){
                            e.txt = e.text;
                        }else if(e.displayFunction){
                            e.txt = e.displayFunction(row);
                        }else if(e.column){
                            e.txt = row[e.column];
                        }

                        if(e.click) e.onClick = async () => await e.click(row);
                        if(e.value) e.val = row[e.value];
                        if(e.src) e.image = e.src(row)//row[e.src];
                        return <CreateCell data={{...e}} setting={tableOption.setting} key={i} rowNumber={n} colNumber={i}/>;
                    })
                }
            </div>
        )
    }

    return(
        <div>
            
            <div className={'row'+(tableOption.setting.lineSpace ? ' mb-2' : '')}>
            {
                tableOption.setting.header.map((e,i)=>{
                    return (
                        <div className={tableOption.setting.responsive[i]+(tableOption.setting.hidden && tableOption.setting.hidden.indexOf(i) > -1 ? ' hidden' : '')} 
                            key={i} style={headerStyle} column={tableOption.dataRow[i].column} onClick={tableOption.setting.sort}>
                            {e}
                            {
                                tableOption.dataRow[i].column && sortObj && sortObj.column === tableOption.dataRow[i].column?
                                    <>&nbsp;&nbsp;{sortObj.sort === 'asc' ? <FontAwesomeIcon icon={faSortDown} />: <FontAwesomeIcon icon={faSortUp} />}</>
                                : ''
                            }
                        </div>
                    )
                })
            }
            </div>
            {
                dataList.length ? 
                dataList.map((e,i)=>{
                    //console.log(i);
                    return generateRow(e,i);
                }):<div style={{marginLeft:'30%'}}>ไม่มีข้อมูล</div>
            }
            {
                tableOption.setting.total ?
                <><div className={'row'+(tableOption.setting.lineSpace ? ' mb-2' : '')}>
                    {
                        tableOption.dataRow.map((e,i)=>{
                            let eTotal = {...e}
                            if(total[eTotal.column]){
                                if(eTotal.displayFunction){
                                    eTotal.txt = eTotal.displayFunction(total);
                                }else{
                                    eTotal.txt = total[eTotal.column];
                                }
                            }else{
                                eTotal.txt = '';
                            }
                            if(eTotal.type = 'button') eTotal.class = '';
                            eTotal.type = 'text'; 
                            return <CreateCell data={{...eTotal}} setting={tableOption.setting} key={i} rowNumber={-1} colNumber={i}/>;
                        })
                    }
                    </div>
                </> : ''
                
            }
        </div>
    )
}

export default CreateTable;
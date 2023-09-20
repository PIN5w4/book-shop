import React,{useState,useEffect} from 'react';

const PageNavigate = ({page,setPage,dataSize,itemShownNumber,setDataList,apiUrl}) =>{

    const [maxPage,setMaxPage] = useState(0);
    const [pageRange,setPageRange] = useState([]);

    useEffect(()=>{

        let arrPage = [];
        let i = 1;
        while(i < 6 && (i-1)*itemShownNumber < dataSize ){
            arrPage.push(i);
            i++;
        }
        setPageRange(arrPage);
        setMaxPage(parseInt((dataSize-1)/itemShownNumber)+1);
    },[dataSize])

    const changePage = async (n) =>{
        if(maxPage > 5){
            const i = n < 3 ? 1 : (n >  maxPage-2 ? maxPage-4 : n-2);
            setPageRange([i,i+1,i+2,i+3,i+4]);
        }
        setPage(n);
    }

    const pageIndex = (event) =>{
        const pg = parseInt(event.target.text); 
        changePage(pg);
    }

    const nxtPage = () =>{
        if(page === maxPage) return;
        changePage(page+1);
    }

    const prvPage = () =>{
        if(page === 1) return;
        changePage(page-1);
    }

    return (
        <div>
        {
            maxPage > 1 ?
                (
                    <div style={{justifyContent: 'center' , display:'flex' , marginTop:'20px'}}>
                        <nav aria-label="Page navigation example">
                            <ul className="pagination">
                                <li className="page-item"><a className="page-link" onClick={prvPage}>&laquo;</a></li>
                                {pageRange.map((e,i)=>{
                                    return (
                                        <li className="page-item" key={i}><a className={`page-link ${page === e? 'active' : ''}`} onClick={pageIndex}>{e}</a></li>
                                    )
                                })}
                                <li className="page-item"><a className="page-link" onClick={nxtPage}>&raquo;</a></li>
                            </ul>
                        </nav>
                    </div>
                )
            
            :
            ''
        }
        </div>
    )

}

export default PageNavigate;
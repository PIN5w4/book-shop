import React , {useEffect} from 'react'
import BookItem from './BookItem'

const BooksList = ({tagName,underLine,btn,lst}) =>{
    
    return (
        <div>
            {btn ?
                <div className="row" style={{width:'95%',marginTop:'20px'}} >
                    <div className="col-6 col-sm-6 col-md-6 col-lg-9 col-xl-9">
                        <h5 style={{marginLeft:'20px'}}>{tagName}</h5>
                    </div>
                    <div className="col-6 col-sm-6 col-md-6 col-lg-3 col-xl-3" style={{textAlign:'right'}}>
                        <a href={btn} className="btn btn-outline-secondary" style={{fontSize:'12px'}}>ดูทั้งหมด</a>
                    </div>
                </div>
            :
                <h5 style={{marginLeft:'20px'}}>{tagName}</h5>
            }
            <div className="row" style={{width:'100%'}}>
                {
                    lst ?
                    lst.map((e,i)=>{
                        return (
                            <div className="col-12 col-sm-6 col-md-6 col-lg-3 col-xl-3" style={{marginTop:'20px'}} key={i}>
                                <a href={'/book/'+e.id} style={{color:'#000000',textDecorationLine: 'none'}}><BookItem item={e} /></a>
                            </div>
                        )
                    }) 
                    : ''
                }
            </div>
            {underLine ? <hr style={{width:'80%',marginLeft:'10%'}} /> : ''}
        </div>
    )
}

export default BooksList;
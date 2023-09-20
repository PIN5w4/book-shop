import './App.css';
import './NavBar.css';
import MenuBar from './master/MenuBar';
import Home from './customer/Home';
import Footer from './master/Footer';
import SearchedResult from './customer/SearchedResult';
import BookDetail from './customer/BookDetail';
import Login from './customer/Login';
import SignUp from './customer/SignUp';
import Cart from './customer/Cart';
import BookStock from './admin/BookStock';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Payment from './customer/Payment';
import React, {useState,createContext} from 'react';
import BookForm from './admin/BookForm';
import PaymentList from './admin/PaymentList';
import DeliveryList from './admin/DeliveryList';
import Report from './admin/Report';
import UserSetting from './admin/UserSetting';
import CategorySetting from './admin/CategorySetting';
import PublicerSetting from './admin/PublicerSetting'; 

export const AppContext = createContext(null);

function App() {

  const [isAdmin,setIsAdmin] = useState(false);

  return (
    <div>
      <AppContext.Provider value={{isAdmin,setIsAdmin}}>
        <img src="http://localhost:3000/header.png" className='header' width="100%"/>
        <BrowserRouter>
          <MenuBar />
          <Routes>
            <Route path="/" exact={true} element={<Home />} />
            <Route path="/login"  element={<Login />} />
            <Route path="/sign_up"  element={<SignUp />} />
            <Route path="/cart"  element={<Cart />} />
            <Route path="/search/:mode/:key" element={<SearchedResult />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/payment"  element={<Payment />}  />
            <Route path="/book_stock" element={<BookStock />} />
            <Route path="/book_form/:mode/:id" element={<BookForm />} />
            <Route path="/payment_list" element={<PaymentList />} />
            <Route path="/delivery_list" element={<DeliveryList />} />
            <Route path="/report" element={<Report />} />
            <Route path="/setting/user" element={<UserSetting />} />
            <Route path="/setting/category" element={<CategorySetting />} />
            <Route path="/setting/publicer" element={<PublicerSetting />} />
          </Routes>
        </BrowserRouter>
        <Footer />
      </AppContext.Provider>
    </div>
  );
}

export default App;
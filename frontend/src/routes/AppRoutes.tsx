import {Login} from '../pages/Login';
import { SignUp } from '../pages/SingUp';
import RecoverPassword from '../pages/RecoverPassword';
import RedifinePassword from '../pages/RedifinePassword';
import Transactions from '../pages/Transactions';
import {Routes, Route} from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Category  from '../pages/Category';
import Wallets from '../pages/Wallets';
import Profile from '../pages/Profile';


const AppRoutes = () =>{
    return(<>
        <Routes>
            <Route path="/home" element={<Dashboard/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/recover-password" element={<RecoverPassword/>}/>
            <Route path="/redifine-password" element={<RedifinePassword/>}/>
            <Route path="/signup" element={<SignUp/>}/>
            <Route path="/transactions" element={<Transactions/>}/>
            <Route path="/category" element={<Category/>}/>
            <Route path="/wallets" element={<Wallets/>}/>
            <Route path="/profile" element={<Profile/>}></Route>
        </Routes>
    </>);
}


export default AppRoutes;







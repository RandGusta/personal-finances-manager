import {Login} from '../pages/Login';
import { SingUp } from '../pages/SingUp';
import RecoverPassword from '../pages/RecoverPassword';
import RedifinePassword from '../pages/RedifinePassword';
import Transactions from '../pages/Transactions';
import {Routes, Route} from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Category  from '../pages/Category';
import Wallets from '../pages/Wallets';


const AppRoutes = () =>{
    return(<>
        <Routes>
            <Route path="/home" element={<Dashboard/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/recover-password" element={<RecoverPassword/>}/>
            <Route path="/redifine-password" element={<RedifinePassword/>}/>
            <Route path="/singup" element={<SingUp/>}/>
            <Route path="/transactions" element={<Transactions/>}/>
            <Route path="/category" element={<Category/>}/>
            <Route path="/wallets" element={<Wallets/>}/>
        </Routes>
    </>);
}


export default AppRoutes;







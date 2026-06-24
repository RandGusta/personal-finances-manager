import {Login} from '../pages/Login';
import { SingUp } from '../pages/SingUp';
import RecoverPassword from '../pages/RecoverPassword';
import RedifinePassword from '../pages/RedifinePassword';
import Transactions from '../pages/Transactions';

import {Routes, Route} from 'react-router-dom';
import Dashboard from '../pages/Dashboard';



const AppRoutes = () =>{
    return(<>
        <Routes>
            <Route path="/home" element={<Dashboard/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/recover-password" element={<RecoverPassword/>}/>
            <Route path="/redifine-password" element={<RedifinePassword/>}/>
            <Route path="/singup" element={<SingUp/>}/>
            <Route path="/transactions" element={<Transactions/>}/>
        </Routes>
    </>);
}


export default AppRoutes;







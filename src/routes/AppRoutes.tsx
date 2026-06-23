import {Login} from '../pages/Login';
import { SingUp } from '../pages/SingUp';
import RecoverPassword from '../pages/RecoverPassword';
import RedifinePassword from '../pages/RedifinePassword';

import {Routes, Route} from 'react-router-dom';
import { Dashboard } from '@mui/icons-material';



const AppRoutes = () =>{
    return(<>
        <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/recover-password" element={<RecoverPassword/>}/>
            <Route path="/redifine-password" element={<RedifinePassword/>}/>
            <Route path="/singup" element={<SingUp/>}/>
        </Routes>
    </>);
}


export default AppRoutes;







import {Login} from '../pages/Login';
import { SignUp } from '../pages/SingUp';
import RecoverPassword from '../pages/RecoverPassword';
import RedifinePassword from '../pages/RedifinePassword';
import ResetPassword from '../pages/ResetPassword';
import Transactions from '../pages/Transactions';
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from '../pages/Dashboard';
import Category  from '../pages/Category';
import Wallets from '../pages/Wallets';
import Profile from '../pages/Profile';
import WalletInvitation from '../pages/WalletInvitation';
import RequireSession from "./RequireSession";


const AppRoutes = () =>{
    return(<>
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/recover-password" element={<RecoverPassword/>}/>
            <Route path="/reset-password/:token" element={<ResetPassword/>}/>
            <Route path="/signup" element={<SignUp/>}/>
            <Route path="/wallet-invitations/:token" element={<WalletInvitation/>}/>
            <Route element={<RequireSession />}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Dashboard/>}/>
                <Route path="/transactions" element={<Transactions/>}/>
                <Route path="/category" element={<Category/>}/>
                <Route path="/wallets" element={<Wallets/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/redifine-password" element={<RedifinePassword/>}/>
            </Route>
        </Routes>
    </>);
}


export default AppRoutes;







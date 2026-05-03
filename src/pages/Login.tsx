import {BaseButton} from "../components/Button"
import {BaseInputField} from "../components/Input"
import {BaseCheckBox} from "../components/Checkbox"
import { Typography, Link } from "@mui/material";
import { AutenticationLayout } from "../layouts/AutenticationLayout";
import { Box } from '@mui/material';




export function Login(){
    return(
    <AutenticationLayout
        right = {
            <>
    <Typography variant="h1" sx={{mb:1}}>
        Sing in
    </Typography>
    <Typography>
        Don't have an account?{' '}
        <Link href="">
            Create now
        </Link>
    </Typography>
    <BaseInputField
        label="E-mail"
        placeholder="exemple@gmail.com"
        type="text"
    />
    <BaseInputField
        label="Password"
        placeholder="@$76exemple"
        type="password"
    />
    <Box sx={{display:"flex", alignItems:"center", gap: "182px"}}>
    <Typography>
        <Link href="">
            Forgot Password?
        </Link>
    </Typography>
    <BaseCheckBox label="remember me"/>
    </Box>
    <BaseButton fullWidth variant="contained" loading={false} onClick={() => console.log("teste")}>    
        Sing in
    </BaseButton>
    </>
    }
    left = {
        <></>
    }
    />
    );
};

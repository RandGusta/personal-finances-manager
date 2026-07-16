import {Button, CircularProgress, type ButtonProps} from '@mui/material';

interface BaseButonProps extends ButtonProps{
    loading?: boolean;
}


export const BaseButton = ({children, loading, disabled,...props}: BaseButonProps) => {
    return(<Button {...props} disabled={loading || disabled}>
        {loading ? (<CircularProgress size={24} color="inherit"/>) : (children)}
    </Button>);
};
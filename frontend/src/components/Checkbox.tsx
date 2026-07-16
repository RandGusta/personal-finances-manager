import { Checkbox, FormControlLabel, type CheckboxProps } from "@mui/material";


interface BaseCheckBoxProps extends CheckboxProps{
    label?: string;
}

export function BaseCheckBox({label,...props}:BaseCheckBoxProps){
    return(
        <FormControlLabel control={<Checkbox {...props}/>}label={label}/>
    );
}
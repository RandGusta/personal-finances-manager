import {Box} from "@mui/material";

interface BaseFormProps{
    children?: React.ReactNode;
    onSubmit?: React.SubmitEventHandler<HTMLFormElement>;
}


export function BaseForm({onSubmit, children} : BaseFormProps){
    return(<>
    <Box component="form" onSubmit={onSubmit}>
        {children}
    </Box>
    </>);
}
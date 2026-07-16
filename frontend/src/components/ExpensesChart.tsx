import {Card, CardContent, Typography} from '@mui/material';

const ExpensesChart = () =>{
    return(<>
    <Card sx={{margin:{lg:"3rem", xs:"0rem" }, minWidth:{lg: "62rem", xs:"10rem"}, minHeight:"25.7rem"}}>
        <CardContent><Typography>grafico aqui</Typography></CardContent>
        <CardContent></CardContent>
        <CardContent></CardContent>
    </Card>
    </>);
}

export default ExpensesChart;
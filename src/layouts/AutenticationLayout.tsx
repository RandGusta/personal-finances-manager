import { Box } from '@mui/material';

export function AutenticationLayout({ right, left}: { right: React.ReactNode, left: React.ReactNode }) {
  return (
    <Box sx={{display:"flex", height:"100vh"}}>
        <Box sx={{flex:"1", justifyContent:"center", alignItems:"center"}}>
            <Box sx={{width:"100%",maxWidth:"700px", p:"120px"}}>
            {right}
            </Box>
        </Box >
        <Box sx={{flex:"1", bgcolor:"#1C4632"}}>
            {left}
        </Box>
    </Box>
  );
}
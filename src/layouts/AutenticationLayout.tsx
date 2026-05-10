import { Box } from '@mui/material';

export function AutenticationLayout({ right, left}: { right: React.ReactNode, left: React.ReactNode }) {
  return (
    <Box sx={{display:"flex", height:"100vh"}}>
        <Box sx={{display:"flex", flex:"1", justifyContent:"center", alignItems:"center", m:{xs:2}}}>
            <Box>
            {right}
            </Box>
        </Box >
        <Box sx={{flex:"1", justifyContent:"center", alignItems:"center", bgcolor:"#1C4632", display:{xs:'none', lg:'flex'}}}>
            <Box>
            {left}
            </Box>
        </Box>
    </Box>
  );
}
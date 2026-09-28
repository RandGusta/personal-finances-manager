import { Box } from '@mui/material';
import logo from "../assets/svg/favicon.svg";

export function AutenticationLayout({ left, right}: { right: React.ReactNode, left: React.ReactNode }) {
  return (
    <>
    <Box
        component="img"
        src={logo}
        sx={{
          position: "absolute",
          top: { xs: 16, sm: 32 },
          left: { xs: 16, sm: 23 },
          width: { xs: "2.5rem", sm: "3rem" },
        }}
      />
    <Box sx={{display:"flex", minHeight:"100dvh"}}>
        <Box
          sx={{
            display:"flex",
            flex:"1",
            justifyContent:"center",
            alignItems:"center",
            px: { xs: 2, sm: 3 },
            py: { xs: 9, sm: 4 },
          }}
        >
            <Box sx={{width: "100%", maxWidth: "28rem"}}>
            {left}
            </Box>
        </Box >
        <Box sx={{flex:"1", justifyContent:"center", alignItems:"center", bgcolor:"#0D330E", display:{xs:'none', lg:'flex'}}}>
            <Box>
            {right}
            </Box>
        </Box>
    </Box>
    </>
  );
}

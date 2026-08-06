import {Box} from "@mui/material";

interface ProfileLayoutProps {
    summary: React.ReactNode;
    wallets: React.ReactNode;
    members: React.ReactNode;
}

const ProfileLayout = ({summary, wallets, members}: ProfileLayoutProps)=>{
    return(
    <Box sx={{ p: 4 }}>
      {/* Resumo do usuário */}
      <Box sx={{ mb: 4 }}>
        {summary}
      </Box>

      {/* Wallets */}
      <Box sx={{ mb: 4 }}>
        {wallets}
      </Box>

      <Box>
        {members}
      </Box>
    </Box>
  );
}


export default ProfileLayout;

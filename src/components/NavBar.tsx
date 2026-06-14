import { AppBar, Toolbar,  Box} from "@mui/material";
import { BaseButton } from "./Button";

interface NavBarProps {
  children?: React.ReactNode;
}

const BaseNavBar = ({ children }: NavBarProps) => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
            <Box sx={{display: "flex", gap: 3}}>
          <BaseButton
            variant="contained"
            loading={false}
            onClick={() => console.log("teste")}
          >
            confirm
          </BaseButton>
          <BaseButton
            variant="contained"
            loading={false}
            onClick={() => console.log("teste")}
          >
            confirm
          </BaseButton>
          <BaseButton
            variant="contained"
            loading={false}
            onClick={() => console.log("teste")}
          >
            confirm
          </BaseButton>
          <BaseButton
            variant="contained"
            loading={false}
            onClick={() => console.log("teste")}
          >
            confirm
          </BaseButton>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default BaseNavBar;

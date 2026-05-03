import type { TextFieldProps } from "@mui/material";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type BaseInputFieldProps = TextFieldProps & {
  helperText?: string;
};

export function BaseInputField(props: BaseInputFieldProps) {
  const { type, ...rest } = props;

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <TextField
      {...rest}
      type={inputType}
      fullWidth
      variant="outlined"
      margin="normal"
      slotProps={
        isPassword
          ? {
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }
          : undefined
      }
    />
  );
}
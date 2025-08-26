// PersonalInfoForm.tsx
import * as React from "react";
import { TextField, InputAdornment, MenuItem } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { currencyData } from "../../../constant";

interface PersonalInfoFormProps {
  register: any;
  errors: any;
}

export default function PersonalInfoForm({
  register,
  errors,
}: PersonalInfoFormProps) {
  return (
    <>
      <TextField
        label="First Name"
        fullWidth
        margin="normal"
        variant="outlined"
        size="medium"
        {...register("first_name", {
          required: "First name is required",
        })}
        error={!!errors.first_name}
        helperText={errors.first_name?.message}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Last Name"
        fullWidth
        margin="normal"
        variant="outlined"
        size="medium"
        {...register("last_name", {
          required: "Last name is required",
        })}
        error={!!errors.last_name}
        helperText={errors.last_name?.message}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Phone Number"
        fullWidth
        margin="normal"
        variant="outlined"
        size="medium"
        type="tel"
        placeholder="0 123456789"
        {...register("phone", {
          required: "Phone number is required",
        })}
        error={!!errors.phone}
        helperText={errors.phone?.message}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PhoneIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Email Address"
        fullWidth
        margin="normal"
        variant="outlined"
        size="medium"
        type="email"
        placeholder="ex: test@test.com"
        {...register("email", {
          required: "Email is required",
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        select
        margin="dense"
        id="currency"
        label="Currency"
        fullWidth
        variant="outlined"
        defaultValue="EUR"
        sx={{ flex: 1 }}
        {...register("currency", {
          required: "Currency is required",
        })}
        error={!!errors.currency}
        helperText={errors.currency?.message}
      >
        {currencyData.map((currency) => (
          <MenuItem key={currency.code} value={currency.code}>
            {currency.name} ({currency.symbol})
          </MenuItem>
        ))}
      </TextField>

      
    </>
  );
}

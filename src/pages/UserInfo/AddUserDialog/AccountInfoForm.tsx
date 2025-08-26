// AccountInfoForm.tsx
import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  InputAdornment,
  FormHelperText,
  Stack,
  Button,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import SecurityIcon from "@mui/icons-material/Security";
import { Controller } from "react-hook-form";
import { Property } from "../../PropertyInfo/PropertyList";
import { FormValues } from "./types";

interface AccountInfoFormProps {
  properties: Property[];
  control: any;
  register: any;
  errors: any;
  watch: any;
}

export default function AccountInfoForm({
  properties,
  control,
  register,
  errors,
  watch,
}: AccountInfoFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <>
      <TextField
        label="Username"
        fullWidth
        margin="normal"
        variant="outlined"
        size="medium"
        {...register("username", {
          required: "Username is required",
        })}
        error={!!errors.username}
        helperText={errors.username?.message}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircleIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Password"
        fullWidth
        margin="normal"
        variant="outlined"
        size="medium"
        type={showPassword ? "text" : "password"}
        {...register("password", {
          required: "Password is required",
        })}
        error={!!errors.password}
        helperText={errors.password?.message}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <Button onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </Button>
          ),
        }}
      />
      <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
        <InputLabel id="role-label">Role</InputLabel>
        <Select
          labelId="role-label"
          label="Role"
          variant="outlined"
          size="medium"
          {...register("role", { required: "Role is required" })}
          error={!!errors.role}
          startAdornment={
            <InputAdornment position="start">
              <SecurityIcon fontSize="small" color="action" />
            </InputAdornment>
          }
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
          <MenuItem value="receptionist">Receptionist</MenuItem>
          <MenuItem value="cleaning">Cleaning Staff</MenuItem>
          <MenuItem value="technical">Technical Staff</MenuItem>
          <MenuItem value="guest">Guest</MenuItem>
        </Select>
        {errors.role && (
          <FormHelperText error>{errors.role.message}</FormHelperText>
        )}
      </FormControl>
      <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
        <InputLabel id="department-label">Department</InputLabel>
        <Select
          labelId="department-label"
          label="Department"
          variant="outlined"
          size="medium"
          {...register("department", {
            required: "Department is required",
          })}
          error={!!errors.department}
        >
          <MenuItem value="HK">HK</MenuItem>
          <MenuItem value="FO">FO</MenuItem>
          <MenuItem value="TECHNICAL">TECHNICAL</MenuItem>
          <MenuItem value="SALE">SALE</MenuItem>
          <MenuItem value="FINANCE">FINANCE</MenuItem>
          <MenuItem value="DG">DG</MenuItem>
          <MenuItem value="HR">HR</MenuItem>
        </Select>
        {errors.department && (
          <FormHelperText error>{errors.department.message}</FormHelperText>
        )}
      </FormControl>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="payType-label">Pay Type</InputLabel>
          <Select
            labelId="payType-label"
            label="Pay Type"
            variant="outlined"
            size="medium"
            {...register("payType", {
              required: "Pay Type is required",
            })}
            error={!!errors.payType}
          >
            <MenuItem value="hourly">Hourly</MenuItem>
            <MenuItem value="salaried">Salaried</MenuItem>
          </Select>
          {errors.payType && (
            <FormHelperText error>{errors.payType.message}</FormHelperText>
          )}
        </FormControl>

        <TextField
          label="Amount"
          type="number"
          fullWidth
          margin="normal"
          variant="outlined"
          size="medium"
          {...register("payRate", {
            required: "Amount is required",
          })}
          error={!!errors.payRate}
          helperText={errors.payRate?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {watch("currency") ? watch("currency") : "€"}
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <FormControl
        fullWidth
        margin="normal"
        error={!!errors.properties}
        sx={{ mb: 2 }}
      >
        <InputLabel id="property-label">Properties</InputLabel>
        <Controller<FormValues>
          control={control}
          name="properties"
          rules={{ required: "At least one property is required" }}
          render={({ field }) => (
            <Select
              {...field}
              multiple
              label="Properties"
              labelId="property-label"
              variant="outlined"
              size="medium"
              renderValue={(selected) =>
                Array.isArray(selected)
                  ? properties
                      .filter((p) => selected.includes(p.id.toString()))
                      .map((p) => p.name + " - " + p.address)
                      .join(", ")
                  : ""
              }
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              {properties.map((prop) => (
                <MenuItem key={prop.id} value={prop.id.toString()}>
                  <Checkbox
                    checked={
                      Array.isArray(field.value) &&
                      field.value.includes(prop.id.toString())
                    }
                    color="primary"
                  />
                  <ListItemText primary={prop.name + " - " + prop.address} />
                </MenuItem>
              ))}
            </Select>
          )}
        />
        {errors.properties && (
          <FormHelperText error>{errors.properties.message}</FormHelperText>
        )}
      </FormControl>

      {/* Other account info fields (Password, Role, Department, Properties, Pay Info) */}
      {/* ... */}
    </>
  );
}

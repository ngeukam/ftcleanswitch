// UserFormContent.tsx
import {
  DialogContent,
  Grid,
} from "@mui/material";
import { Property } from "../../PropertyInfo/PropertyList";
import PersonalInfoForm from "./PersonalInfoForm";
import AccountInfoForm from "./AccountInfoForm";

interface UserFormContentProps {
  properties: Property[];
  control: any;
  register: any;
  errors: any;
  watch: any;
}

export default function UserFormContent({
  properties,
  control,
  register,
  errors,
  watch,
}: UserFormContentProps) {
  return (
    <DialogContent dividers sx={{ py: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <PersonalInfoForm 
            register={register} 
            errors={errors} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <AccountInfoForm 
            properties={properties}
            control={control}
            register={register}
            errors={errors}
            watch={watch}
          />
        </Grid>
      </Grid>
    </DialogContent>
  );
}
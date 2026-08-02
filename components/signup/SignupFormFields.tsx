import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { SignupSchemaType } from "./SignupForm";

interface SignupFormFieldsProps {
  register: UseFormRegister<SignupSchemaType>;
  errors: FieldErrors<SignupSchemaType>;
  disabled: boolean;
}

/** Full name / email / password inputs for the signup form. */
export function SignupFormFields({ register, errors, disabled }: SignupFormFieldsProps) {
  return (
    <>
      <Input
        label="Full name"
        type="text"
        placeholder="e.g. Aly Maher"
        error={errors.fullName?.message}
        disabled={disabled}
        {...register("fullName")}
      />

      <Input
        label="Email address"
        type="email"
        placeholder="e.g. aly.maher@company.com"
        error={errors.email?.message}
        disabled={disabled}
        {...register("email")}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        disabled={disabled}
        {...register("password")}
      />
    </>
  );
}

export default SignupFormFields;

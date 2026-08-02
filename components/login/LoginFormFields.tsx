import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { LoginSchemaType } from "./LoginForm";

interface LoginFormFieldsProps {
  register: UseFormRegister<LoginSchemaType>;
  errors: FieldErrors<LoginSchemaType>;
  disabled: boolean;
}

/** Email / password inputs for the login form. */
export function LoginFormFields({ register, errors, disabled }: LoginFormFieldsProps) {
  return (
    <>
      <Input
        label="Email address"
        type="email"
        placeholder="e.g. name@company.com"
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

export default LoginFormFields;

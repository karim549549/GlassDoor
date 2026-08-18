import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { HANDLE_MAX } from "@/lib/user/handle";
import type { SignupSchemaType } from "./SignupForm";

interface SignupFormFieldsProps {
  register: UseFormRegister<SignupSchemaType>;
  errors: FieldErrors<SignupSchemaType>;
  disabled: boolean;
}

/** Full name / handle / email / password inputs for the signup form. */
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

      {/* Second, not last. It is prefilled from the name above as that is
          typed, so it reads as a consequence of what was just entered rather
          than another blank to fill - and it is the field most people will
          want to change, so it should not be buried under the password. */}
      <div>
        <Input
          label="Handle"
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={HANDLE_MAX}
          placeholder="alymaher"
          error={errors.handle?.message}
          disabled={disabled}
          {...register("handle")}
        />
        <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
          Your profile lives at devsarena.com/u/&lt;handle&gt;
        </p>
      </div>

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

import { redirect } from "next/navigation";
import { createClient } from "@/app/api/lib/supabase/server";

export default async function ProfileRedirectPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?redirectTo=/profile");
  }

  // Redirect to semantic user profile path
  redirect(`/user/${user.id}`);
}

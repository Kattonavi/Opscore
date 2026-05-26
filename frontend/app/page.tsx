import { redirect } from "next/navigation";

// Server Component - redirige a login
export default function Home() {
  redirect("/login");
}

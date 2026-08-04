import { getServerAuth } from "@/auth/services/serverAuth";
import { UserHydrationProvider } from "./provider";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const auth = await getServerAuth();


  return (
    <UserHydrationProvider auth={auth}>
      {children}
    </UserHydrationProvider>
  );
}
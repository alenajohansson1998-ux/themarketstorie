import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import AdminDashboard from "../../components/admin/AdminDashboard";
import UserDashboard from "../../components/user/UserDashboard";
import EditorDashboard from "../../components/editor/EditorDashboard";
import { authConfig } from "../../auth.config";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/api/auth/signin");
    return null;
  }

  const role = session.user?.role || "user";

  return (
    <DashboardLayout>
      {role === "admin" ? (
        <AdminDashboard />
      ) : role === "editor" ? (
        <EditorDashboard />
      ) : (
        <UserDashboard />
      )}
    </DashboardLayout>
  );
}

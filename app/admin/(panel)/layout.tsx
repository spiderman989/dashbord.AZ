import { AuthGuard } from "@/components/shared/AuthGuard";
import { PortalShell } from "@/components/shared/PortalShell";
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <AuthGuard admin><PortalShell admin>{children}</PortalShell></AuthGuard>; }

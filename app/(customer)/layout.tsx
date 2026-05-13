import { CustomerNavbar } from "@/app/(customer)/_components/customer-navbar";
import { CustomerFooter } from "@/app/(customer)/_components/customer-footer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CustomerNavbar />
      <main className="flex-1">{children}</main>
      <CustomerFooter />
    </div>
  );
}

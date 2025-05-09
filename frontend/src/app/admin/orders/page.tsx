import AdminSidebar from "@/components/AdminSidebar";

export default function ordersPage() {
  return (
    <AdminSidebar>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p>Manage your orders here.</p>
        {/* Add your order management components here */}
      </div>
    </AdminSidebar>
  );
}

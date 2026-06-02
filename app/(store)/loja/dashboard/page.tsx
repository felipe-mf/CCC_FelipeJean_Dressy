import Link from "next/link";
import { redirect } from "next/navigation";
import { TrendingUp, ShoppingBag, Package, Star } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { MetricCard } from "@/app/(store)/loja/dashboard/_components/metric-card";
import { StoreHeader } from "@/app/(store)/loja/dashboard/_components/store-header";
import { ProductsTable } from "@/app/(store)/loja/dashboard/_components/products-table";
import { OrdersList } from "@/app/(store)/loja/dashboard/_components/orders-list";
import type {
  Store,
  Product,
  StoreMetrics,
  OrderStatus,
  PaymentMethod,
  OrderRow,
} from "@/types";

interface OrderQueryRow {
  id: string;
  status: OrderStatus;
  total: number;
  payment_method: PaymentMethod;
  created_at: string;
  profiles: { name: string | null } | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle<Store>();

  if (!store) {
    return <EmptyStoreState />;
  }

  const [productsAllRes, productsRecentRes, ordersRes] = await Promise.all([
    supabase.from("products").select("id").eq("store_id", store.id),
    supabase
      .from("products")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select(
        `
        id,
        status,
        total,
        payment_method,
        created_at,
        profiles!orders_customer_id_fkey ( name )
      `,
      )
      .eq("store_id", store.id)
      .order("created_at", { ascending: false }),
  ]);

  const productIds = (productsAllRes.data ?? []).map((p) => p.id);
  const recentProducts = (productsRecentRes.data ?? []) as Product[];
  const totalProducts = productIds.length;

  const orders = (ordersRes.data ?? []) as unknown as OrderQueryRow[];

  let reviews: { rating: number }[] = [];
  if (productIds.length > 0) {
    const { data } = await supabase
      .from("reviews")
      .select("rating")
      .in("product_id", productIds);
    reviews = data ?? [];
  }

  const totalRevenue = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + Number(order.total), 0);

  const recentOrders: OrderRow[] = orders.slice(0, 5).map((order) => ({
    id: order.id,
    status: order.status,
    total: Number(order.total),
    payment_method: order.payment_method,
    created_at: order.created_at,
    customer_name: order.profiles?.name ?? null,
  }));

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const metrics: StoreMetrics = {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts,
    averageRating: avgRating,
    reviewCount: reviews.length,
  };

  return (
    <div className="flex flex-col gap-10">
      <StoreHeader store={store} />

      <div className="flex items-center gap-4">
        <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Visão Geral
        </span>
        <hr className="flex-1 border-border" />
        <span className="text-[11px] text-muted-foreground">
          {new Date().toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <section className="grid grid-cols-12 gap-4">
        <MetricCard
          className="col-span-12 md:col-span-5"
          label="Receita Total"
          value={metrics.totalRevenue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          icon={TrendingUp}
          eyebrow="Este mês"
        />
        <MetricCard
          className="col-span-6 md:col-span-3"
          label="Pedidos"
          value={String(metrics.totalOrders)}
          icon={ShoppingBag}
        />
        <MetricCard
          className="col-span-6 md:col-span-2"
          label="Produtos"
          value={String(metrics.totalProducts)}
          icon={Package}
        />
        <MetricCard
          className="col-span-12 md:col-span-2"
          label={`${metrics.reviewCount} avaliações`}
          value={
            metrics.averageRating > 0
              ? `★ ${metrics.averageRating.toFixed(1)}`
              : "—"
          }
          icon={Star}
        />
      </section>

      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-7">
          <ProductsTable products={recentProducts} />
        </div>
        <div className="col-span-12 md:col-span-5">
          <OrdersList orders={recentOrders} />
        </div>
      </section>
    </div>
  );
}

function EmptyStoreState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <span className="text-[11px] uppercase tracking-[0.32em] text-primary flex items-center gap-2">
        <span>✦</span>
        Bem-vindo ao painel
      </span>
      <h2
        className="font-heading tracking-[-0.03em] text-foreground"
        style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
      >
        Você ainda não tem <em className="italic">uma loja</em>.
      </h2>
      <p className="text-muted-foreground max-w-sm leading-relaxed">
        Crie sua loja para começar a listar produtos e receber pedidos na
        Dressy.
      </p>
      <Link
        href="/loja/criar"
        className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-4 font-heading text-lg hover:bg-[#A84E1F] transition-colors rounded-xl"
      >
        <span>Criar minha loja</span>
        <span>→</span>
      </Link>
    </div>
  );
}

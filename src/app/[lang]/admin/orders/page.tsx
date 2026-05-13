import { prisma } from "@/lib/prisma";
import { Locale } from "@/i18n/config";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ status?: string; id?: string }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const locale = lang as Locale;

  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      orderBy: { date: "desc" },
      include: { items: true },
      take: 200,
    });
  } catch (err) {
    console.warn("[admin/orders] DB read failed:", err);
  }

  return (
    <OrdersClient
      lang={locale}
      initialOrders={orders.map(o => ({
        ...o,
        date: o.date instanceof Date ? o.date.toISOString() : o.date,
      }))}
      initialFilter={sp.status || "all"}
      initialOpenId={sp.id}
    />
  );
}

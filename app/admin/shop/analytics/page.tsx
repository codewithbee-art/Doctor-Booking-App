"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStaffProfile } from "@/lib/useStaffProfile";
import AdminInactive from "@/components/AdminInactive";
import AdminPageHeader from "@/components/AdminPageHeader";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Summary {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  completedOrderValue: number;
  consultationOrders: number;
  pickupOrders: number;
  deliveryOrders: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface BestSelling {
  product_name: string;
  product_id: string | null;
  total_qty: number;
}

interface SlowMoving {
  id: string;
  name: string;
  category: string;
  stock_quantity: number;
}

interface CategoryPerf {
  category: string;
  total_qty: number;
  total_value: number;
}

interface TopCustomer {
  name: string;
  phone: string;
  orders: number;
  total: number;
}

interface SalesTrend {
  date: string;
  orders: number;
  value: number;
}

interface StockAlert {
  id: string;
  name: string;
  category: string;
  stock_quantity: number;
  stock_status?: string;
}

interface AnalyticsData {
  summary: Summary;
  bestSelling: BestSelling[];
  slowMoving: SlowMoving[];
  categoryPerformance: CategoryPerf[];
  topCustomers: TopCustomer[];
  salesTrend: SalesTrend[];
  lowStockProducts: StockAlert[];
  outOfStockProducts: StockAlert[];
}

type DateRange = "today" | "week" | "month" | "year" | "all";

const RANGE_LABELS: Record<DateRange, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
  all: "All Time",
};

/* ------------------------------------------------------------------ */
/*  Helper: Simple bar chart (CSS-only)                                */
/* ------------------------------------------------------------------ */

function BarChart({ data, labelKey, valueKey, maxItems = 8 }: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  maxItems?: number;
}) {
  const items = data.slice(0, maxItems);
  if (items.length === 0) return <p className="font-body text-sm text-text-secondary">No data yet.</p>;
  const max = Math.max(...items.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const pct = Math.round((val / max) * 100);
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="font-body text-xs text-text-primary w-32 truncate" title={String(item[labelKey])}>
              {String(item[labelKey])}
            </span>
            <div className="flex-1 h-5 bg-bg-light rounded overflow-hidden">
              <div
                className="h-full bg-primary/70 rounded transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-body text-xs font-semibold text-text-primary w-12 text-right">{val}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminShopAnalyticsPage() {
  const router = useRouter();
  const { loading: staffLoading, noSession, inactive } = useStaffProfile();
  const [checking, setChecking] = useState(true);

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<DateRange>("month");

  /* ---- Auth ---- */
  useEffect(() => {
    if (staffLoading) return;
    if (noSession) { router.replace("/admin/login"); return; }
    setChecking(false);
  }, [staffLoading, noSession, router]);

  /* ---- Fetch analytics ---- */
  const fetchAnalytics = useCallback(async (r: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/shop/analytics?range=${r}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!checking && !inactive) fetchAnalytics(range);
  }, [checking, inactive, range, fetchAnalytics]);

  /* ---- Render ---- */
  if (staffLoading || checking) {
    return <main className="min-h-screen bg-bg-light flex items-center justify-center"><p className="font-body text-sm text-text-secondary">Loading...</p></main>;
  }
  if (inactive) return <AdminInactive />;

  const s = data?.summary;

  return (
    <>
      <AdminPageHeader title="Shop Analytics" description="Sales performance, stock insights, and customer trends." />

      <div className="mx-auto max-w-7xl">

        {/* Shop admin tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          <a href="/admin/shop" className="px-4 py-2.5 font-body text-sm font-semibold text-text-secondary hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary/30">Products</a>
          <a href="/admin/orders" className="px-4 py-2.5 font-body text-sm font-semibold text-text-secondary hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary/30">Orders</a>
          <span className="px-4 py-2.5 font-body text-sm font-semibold text-primary border-b-2 border-primary">Analytics</span>
        </div>

        {/* Date range filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(RANGE_LABELS) as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
                range === r
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-text-primary hover:bg-bg-light"
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Loading / Error */}
        {loading && <p className="font-body text-sm text-text-secondary">Loading analytics...</p>}
        {error && <p className="font-body text-sm text-red-600">{error}</p>}

        {!loading && !error && data && s && (
          <div className="space-y-8">
            {/* ========== Summary Cards ========== */}
            <section>
              <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <SummaryCard label="Total Orders" value={s.totalOrders} />
                <SummaryCard label="Pending" value={s.pendingOrders} color="amber" />
                <SummaryCard label="In Progress" value={s.confirmedOrders} color="blue" />
                <SummaryCard label="Completed" value={s.completedOrders} color="green" />
                <SummaryCard label="Cancelled" value={s.cancelledOrders} color="red" />
                <SummaryCard label="Completed Order Value" value={`NPR ${s.completedOrderValue.toLocaleString()}`} color="green" subtitle="Based on completed orders" />
                <SummaryCard label="Consultation Orders" value={s.consultationOrders} color="purple" />
                <SummaryCard label="Low Stock Products" value={s.lowStockCount} color="amber" />
                <SummaryCard label="Out of Stock" value={s.outOfStockCount} color="red" />
              </div>
            </section>

            {/* ========== Pickup vs Delivery ========== */}
            <section>
              <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Fulfillment Breakdown</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-white p-4">
                  <p className="font-body text-xs text-text-secondary uppercase tracking-wide">Collect from Shop</p>
                  <p className="font-heading text-2xl font-bold text-text-primary mt-1">{s.pickupOrders}</p>
                </div>
                <div className="rounded-xl border border-border bg-white p-4">
                  <p className="font-body text-xs text-text-secondary uppercase tracking-wide">Home Delivery</p>
                  <p className="font-heading text-2xl font-bold text-text-primary mt-1">{s.deliveryOrders}</p>
                </div>
              </div>
            </section>

            {/* ========== Completed Order Value by Day ========== */}
            <section>
              <h2 className="font-heading text-lg font-bold text-text-primary mb-1">Completed Order Value by Day</h2>
              <p className="font-body text-xs text-text-secondary mb-4">This chart shows the total value of completed orders for each day in the selected period.</p>
              {data.salesTrend.length === 0 ? (
                <EmptyState message="No completed orders in this range." />
              ) : (
                <>
                  {/* Horizontal bar chart */}
                  <div className="rounded-xl border border-border bg-white p-4 space-y-2">
                    {data.salesTrend.map((d) => {
                      const maxVal = Math.max(...data.salesTrend.map((t) => t.value), 1);
                      const pct = Math.max(Math.round((d.value / maxVal) * 100), 2);
                      const dateLabel = new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
                      return (
                        <div key={d.date} className="flex items-center gap-3">
                          <span className="font-body text-xs text-text-secondary w-16 shrink-0 text-right">{dateLabel}</span>
                          <div className="flex-1 h-7 bg-bg-light rounded overflow-hidden relative">
                            <div
                              className="h-full bg-primary/70 rounded transition-all flex items-center"
                              style={{ width: `${pct}%` }}
                              title={`${dateLabel}: NPR ${d.value.toLocaleString()} (${d.orders} order${d.orders !== 1 ? "s" : ""})`}
                            >
                              {pct > 30 && (
                                <span className="font-body text-[10px] text-white font-semibold pl-2 whitespace-nowrap">
                                  NPR {d.value.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {pct <= 30 && (
                              <span className="absolute left-[calc(var(--bar-w)+8px)] top-1/2 -translate-y-1/2 font-body text-[10px] text-text-primary font-semibold whitespace-nowrap" style={{ "--bar-w": `${pct}%` } as React.CSSProperties}>
                                NPR {d.value.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <span className="font-body text-[10px] text-text-secondary w-14 shrink-0">{d.orders} order{d.orders !== 1 ? "s" : ""}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Data table */}
                  <div className="rounded-xl border border-border bg-white mt-4 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-bg-light">
                        <tr>
                          <th className="px-4 py-2 font-body text-xs font-semibold text-text-secondary">Date</th>
                          <th className="px-4 py-2 font-body text-xs font-semibold text-text-secondary text-center">Completed Orders</th>
                          <th className="px-4 py-2 font-body text-xs font-semibold text-text-secondary text-right">Completed Order Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {data.salesTrend.map((d) => (
                          <tr key={d.date}>
                            <td className="px-4 py-2 font-body text-sm text-text-primary">
                              {new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-4 py-2 font-body text-sm text-text-primary text-center">{d.orders}</td>
                            <td className="px-4 py-2 font-body text-sm font-semibold text-primary text-right">NPR {d.value.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            {/* ========== Best Selling Products ========== */}
            <section>
              <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Best-Selling Products <span className="font-body text-xs text-text-secondary font-normal">(by quantity sold)</span></h2>
              <div className="rounded-xl border border-border bg-white p-4">
                <BarChart data={data.bestSelling as unknown as Record<string, unknown>[]} labelKey="product_name" valueKey="total_qty" />
              </div>
            </section>

            {/* ========== Category Performance ========== */}
            <section>
              <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Category Performance <span className="font-body text-xs text-text-secondary font-normal">(by revenue)</span></h2>
              <div className="rounded-xl border border-border bg-white p-4">
                {data.categoryPerformance.length === 0 ? (
                  <EmptyState message="No category data yet." />
                ) : (
                  <div className="space-y-2">
                    {data.categoryPerformance.map((c) => (
                      <div key={c.category} className="flex items-center justify-between gap-4 py-1 border-b border-border last:border-0">
                        <span className="font-body text-sm text-text-primary font-semibold">{c.category}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-body text-xs text-text-secondary">{c.total_qty} units</span>
                          <span className="font-body text-sm font-bold text-primary">NPR {c.total_value.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ========== Slow-Moving Products ========== */}
            <section>
              <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Slow-Moving Products <span className="font-body text-xs text-text-secondary font-normal">(active, no/low sales in range)</span></h2>
              <div className="rounded-xl border border-border bg-white p-4">
                {data.slowMoving.length === 0 ? (
                  <EmptyState message="All active products have sales." />
                ) : (
                  <div className="divide-y divide-border">
                    {data.slowMoving.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-body text-sm text-text-primary font-semibold">{p.name}</p>
                          <p className="font-body text-xs text-text-secondary">{p.category}</p>
                        </div>
                        <span className="font-body text-xs text-text-secondary">Stock: {p.stock_quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ========== Stock Alerts ========== */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Low Stock */}
              <div>
                <h2 className="font-heading text-lg font-bold text-text-primary mb-4">
                  Low Stock Alerts <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-semibold ml-2">{data.lowStockProducts.length}</span>
                </h2>
                <div className="rounded-xl border border-border bg-white p-4">
                  {data.lowStockProducts.length === 0 ? (
                    <EmptyState message="No low-stock products." />
                  ) : (
                    <div className="divide-y divide-border">
                      {data.lowStockProducts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-body text-sm text-text-primary font-semibold">{p.name}</p>
                            <p className="font-body text-xs text-text-secondary">{p.category}</p>
                          </div>
                          <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-bold">{p.stock_quantity} left</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Out of Stock */}
              <div>
                <h2 className="font-heading text-lg font-bold text-text-primary mb-4">
                  Out of Stock <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-semibold ml-2">{data.outOfStockProducts.length}</span>
                </h2>
                <div className="rounded-xl border border-border bg-white p-4">
                  {data.outOfStockProducts.length === 0 ? (
                    <EmptyState message="All products are in stock." />
                  ) : (
                    <div className="divide-y divide-border">
                      {data.outOfStockProducts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-body text-sm text-text-primary font-semibold">{p.name}</p>
                            <p className="font-body text-xs text-text-secondary">{p.category}</p>
                          </div>
                          <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-bold">Out of stock</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ========== Top Customers ========== */}
            <section>
              <h2 className="font-heading text-lg font-bold text-text-primary mb-4">Top Customers <span className="font-body text-xs text-text-secondary font-normal">(by order count)</span></h2>
              <div className="rounded-xl border border-border bg-white p-4">
                {data.topCustomers.length === 0 ? (
                  <EmptyState message="No customer data yet." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-3 py-2 font-body text-xs font-semibold text-text-secondary">Customer</th>
                          <th className="px-3 py-2 font-body text-xs font-semibold text-text-secondary">Phone</th>
                          <th className="px-3 py-2 font-body text-xs font-semibold text-text-secondary text-center">Orders</th>
                          <th className="px-3 py-2 font-body text-xs font-semibold text-text-secondary text-right">Total Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {data.topCustomers.map((c, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 font-body text-sm text-text-primary font-semibold">{c.name}</td>
                            <td className="px-3 py-2 font-body text-sm text-text-secondary">{c.phone}</td>
                            <td className="px-3 py-2 font-body text-sm text-text-primary text-center">{c.orders}</td>
                            <td className="px-3 py-2 font-body text-sm font-semibold text-primary text-right">NPR {c.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* View Orders link */}
            <div className="text-center pt-4">
              <a href="/admin/orders" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                View All Orders
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SummaryCard({ label, value, color, subtitle }: { label: string; value: string | number; color?: string; subtitle?: string }) {
  const colorClasses: Record<string, string> = {
    amber: "border-amber-200 bg-amber-50",
    green: "border-green-200 bg-green-50",
    red: "border-red-200 bg-red-50",
    blue: "border-blue-200 bg-blue-50",
    purple: "border-purple-200 bg-purple-50",
  };
  const cls = color ? colorClasses[color] || "border-border bg-white" : "border-border bg-white";

  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <p className="font-body text-xs text-text-secondary uppercase tracking-wide">{label}</p>
      <p className="font-heading text-xl font-bold text-text-primary mt-1">{value}</p>
      {subtitle && <p className="font-body text-[10px] text-text-secondary mt-0.5">{subtitle}</p>}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="font-body text-sm text-text-secondary py-4 text-center">{message}</p>;
}

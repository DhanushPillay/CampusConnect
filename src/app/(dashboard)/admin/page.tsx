import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion";
import { getAdminStats } from "@/lib/actions/admin";
import { formatINR } from "@/lib/utils";
import { Users, School, BookOpen, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const s = await getAdminStats();
  const stats = [
    { label: "Users", value: String(s.users), hint: "Admin, teacher, student", icon: Users },
    { label: "Classes", value: String(s.classes), hint: "Across departments", icon: School },
    { label: "Subjects", value: String(s.subjects), hint: "With teachers assigned", icon: BookOpen },
    { label: "Pending fees", value: formatINR(s.pendingFees), hint: "Unpaid invoices", icon: Wallet },
  ];
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">Admin overview</h1>
        <p className="mt-1 text-sm text-sub">MIT-ADT single campus · today</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.06}>
            <Card>
              <CardContent className="flex items-start gap-3">
                <span className="rounded-lg bg-brand-50 p-2 text-brand-700">
                  <stat.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-display text-2xl font-extrabold text-ink">
                    {stat.value}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-ink">{stat.label}</span>
                  <span className="block text-xs text-sub">{stat.hint}</span>
                </span>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

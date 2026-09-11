import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/table";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion";
import { ClipboardCheck } from "lucide-react";
import { getStudentAttendance } from "@/lib/actions/student";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentAttendance() {
  const session = await getSession();
  const { records, perSubject } = await getStudentAttendance(session!.user.id);
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">My attendance</h1>
        <p className="mt-1 text-sm text-sub">Below 75% is flagged</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {perSubject.map((s, i) => (
          <Reveal key={s.code} delay={i * 0.05}>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{s.name}</CardTitle>
                  <CardDescription>{s.code}</CardDescription>
                </div>
                {s.pct < 75 ? (
                  <Badge variant="warning">Below 75%</Badge>
                ) : (
                  <Badge variant="success">{s.pct}%</Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-brand-600" />
                  <p className="font-display text-2xl font-extrabold text-ink">{s.pct}%</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${s.pct}%` }} />
                </div>
                <p className="mt-2 text-sm text-sub">
                  {s.present}/{s.total} present
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.15}>
        <Card className="mt-4">
          <CardHeader>
            <div>
              <CardTitle>Recent records</CardTitle>
              <CardDescription>Latest attendance entries</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Subject</Th>
                  <Th>Status</Th>
                </Tr>
              </THead>
              <TBody>
                {records.slice(0, 25).map((r) => (
                  <Tr key={r.id}>
                    <Td className="text-sm text-sub">{formatDate(r.date)}</Td>
                    <Td className="text-sm font-medium">{r.subject.name}</Td>
                    <Td>
                      <StatusBadge status={r.status} />
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}

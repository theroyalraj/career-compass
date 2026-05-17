import Link from "next/link";
import { prisma } from "@/lib/db";
import { ManualIntegrationBanner } from "@/components/layout/ManualIntegrationBanner";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function NetworkPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network"
        description="Warmth, touches, and follow-ups — your CRM for referrals and coffee chats."
      />
      <ManualIntegrationBanner title="No LinkedIn import or sync">
        <p>
          Contacts are fully manual. Save each person&apos;s public profile URL on their detail
          page — the app does not read your LinkedIn connections or messages.
        </p>
      </ManualIntegrationBanner>
      <div className="glass-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Warmth</TableHead>
              <TableHead>Last touch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link href={`/network/${c.id}`} className="font-medium hover:text-primary">
                    {c.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.company}</TableCell>
                <TableCell>
                  {c.type && <Badge variant="outline">{c.type}</Badge>}
                </TableCell>
                <TableCell>{c.warmth}/5</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.lastTouch
                    ? formatDistanceToNow(c.lastTouch, { addSuffix: true })
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Button, Card, SectionTitle } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl">
      <SectionTitle title="404 – Page Not Found" subtitle="The page you’re looking for doesn’t exist." />
      <Card className="p-4">
        <Link href="/">
          <Button>Back to browse</Button>
        </Link>
      </Card>
    </div>
  );
}

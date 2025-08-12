import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PpiPage() {
  return (
    <>
      <PageHeader
        title="PPI Management"
        description="Create, update, and manage all student PPIs."
      />
      <Card>
        <CardHeader>
          <CardTitle>PPI List</CardTitle>
          <CardDescription>
            This section will display a list of all PPIs. The full PPI editor will be available at `/ppi/[id]`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>PPI list implementation is pending.</p>
        </CardContent>
      </Card>
    </>
  );
}

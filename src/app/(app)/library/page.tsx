import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';

export default function LibraryPage() {
  return (
    <>
      <PageHeader
        title="Library Management"
        description="Centralize reusable elements for quick insertion into PPIs."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add to Library
        </Button>
      </PageHeader>
      <Tabs defaultValue="needs">
        <TabsList>
          <TabsTrigger value="needs">Needs</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="adaptations">Means & Adaptations</TabsTrigger>
          <TabsTrigger value="indicators">Indicators</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="needs">
            <Card>
              <CardHeader>
                <CardTitle>Needs</CardTitle>
                <CardDescription>Reusable needs for students.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>List of needs will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="objectives">
            <Card>
              <CardHeader>
                <CardTitle>Objectives</CardTitle>
                <CardDescription>
                  Common objectives that can be assigned to students.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>List of objectives will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}

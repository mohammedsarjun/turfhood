import Link from 'next/link';
import { Banknote, CalendarClock, LayoutDashboard, Layers, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Heading, Text } from '@/components/ui';

const BENEFITS = [
  {
    icon: Users,
    title: 'Open sessions',
    description: 'Let players join shared sessions on your courts, filling otherwise idle slots.',
  },
  {
    icon: CalendarClock,
    title: 'Easy booking management',
    description: 'See every booking across your turfs and courts from one place.',
  },
  {
    icon: Banknote,
    title: 'Flexible pricing',
    description: 'Set weekday/weekend rates and special-date pricing for peak demand.',
  },
  {
    icon: Layers,
    title: 'Multiple turfs & courts',
    description: 'One owner account can manage as many turfs and courts as you run.',
  },
  {
    icon: LayoutDashboard,
    title: 'A dedicated portal per turf',
    description: 'Track availability, ratings, and earnings for each turf you own.',
  },
];

const REQUIRED_DOCUMENTS = [
  'A government-issued ID or ownership deed for the property',
  'A lease agreement (if you lease rather than own the property)',
  'A recent electricity bill for the property address',
];

export function TurfOwnerInfoPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="mx-auto max-w-3xl text-center" style={{ padding: '56px 24px 48px' }}>
          <Heading variant="display" style={{ marginBottom: 12 }}>
            Become a Turf Owner
          </Heading>
          <Text style={{ marginBottom: 28 }}>
            List your turf on Turfhood and reach players actively looking to book. Here&apos;s what
            you get, and what we&apos;ll need to verify your ownership.
          </Text>
          <Link
            href="/become-a-turf-owner/apply"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-3xl" style={{ padding: 24 }}>
        <Heading variant="h2" style={{ marginBottom: 16 }}>
          Why list with Turfhood
        </Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" style={{ marginBottom: 32 }}>
          {BENEFITS.map((benefit) => (
            <Card key={benefit.title}>
              <CardHeader>
                <benefit.icon className="h-5 w-5 text-primary" />
                <CardTitle>{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Text>{benefit.description}</Text>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card style={{ marginBottom: 32 }}>
          <CardHeader>
            <CardTitle>Required documents & verification</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={{ marginBottom: 12 }}>
              You&apos;ll need to upload at least one of the following so we can verify you own or
              operate the turf:
            </Text>
            <ul className="list-disc" style={{ paddingLeft: 20 }}>
              {REQUIRED_DOCUMENTS.map((doc) => (
                <li key={doc}>
                  <Text as="span">{doc}</Text>
                </li>
              ))}
            </ul>
            <Text style={{ marginTop: 12 }}>
              After you submit, an admin reviews your application and documents. Your account is
              upgraded to a turf owner only once your application is approved — this usually takes a
              few business days.
            </Text>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

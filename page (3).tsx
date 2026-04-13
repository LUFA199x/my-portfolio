import type { Metadata } from 'next';
import ContactCTA from '@/components/client/ContactCTA';

export const metadata: Metadata = {
  title: 'Contact',
  description: "Ready to shoot something real? Let's connect.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24">
      <ContactCTA />
    </div>
  );
}

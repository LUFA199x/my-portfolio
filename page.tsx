import type { Metadata } from 'next';
import Hero from '@/components/client/Hero';
import About from '@/components/client/About';
import WorkGrid from '@/components/client/WorkGrid';
import ServicesSection from '@/components/client/ServicesSection';
import ContactCTA from '@/components/client/ContactCTA';
import { getFeaturedProjects } from '@/actions/projects';
import { getServices } from '@/actions/services';

export const metadata: Metadata = {
  title: 'Adegheosa — Lights, Lens & Vision',
  description:
    'Visual artist and photographer exploring the space between lifestyle, product, and emotion.',
};

// Revalidate every 60 seconds so CMS changes reflect quickly
export const revalidate = 60;

export default async function HomePage() {
  const [projects, services] = await Promise.all([
    getFeaturedProjects(),
    getServices(),
  ]);

  return (
    <>
      <Hero />
      <About />
      <WorkGrid projects={projects} limit={8} showHeading />
      <ServicesSection services={services} />
      <ContactCTA />
    </>
  );
}

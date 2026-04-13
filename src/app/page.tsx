import { getFeaturedProjects } from '@/actions/projects';
import { getServices } from '@/actions/services';
import Navbar from '@/components/client/Navbar';
import Hero from '@/components/client/Hero';
import About from '@/components/client/About';
import ServicesSection from '@/components/client/ServicesSection';
import WorkGrid from '@/components/client/WorkGrid';
import ContactCTA from '@/components/client/ContactCTA';
import Footer from '@/components/client/Footer';

export const revalidate = 60;

export default async function Home() {
  const [projects, services] = await Promise.all([
    getFeaturedProjects(),
    getServices(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <ServicesSection services={services} />
        <WorkGrid projects={projects} limit={8} />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}

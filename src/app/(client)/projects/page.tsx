import type { Metadata } from 'next';
import { getPublishedProjects } from '@/actions/projects';
import { getServices } from '@/actions/services';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Browse all photography projects — portraits, fashion, street, couples, creative direction, and more.',
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const [projects, services] = await Promise.all([
    getPublishedProjects(),
    getServices(),
  ]);

  return <ProjectsClient projects={projects} services={services} />;
}

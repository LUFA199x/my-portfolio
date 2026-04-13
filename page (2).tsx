import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProjectBySlug, getPublishedProjects } from '@/actions/projects';
import ProjectGallery from './ProjectGallery';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description ?? `Photography project: ${project.title}`,
    openGraph: {
      images: [project.cover_image],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  return <ProjectGallery project={project} />;
}

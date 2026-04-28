import Link from 'next/link';
import Image from 'next/image';
import { getAllProjects } from '@/actions/projects';
import { updateProject, deleteProject } from '@/actions/projects';

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="font-mono text-[10px] text-[#3a3835] tracking-widest uppercase mb-2">CMS</p>
          <h1 className="font-display text-5xl text-[#f5f0eb] tracking-wide">PROJECTS</h1>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 bg-[#c8b89a] text-[#0a0a0a] px-5 py-2.5 rounded-xl text-xs font-mono tracking-widest uppercase hover:bg-[#f5f0eb] transition-colors font-semibold"
        >
          + Upload Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-[#1a1a18] rounded-2xl">
          <p className="text-[#3a3835] text-sm font-mono tracking-widest uppercase mb-4">No projects yet</p>
          <Link href="/admin/projects/new" className="text-[#c8b89a] text-xs font-mono hover:text-[#f5f0eb] transition-colors">
            Upload your first project →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => {
            async function handleTogglePublish() {
              'use server';
              await updateProject(project.id, { is_published: !project.is_published });
            }
            async function handleToggleFeatured() {
              'use server';
              await updateProject(project.id, { is_featured: !project.is_featured });
            }
            async function handleDelete() {
              'use server';
              await deleteProject(project.id);
            }

            return (
              <div
                key={project.id}
                className="flex items-center gap-4 bg-[#0f0f0e] border border-[#1a1a18] rounded-xl p-4 hover:border-[#2a2a28] transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#1a1a18]">
                  {project.cover_image && (
                    <Image
                      src={project.cover_image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#f5f0eb] text-sm font-medium truncate">{project.title}</p>
                  <p className="text-[#3a3835] text-[10px] font-mono mt-0.5 truncate">
                    {project.service?.name ?? 'No service'} · {project.shot_date ?? 'No date'} · {project.images?.length ?? 0} photos
                  </p>
                </div>

                {/* Status badges */}
                <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                  {project.is_featured && (
                    <span className="text-[9px] font-mono text-[#c8b89a] tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#c8b89a]/10 border border-[#c8b89a]/20">
                      Featured
                    </span>
                  )}
                  <span
                    className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full border ${
                      project.is_published
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-[#1a1a18] text-[#3a3835] border-[#1a1a18]'
                    }`}
                  >
                    {project.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <form action={handleTogglePublish}>
                    <button
                      type="submit"
                      className="text-[10px] font-mono text-[#9a9590] hover:text-[#f5f0eb] tracking-widest uppercase transition-colors"
                    >
                      {project.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                  </form>
                  <form action={handleToggleFeatured}>
                    <button
                      type="submit"
                      className="text-[10px] font-mono text-[#9a9590] hover:text-[#c8b89a] tracking-widest uppercase transition-colors"
                    >
                      {project.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                  </form>
                  <form action={handleDelete}>
                    <button
                      type="submit"
                      className="text-[10px] font-mono text-red-500/50 hover:text-red-400 tracking-widest uppercase transition-colors"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

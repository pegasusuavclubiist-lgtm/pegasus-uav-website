import { Metadata } from "next";
import { siteData } from "@/data/data";
import ProjectPageClient from "@/components/project/ProjectPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(siteData.projectDetails).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = siteData.projectDetails[slug];

  if (project) {
    return {
      title: `${project.title} | PEGASUS UAV Club · IIST`,
      description: project.summary,
      openGraph: {
        title: project.title,
        description: project.summary,
        images: project.coverImageUrl ? [{ url: project.coverImageUrl }] : [],
      },
    };
  }

  return {
    title: `Project Flight Telemetry | PEGASUS UAV Club · IIST`,
    description: "Detailed aerospace flight specifications and autonomous telemetry for Pegasus UAV Club.",
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const initialProject = siteData.projectDetails[slug] || null;

  let initialNextProject = null;
  const list = siteData.projects.list;
  if (list && list.length > 0) {
    const currentIndex = list.findIndex(
      (p) => p.href.replace("/projects/", "") === slug
    );
    const nextIndex =
      currentIndex !== -1 ? (currentIndex + 1) % list.length : 0;
    const nextItem = list[nextIndex];
    if (nextItem) {
      const nextSlug = nextItem.href.replace("/projects/", "");
      const detail = siteData.projectDetails[nextSlug];
      initialNextProject = {
        slug: nextSlug,
        title: nextItem.title,
        code: detail?.code || `PROJECT 0${nextIndex + 1}`,
        coverImageUrl: nextItem.imageUrl,
      };
    }
  }

  return (
    <ProjectPageClient
      slug={slug}
      initialProject={initialProject}
      initialNextProject={initialNextProject}
    />
  );
}

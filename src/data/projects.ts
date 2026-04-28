export type ProjectStatus = 'active' | 'shipped' | 'research' | 'paused';

export type Project = {
  title: string;
  status: ProjectStatus;
  period?: string;
  description: string;
  stack: string[];
  links?: {
    label: string;
    href: string;
  }[];
};

export const projects: Project[] = [
  // {
  //   title: 'portfolio and writing system',
  //   status: 'active',
  //   period: '2026',
  //   description:
  //     'personal astro site with markdown blog posts, rss feed, github pages deployment, and build metadata from github actions.',
  //   stack: ['astro', 'tailwind', 'github actions', 'rss'],
  //   links: [
  //     { label: 'blog', href: '/blog/' },
  //     { label: 'rss', href: '/rss.xml' },
  //     { label: 'github', href: 'https://github.com/tahzeer/tahzeer.github.io' },
  //   ],
  // },
  // {
  //   title: 'chrome extension utilities',
  //   status: 'shipped',
  //   description:
  //     'privacy-first browser utilities designed to run locally without collecting, storing, or transmitting user data.',
  //   stack: ['chrome extensions', 'javascript', 'privacy'],
  //   links: [{ label: 'privacy policy', href: '/privacy/chrome-extensions/' }],
  // },
  // {
  //   title: 'financial product experiments',
  //   status: 'research',
  //   description:
  //     'early explorations around finance workflows, practical automation, and product ux for individual users.',
  //   stack: ['fastapi', 'postgresql', 'react native', 'product'],
  // },
  // {
  //   title: 'openg2p / dpi contributions',
  //   status: 'active',
  //   description:
  //     'production work on digital public infrastructure for scalable benefit delivery and government-to-person fund transfers.',
  //   stack: ['fastapi', 'odoo', 'docker', 'kubernetes'],
  //   links: [{ label: 'openg2p', href: 'https://openg2p.org/' }],
  // },
];

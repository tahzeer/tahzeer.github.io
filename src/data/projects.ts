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
  {
    title: 'x940',
    status: 'active',
    period: '2026',
    description:
      'high-performance rust parser for swift mt940 bank statements with python, node.js, and cli bindings. converts legacy files to json, csv, and iso 20022 camt.053 xml.',
    stack: ['rust', 'napi-rs', 'pyo3', 'swift mt940'],
    links: [
      { label: 'npm', href: 'https://www.npmjs.com/package/x940' },
      { label: 'pypi', href: 'https://pypi.org/project/x940/' },
      { label: 'github', href: 'https://github.com/tahzeer/x940' },
    ],
  },
  {
    title: 'oss contributions',
    status: 'active',
    description:
      'production work on digital public infrastructure for scalable benefit delivery and government-to-person fund transfers.',
    stack: ['fastapi', 'odoo', 'docker', 'kubernetes'],
    links: [{ label: 'openg2p', href: 'https://openg2p.org/' }],
  },
  {
    title: 'chrome extension utilities',
    status: 'shipped',
    description:
      'privacy-first browser utilities designed to run locally without collecting, storing, or transmitting user data.',
    stack: ['chrome extensions', 'javascript', 'privacy'],
    links: [{ label: 'privacy policy', href: '/privacy/chrome-extensions/' }],
  },
];

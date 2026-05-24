export interface Certification {
  name: string;
  issuer: string;
  date: string; // "YYYY-MM"
  credentialUrl?: string;
}

export const certifications: Certification[] = [
  {
    name: 'Introduction to Parallel Programming with CUDA',
    issuer: 'Johns Hopkins University',
    date: '2026-04',
    credentialUrl: 'https://www.coursera.org/account/accomplishments/verify/JX5Z2NNP93W0',
  },
  {
    name: 'Claude Code in Action',
    issuer: 'Anthropic',
    date: '2026-04',
    credentialUrl: 'https://verify.skilljar.com/c/6wnnm4sxqyaj',
  },
];

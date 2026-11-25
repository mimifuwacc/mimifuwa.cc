export interface WorkItem {
  title: string;
  description?: string;
  date?: string;
  pinned?: boolean;
  technologies?: string[];
  externalUrl?: string;
  html?: string;
  url: string;
}

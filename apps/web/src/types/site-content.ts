export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}

export interface Certification {
  title: string;
  date: string;
}

export interface Award {
  date: string;
  title: string;
  description?: string;
}

export interface Mutual {
  name: string;
  url: string;
  description: string;
  image?: string;
}

export interface Track {
  title: string;
  artist: string;
  url: string;
  artworkUrl: string;
}

export interface SiteContent {
  about: {
    timeline: TimelineEvent[];
    certifications: Certification[];
    awards: Award[];
  };
  mutuals: Mutual[];
  tracks: Track[];
}

export const emptySiteContent: SiteContent = {
  about: { timeline: [], certifications: [], awards: [] },
  mutuals: [],
  tracks: [],
};

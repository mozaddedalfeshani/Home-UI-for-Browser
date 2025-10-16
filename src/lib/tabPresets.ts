export interface TabPreset {
  title: string;
  url: string;
}

// Common tabs for all users
export const commonTabs: TabPreset[] = [
  {
    title: "Ultimate Community",
    url: "https://mclx.pages.dev/"
  },
  {
    title: "Share Notes Instant",
    url: "https://mclx.pages.dev/paper"
  }
];

// Developer profile tabs
export const developerTabs: TabPreset[] = [
  {
    title: "GitHub",
    url: "https://github.com"
  },
  {
    title: "ChatGPT",
    url: "https://chatgpt.com"
  },
  {
    title: "Flutter",
    url: "https://pub.dev"
  },
  {
    title: "shadcn/ui",
    url: "https://ui.shadcn.com"
  },
  {
    title: "npm",
    url: "https://www.npmjs.com"
  }
];

// Gamer profile tabs
export const gamerTabs: TabPreset[] = [
  {
    title: "Steam",
    url: "https://store.steampowered.com"
  },
  {
    title: "Twitch",
    url: "https://www.twitch.tv"
  },
  {
    title: "Discord",
    url: "https://discord.com"
  },
  {
    title: "IGN",
    url: "https://www.ign.com"
  },
  {
    title: "Reddit Gaming",
    url: "https://www.reddit.com/r/gaming"
  }
];

// Normal profile tabs
export const normalTabs: TabPreset[] = [
  {
    title: "Gmail",
    url: "https://mail.google.com"
  },
  {
    title: "YouTube",
    url: "https://www.youtube.com"
  },
  {
    title: "Twitter",
    url: "https://twitter.com"
  },
  {
    title: "Reddit",
    url: "https://www.reddit.com"
  },
  {
    title: "News",
    url: "https://news.google.com"
  }
];

// Helper function to get tabs by profile
export const getTabsByProfile = (profile: 'developer' | 'gamer' | 'normal'): TabPreset[] => {
  const profileTabs = {
    developer: developerTabs,
    gamer: gamerTabs,
    normal: normalTabs
  };
  
  return [...commonTabs, ...profileTabs[profile]];
};

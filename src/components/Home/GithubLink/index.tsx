import { Github } from "lucide-react";

const GITHUB_REPO_URL = "https://github.com/AbabilX/Home-UI-for-Browser.git";

export default function GithubLink() {
  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="GitHub Repository"
      className="fixed top-4 right-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm border-border/60 shadow-lg transition-colors hover:bg-accent/80 hover:text-accent-foreground"
    >
      <Github className="h-5 w-5" />
    </a>
  );
}


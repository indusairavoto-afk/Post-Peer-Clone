import { ArrowRight, BookOpen, CheckCircle2, Code2, ExternalLink, FileText, Newspaper, ShieldCheck, Users } from "lucide-react";
import { Link } from "wouter";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

type PublicPageKey =
  | "apis"
  | "docs"
  | "blog"
  | "changelog"
  | "about"
  | "terms"
  | "privacy"
  | "demo";

const pageContent: Record<
  PublicPageKey,
  {
    eyebrow: string;
    title: string;
    highlightedTitle?: string;
    description: string;
    icon: typeof Code2;
    sections: { title: string; body: string; icon: typeof Code2 }[];
  }
> = {
  apis: {
    eyebrow: "Developer platform",
    title: "One API for every",
    highlightedTitle: "social channel",
    description:
      "Build publishing, scheduling, and analytics into your product without maintaining a separate integration for every platform.",
    icon: Code2,
    sections: [
      { title: "Publish everywhere", body: "Send one normalized post request to the social platforms your users already rely on.", icon: ArrowRight },
      { title: "Schedule with confidence", body: "Queue content with timezone-aware scheduling and a clear delivery status for every destination.", icon: CheckCircle2 },
      { title: "Built for automation", body: "Use API keys, predictable responses, and simple primitives that work well for products and AI agents.", icon: Code2 },
    ],
  },
  docs: {
    eyebrow: "Documentation",
    title: "Ship your first",
    highlightedTitle: "social post",
    description:
      "Everything you need to connect PostPeer, create an API key, and publish your first multi-platform post.",
    icon: BookOpen,
    sections: [
      { title: "1. Create an account", body: "Start with a free workspace and open the API Keys page from your dashboard.", icon: Users },
      { title: "2. Add your key", body: "Use the generated key in the Authorization header for requests to the PostPeer API.", icon: ShieldCheck },
      { title: "3. Make a request", body: "Create a post with your content and target platforms, then track its delivery status.", icon: FileText },
    ],
  },
  blog: {
    eyebrow: "From the PostPeer team",
    title: "Ideas for the",
    highlightedTitle: "automated web",
    description:
      "Practical notes on social APIs, content workflows, and building products that help teams publish consistently.",
    icon: Newspaper,
    sections: [
      { title: "The unified API playbook", body: "Why a normalized publishing layer makes multi-platform products easier to build and maintain.", icon: BookOpen },
      { title: "Designing for AI agents", body: "The small API decisions that make automation reliable, observable, and safe to operate.", icon: Code2 },
      { title: "A better content workflow", body: "How scheduling, approvals, and delivery signals turn social publishing into a repeatable system.", icon: CheckCircle2 },
    ],
  },
  changelog: {
    eyebrow: "Product updates",
    title: "What’s new in",
    highlightedTitle: "PostPeer",
    description:
      "A running snapshot of improvements to the API, dashboard, and developer experience.",
    icon: Newspaper,
    sections: [
      { title: "Dashboard foundation", body: "Compose, schedule, and manage posts from one focused workspace.", icon: CheckCircle2 },
      { title: "Connected platforms", body: "See your social destinations and manage their connection status in one place.", icon: Users },
      { title: "Developer controls", body: "Create and rotate API keys with a clear, secure one-time reveal flow.", icon: ShieldCheck },
    ],
  },
  about: {
    eyebrow: "About PostPeer",
    title: "The social layer for",
    highlightedTitle: "modern products",
    description:
      "PostPeer gives product teams one reliable place to connect, publish, and automate across the social web.",
    icon: Users,
    sections: [
      { title: "Our mission", body: "Make social distribution feel like a simple product primitive instead of a collection of brittle integrations.", icon: ArrowRight },
      { title: "Built for builders", body: "PostPeer is designed around clear APIs, useful delivery signals, and workflows that fit the way developers work.", icon: Code2 },
      { title: "A focused foundation", body: "We are starting with the core publishing layer and expanding carefully from there.", icon: CheckCircle2 },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of",
    highlightedTitle: "Service",
    description:
      "These terms describe the rules for using PostPeer and the responsibilities of PostPeer and its users.",
    icon: FileText,
    sections: [
      { title: "Use of the service", body: "Use PostPeer lawfully, keep your account secure, and only publish content you have the right to distribute.", icon: ShieldCheck },
      { title: "API usage", body: "Respect rate limits and do not use the service to abuse, impersonate, or disrupt third-party platforms.", icon: Code2 },
      { title: "Questions", body: "If you have questions about these terms, contact the PostPeer team before using the service in production.", icon: ExternalLink },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Your data,",
    highlightedTitle: "your control",
    description:
      "This overview explains the data PostPeer uses to provide authentication, publishing, and account management.",
    icon: ShieldCheck,
    sections: [
      { title: "Account information", body: "We use account details and authentication data to provide access to your workspace and keep it secure.", icon: Users },
      { title: "Content and connections", body: "Post content and platform connection details are used to deliver the workflows you request.", icon: FileText },
      { title: "Security first", body: "API keys are protected server-side, and sensitive connection data should only be shared through approved integrations.", icon: ShieldCheck },
    ],
  },
  demo: {
    eyebrow: "See it in action",
    title: "A faster way to",
    highlightedTitle: "ship everywhere",
    description:
      "Explore the PostPeer workflow from your dashboard: connect destinations, compose once, and track what happens next.",
    icon: ArrowRight,
    sections: [
      { title: "Compose once", body: "Write a post and choose the platforms that should receive it.", icon: FileText },
      { title: "Schedule or publish", body: "Send it now or choose the moment your audience is most likely to see it.", icon: ArrowRight },
      { title: "Measure the result", body: "Keep your publishing history and delivery status in one place.", icon: CheckCircle2 },
    ],
  },
};

export default function PublicPage({ page }: { page: PublicPageKey }) {
  const content = pageContent[page];
  const PageIcon = content.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono selection:bg-white selection:text-black flex flex-col relative">
      <div className="fixed inset-0 pointer-events-none bg-grid z-0 opacity-20" />
      <Navbar />
      <main className="flex-grow pt-32 pb-24 px-6 relative z-10">
        <section className="max-w-5xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-xs uppercase tracking-wider mb-7">
              <PageIcon size={14} />
              {content.eyebrow}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
              {content.title}{" "}
              {content.highlightedTitle && (
                <span className="inline-block bg-white text-black px-3 py-1 mt-2 rounded-md transform -rotate-1">
                  {content.highlightedTitle}
                </span>
              )}
            </h1>
            <p className="mt-8 text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
              {content.description}
            </p>
            {page === "demo" || page === "docs" || page === "apis" ? (
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/sign-up" className="inline-flex items-center gap-2 bg-white text-black px-5 py-3 rounded-md font-bold hover:bg-gray-200 transition-colors">
                  Start building <ArrowRight size={16} />
                </Link>
                <Link href="/pricing" className="inline-flex items-center gap-2 border border-white/20 px-5 py-3 rounded-md font-bold hover:bg-white/5 transition-colors">
                  View pricing
                </Link>
              </div>
            ) : null}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-20">
            {content.sections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <article key={section.title} className="border border-white/10 bg-white/[0.03] rounded-xl p-6 min-h-52">
                  <SectionIcon size={20} className="text-white mb-8" />
                  <h2 className="font-bold text-lg mb-3">{section.title}</h2>
                  <p className="text-gray-500 text-xs leading-relaxed">{section.body}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
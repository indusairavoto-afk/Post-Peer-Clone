import { useState, useRef } from "react";
import { useListConnectedPlatforms, useCreatePost, getListPostsQueryKey, getListConnectedPlatformsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, Calendar, Send, Globe, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube, FaPinterest } from "react-icons/fa";
import { SiBluesky, SiThreads } from "react-icons/si";

const PlatformIcons: Record<string, any> = {
  twitter: FaTwitter, x: FaTwitter,
  instagram: FaInstagram,
  facebook: FaFacebook,
  linkedin: FaLinkedin,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  pinterest: FaPinterest,
  bluesky: SiBluesky,
  threads: SiThreads,
};

const PlatformLimits: Record<string, number> = {
  twitter: 280, x: 280,
  instagram: 2200,
  linkedin: 3000,
  tiktok: 2200,
  bluesky: 300,
  threads: 500,
  facebook: 63206,
  youtube: 5000,
  pinterest: 500,
};

export default function Compose() {
  const [content, setContent] = useState("");
  // selectedIds: platform_tokens row IDs (strings of integers)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connectedPlatforms } = useListConnectedPlatforms({
    query: { queryKey: getListConnectedPlatformsQueryKey() },
  });

  const createPost = useCreatePost();
  const mutateFnRef = useRef(createPost.mutate);
  mutateFnRef.current = createPost.mutate;

  const connectedList = connectedPlatforms?.platforms ?? [];

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getLowestLimit = () => {
    if (selectedIds.length === 0) return 2200;
    const selected = connectedList.filter((c) => selectedIds.includes(c.id));
    return Math.min(...selected.map((c) => PlatformLimits[c.platform] ?? 2200));
  };

  const limit = getLowestLimit();
  const charsLeft = limit - content.length;
  const isOverLimit = charsLeft < 0;

  const handleSubmit = () => {
    if (!content.trim()) { toast({ title: "Content is required", variant: "destructive" }); return; }
    if (selectedIds.length === 0) { toast({ title: "Select at least one account", variant: "destructive" }); return; }
    if (isOverLimit) { toast({ title: "Content exceeds platform character limit", variant: "destructive" }); return; }
    if (isScheduling && !scheduledAt) { toast({ title: "Select a date and time to schedule", variant: "destructive" }); return; }

    const selectedAccounts = connectedList.filter((c) => selectedIds.includes(c.id));
    const platforms = selectedAccounts.map((c) => c.platform);
    // token IDs are the numeric platform_tokens.id rows
    const tokenIds = selectedIds.map((id) => parseInt(id, 10)).filter(Boolean);

    const payload: any = { content, platforms, tokenIds };

    if (isScheduling) {
      const d = new Date(scheduledAt);
      if (d <= new Date()) { toast({ title: "Scheduled time must be in the future", variant: "destructive" }); return; }
      payload.scheduledAt = d.toISOString();
    }

    mutateFnRef.current(
      { data: payload },
      {
        onSuccess: (result: any) => {
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });

          const errors = result?.errors ?? result?.results?.filter((r: any) => !r.success);
          if (errors?.length > 0) {
            toast({
              title: "Some platforms failed",
              description: errors.map((e: any) => `${e.platform}: ${e.error}`).join("; "),
              variant: "destructive",
            });
          } else {
            toast({
              title: isScheduling ? "Post scheduled!" : "Post published!",
              description: `Sent to ${selectedAccounts.length} platform${selectedAccounts.length > 1 ? "s" : ""}.`,
            });
          }
          setLocation("/posts");
        },
        onError: (err: any) => {
          toast({ title: "Failed", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Compose Post</h1>
        <p className="text-gray-400 text-sm">Write once, publish everywhere.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">

        {/* Editor */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-[#111] border border-[#222] rounded-md flex-1 flex flex-col overflow-hidden focus-within:border-[#555] transition-colors">
            <textarea
              className="flex-1 w-full bg-transparent p-6 text-white resize-none outline-none text-lg placeholder:text-[#444] leading-relaxed"
              placeholder="What do you want to share?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="p-4 bg-[#0a0a0a] border-t border-[#222] flex items-center justify-between">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-md transition-colors">
                <ImageIcon size={18} />
              </button>
              <div className={`text-xs font-mono px-2 py-1 rounded ${isOverLimit ? "text-red-400 bg-red-950/30" : "text-gray-500"}`}>
                {content.length} / {limit}
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-md p-4">
            <div className="flex items-center gap-4 mb-4 border-b border-[#222] pb-4">
              <button
                onClick={() => setIsScheduling(false)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium border flex items-center justify-center gap-2 transition-colors ${!isScheduling ? "bg-white text-black border-white" : "bg-[#1a1a1a] text-gray-400 border-[#333] hover:text-white"}`}
              >
                <Send size={14} /> Post Now
              </button>
              <button
                onClick={() => setIsScheduling(true)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium border flex items-center justify-center gap-2 transition-colors ${isScheduling ? "bg-white text-black border-white" : "bg-[#1a1a1a] text-gray-400 border-[#333] hover:text-white"}`}
              >
                <Calendar size={14} /> Schedule
              </button>
            </div>

            {isScheduling && (
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Delivery Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={createPost.isPending}
              className="w-full py-3 bg-white text-black font-bold text-sm rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createPost.isPending ? "Publishing…" : isScheduling ? "Schedule Post" : "Publish Now"}
            </button>
          </div>
        </div>

        {/* Account selector + preview */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-medium text-white">Select Accounts</h2>
              <span className="text-xs text-gray-500">{selectedIds.length} selected</span>
            </div>

            {connectedList.length === 0 ? (
              <div className="bg-[#111] border border-[#222] border-dashed rounded-md p-6 text-center">
                <Globe size={24} className="mx-auto text-gray-500 mb-2" />
                <p className="text-sm text-gray-300 mb-1">No accounts connected</p>
                <p className="text-xs text-gray-500 mb-4">Connect your social accounts on the Platforms page.</p>
                <a href="/platforms" className="text-xs text-black bg-white px-3 py-1.5 rounded hover:bg-gray-200">
                  Go to Platforms
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {connectedList.map((conn) => {
                  const Icon = PlatformIcons[conn.platform] ?? Globe;
                  const isSelected = selectedIds.includes(conn.id);
                  return (
                    <button
                      key={conn.id}
                      onClick={() => handleToggle(conn.id)}
                      className={`text-left p-3 rounded-md border flex items-center gap-3 transition-all ${
                        isSelected
                          ? "bg-[#1a1a1a] border-white text-white shadow-[0_0_0_1px_rgba(255,255,255,1)]"
                          : "bg-[#0a0a0a] border-[#222] text-gray-400 hover:border-[#444] hover:bg-[#111]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-white text-black" : "bg-[#222] text-gray-300"}`}>
                        <Icon size={14} />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-xs font-medium capitalize truncate">{conn.platform}</p>
                        <p className="text-[10px] truncate opacity-60">@{conn.accountHandle}</p>
                      </div>
                      {isSelected && <Check size={14} className="text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[200px]">
            <h2 className="text-sm font-medium text-white mb-3">Live Preview</h2>
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-5 h-full flex items-center justify-center relative overflow-hidden">
              {!content ? (
                <p className="text-xs text-gray-600 font-mono text-center">// Start typing to see preview</p>
              ) : (
                <div className="w-full max-w-sm bg-[#111] border border-[#333] rounded-xl p-4 shadow-xl font-sans">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center">
                      <span className="text-gray-400 text-xs">A</span>
                    </div>
                    <div>
                      <div className="w-24 h-3 bg-[#222] rounded mb-1.5" />
                      <div className="w-16 h-2 bg-[#1a1a1a] rounded" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">{content}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useRef } from "react";
import { useListConnectedPlatforms, useCreatePost, getListPostsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, Calendar, Send, Globe, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube, FaPinterest } from "react-icons/fa";
import { SiBluesky, SiThreads } from "react-icons/si";

const PlatformIcons: Record<string, any> = {
  twitter: FaTwitter,
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
  twitter: 280,
  instagram: 2200,
  linkedin: 3000,
  tiktok: 2200,
  bluesky: 300,
  threads: 500,
  facebook: 63206,
};

export default function Compose() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: connectedPlatforms } = useListConnectedPlatforms({
    query: { queryKey: ["/api/platforms/connected"] }
  });
  
  const createPost = useCreatePost();
  const mutateFnRef = useRef(createPost.mutate);
  mutateFnRef.current = createPost.mutate;

  const connectedList = connectedPlatforms?.platforms || [];
  
  const handleTogglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const getLowestLimit = () => {
    if (selectedPlatforms.length === 0) return 2200; // Default reasonable limit
    return Math.min(...selectedPlatforms.map(p => PlatformLimits[p] || 2200));
  };

  const limit = getLowestLimit();
  const charsLeft = limit - content.length;
  const isOverLimit = charsLeft < 0;

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({ title: "Content is required", variant: "destructive" });
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast({ title: "Select at least one platform", variant: "destructive" });
      return;
    }
    if (isOverLimit) {
      toast({ title: "Content exceeds platform limits", variant: "destructive" });
      return;
    }
    if (isScheduling && !scheduledAt) {
      toast({ title: "Select a date and time to schedule", variant: "destructive" });
      return;
    }

    const payload: any = {
      content,
      platforms: selectedPlatforms,
    };
    
    if (isScheduling) {
      const d = new Date(scheduledAt);
      if (d <= new Date()) {
        toast({ title: "Scheduled time must be in the future", variant: "destructive" });
        return;
      }
      payload.scheduledAt = d.toISOString();
    }

    mutateFnRef.current(
      { data: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
          toast({ 
            title: isScheduling ? "Post scheduled!" : "Post sent!", 
            description: `Delivering to ${selectedPlatforms.length} platforms.`
          });
          setLocation("/posts");
        },
        onError: (err: any) => {
          toast({ 
            title: "Failed to create post", 
            description: err.message || "An error occurred", 
            variant: "destructive" 
          });
        }
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
        <p className="text-gray-400 text-sm">Write once, distribute everywhere.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        
        {/* Left Column - Editor */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-[#111] border border-[#222] rounded-md flex-1 flex flex-col overflow-hidden focus-within:border-[#555] transition-colors shadow-sm">
            <textarea
              className="flex-1 w-full bg-transparent p-6 text-white resize-none outline-none font-sans text-lg placeholder:text-[#444] leading-relaxed"
              placeholder="What do you want to share?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            <div className="p-4 bg-[#0a0a0a] border-t border-[#222] flex items-center justify-between">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-md transition-colors">
                <ImageIcon size={18} />
              </button>
              
              <div className={`text-xs font-mono px-2 py-1 rounded ${isOverLimit ? 'text-red-400 bg-red-950/30' : 'text-gray-500'}`}>
                {content.length} / {limit}
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-md p-4">
            <div className="flex items-center gap-4 mb-4 border-b border-[#222] pb-4">
              <button 
                onClick={() => setIsScheduling(false)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium border flex items-center justify-center gap-2 transition-colors ${
                  !isScheduling ? 'bg-white text-black border-white' : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:text-white'
                }`}
              >
                <Send size={14} /> Post Now
              </button>
              <button 
                onClick={() => setIsScheduling(true)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium border flex items-center justify-center gap-2 transition-colors ${
                  isScheduling ? 'bg-white text-black border-white' : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:text-white'
                }`}
              >
                <Calendar size={14} /> Schedule
              </button>
            </div>

            {isScheduling && (
              <div className="mb-4 animate-in fade-in slide-in-from-top-2">
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
              className="w-full py-3 bg-white text-black font-bold text-sm rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {createPost.isPending ? "Processing..." : isScheduling ? "Schedule Post" : "Publish Now"}
            </button>
          </div>
        </div>

        {/* Right Column - Platforms & Preview */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-medium text-white">Select Platforms</h2>
              <span className="text-xs text-gray-500">{selectedPlatforms.length} selected</span>
            </div>
            
            {connectedList.length === 0 ? (
              <div className="bg-[#111] border border-[#222] border-dashed rounded-md p-6 text-center">
                <Globe size={24} className="mx-auto text-gray-500 mb-2" />
                <p className="text-sm text-gray-300 mb-1">No platforms connected</p>
                <p className="text-xs text-gray-500 mb-4">Connect accounts to start posting.</p>
                <button onClick={() => setLocation('/platforms')} className="text-xs text-black bg-white px-3 py-1.5 rounded hover:bg-gray-200">
                  Connect Platforms
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {connectedList.map((conn) => {
                  const Icon = PlatformIcons[conn.platform] || Globe;
                  const isSelected = selectedPlatforms.includes(conn.platform);
                  
                  return (
                    <button
                      key={conn.id}
                      onClick={() => handleTogglePlatform(conn.platform)}
                      className={`text-left p-3 rounded-md border flex items-center gap-3 transition-all ${
                        isSelected 
                          ? "bg-[#1a1a1a] border-white text-white shadow-[0_0_0_1px_rgba(255,255,255,1)]" 
                          : "bg-[#0a0a0a] border-[#222] text-gray-400 hover:border-[#444] hover:bg-[#111]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-white text-black' : 'bg-[#222] text-gray-300'}`}>
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
              <div className="absolute inset-0 scanlines pointer-events-none opacity-50"></div>
              
              {!content ? (
                <p className="text-xs text-gray-600 font-mono text-center relative z-10">
                  // Start typing to see preview
                </p>
              ) : (
                <div className="w-full max-w-sm bg-[#111] border border-[#333] rounded-xl p-4 shadow-xl relative z-10 font-sans">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center">
                      <span className="text-gray-400 text-xs">A</span>
                    </div>
                    <div>
                      <div className="w-24 h-3 bg-[#222] rounded mb-1.5"></div>
                      <div className="w-16 h-2 bg-[#1a1a1a] rounded"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                    {content}
                  </p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}
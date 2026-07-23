import { useRef } from "react";
import { 
  useListPlatforms, 
  useListConnectedPlatforms, 
  useDisconnectPlatform,
  getListConnectedPlatformsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link2, Unlink, Globe, Loader2, ShieldAlert } from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube, FaPinterest } from "react-icons/fa";
import { SiBluesky, SiThreads } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

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

export default function Platforms() {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  const { data: platformsData, isLoading: platformsLoading } = useListPlatforms();
  const { data: connectedData, isLoading: connectedLoading } = useListConnectedPlatforms({
    query: { queryKey: getListConnectedPlatformsQueryKey() }
  });

  const disconnectMutation = useDisconnectPlatform();
  const disconnectFnRef = useRef(disconnectMutation.mutate);
  disconnectFnRef.current = disconnectMutation.mutate;

  const handleConnect = (platformName: string) => {
    toast({
      title: "Real authorization required",
      description: `${platformName} cannot be connected with a username. OAuth setup is required before this account can be verified or used for publishing.`,
      variant: "destructive",
    });
  };

  const handleDisconnect = (platform: string) => {
    disconnectFnRef.current(
      { platform },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConnectedPlatformsQueryKey() });
          toast({ title: "Platform disconnected" });
        },
        onError: (err: any) => {
          toast({ title: "Failed to disconnect", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const platforms = platformsData?.platforms || [];
  const connected = connectedData?.platforms || [];
  
  const getConnectedInfo = (platformId: string) => {
    return connected.find(c => c.platform === platformId);
  };

  if (platformsLoading || connectedLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading platforms...
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Platforms</h1>
          <p className="text-gray-400 text-sm">Connect accounts to distribute your content.</p>
        </div>
        <div className="bg-[#111] border border-[#333] px-4 py-2 rounded-md text-sm text-gray-300 font-mono">
          <span className="text-white font-bold">{connected.length}</span> of {platforms.length} connected
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const Icon = PlatformIcons[platform.id] || Globe;
          const connInfo = getConnectedInfo(platform.id);
          const isConnected = !!connInfo;

          return (
            <div key={platform.id} className="bg-[#111] border border-[#222] rounded-lg p-6 flex flex-col relative overflow-hidden group hover:border-[#444] transition-colors">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-[#1a1a1a] flex items-center justify-center border border-[#333]">
                    <Icon size={24} style={{ color: platform.color }} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold capitalize">{platform.name}</h3>
                    {isConnected ? (
                      <span className="text-xs text-green-400 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Connected
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 mt-1 block">Not connected</span>
                    )}
                  </div>
                </div>
              </div>

              {isConnected ? (
                <div className="mt-auto pt-4 border-t border-[#222]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300 font-mono">@{connInfo.accountHandle}</p>
                    <button 
                      onClick={() => handleDisconnect(platform.id)}
                      disabled={disconnectMutation.isPending}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <Unlink size={12} /> Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-auto pt-4 border-t border-[#222]">
                  <button 
                    onClick={() => handleConnect(platform.name)}
                    className="w-full bg-[#1a1a1a] hover:bg-[#222] text-white text-sm py-2 rounded border border-[#333] transition-colors flex items-center justify-center gap-2"
                  >
                    <ShieldAlert size={14} /> Set up OAuth to connect
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </motion.div>
  );
}
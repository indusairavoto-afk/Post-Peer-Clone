import { useState } from "react";
import {
  useListPlatforms,
  useListConnectedPlatforms,
  useDisconnectPlatform,
  useGetUserProfile,
  getListConnectedPlatformsQueryKey,
  getGetUserProfileQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Globe, Loader2, ExternalLink, Unlink, CheckCircle2, Key } from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube, FaPinterest } from "react-icons/fa";
import { SiBluesky, SiThreads } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

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
  x: FaTwitter,
};

const PlatformColors: Record<string, string> = {
  twitter: "#1DA1F2",
  x: "#1DA1F2",
  instagram: "#E1306C",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  tiktok: "#69C9D0",
  youtube: "#FF0000",
  pinterest: "#E60023",
  bluesky: "#0085FF",
  threads: "#ffffff",
};

export default function Platforms() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profileData, isLoading: profileLoading } = useGetUserProfile({
    query: { queryKey: getGetUserProfileQueryKey() },
  });

  const { data: connectedData, isLoading: connectedLoading } = useListConnectedPlatforms({
    query: { queryKey: getListConnectedPlatformsQueryKey() },
  });

  const disconnectMutation = useDisconnectPlatform();

  const handleDisconnect = (platform: string) => {
    disconnectMutation.mutate(
      { platform },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConnectedPlatformsQueryKey() });
          toast({ title: "Platform disconnected" });
        },
        onError: (err: any) => {
          toast({ title: "Failed to disconnect", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  if (profileLoading || connectedLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading platforms...
      </div>
    );
  }

  const hasPostBridgeKey = (profileData as any)?.hasPostBridgeKey;
  const connected = connectedData?.platforms || [];
  const postBridgeConfigured = (connectedData as any)?.postBridgeConfigured;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Platforms</h1>
          <p className="text-gray-400 text-sm">Connect your social accounts to distribute content.</p>
        </div>
        {hasPostBridgeKey && (
          <div className="bg-[#111] border border-[#333] px-4 py-2 rounded-md text-sm text-gray-300 font-mono">
            <span className="text-white font-bold">{connected.length}</span> accounts connected
          </div>
        )}
      </header>

      {/* Post Bridge Setup Banner */}
      {!hasPostBridgeKey && (
        <div className="bg-[#0a0f1a] border border-[#1a3a6a] rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-[#1a3a6a] flex items-center justify-center shrink-0">
              <Key size={20} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold mb-1">Connect via Post Bridge</h2>
              <p className="text-gray-400 text-sm mb-4">
                PostMVP publishes through <a href="https://post-bridge.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Post Bridge</a> — a real social publishing API that handles OAuth for Instagram, TikTok, YouTube, X, LinkedIn, Facebook, Pinterest, Threads, and Bluesky.
              </p>
              <ol className="text-sm text-gray-300 space-y-2 mb-5 list-decimal list-inside">
                <li>Create a free account at <a href="https://post-bridge.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">post-bridge.com</a></li>
                <li>Connect your social accounts on their dashboard</li>
                <li>Go to <a href="https://post-bridge.com/dashboard/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">post-bridge.com/dashboard/api-keys</a> and enable API access</li>
                <li>Copy your API key and add it in <Link href="/settings" className="text-blue-400 hover:underline">PostMVP Settings</Link></li>
              </ol>
              <div className="flex items-center gap-3">
                <a
                  href="https://post-bridge.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded font-medium transition-colors"
                >
                  Go to Post Bridge <ExternalLink size={14} />
                </a>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 border border-[#333] text-gray-300 hover:text-white text-sm px-4 py-2 rounded transition-colors"
                >
                  Add API Key in Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key configured but accounts are empty */}
      {hasPostBridgeKey && connected.length === 0 && (
        <div className="bg-[#0a0f1a] border border-[#1a3a6a] rounded-lg p-6 text-center">
          <Globe size={32} className="mx-auto text-gray-500 mb-3" />
          <h2 className="text-white font-bold mb-1">No accounts connected yet</h2>
          <p className="text-gray-400 text-sm mb-4">
            Your Post Bridge key is configured. Now connect your social accounts on the Post Bridge dashboard.
          </p>
          <a
            href="https://app.post-bridge.com/accounts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded font-medium transition-colors"
          >
            Manage accounts on Post Bridge <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Real connected accounts from Post Bridge */}
      {hasPostBridgeKey && connected.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-950/20 border border-green-900 rounded px-3 py-2">
            <CheckCircle2 size={14} />
            <span>Connected via Post Bridge — these are real, verified accounts.</span>
            <a
              href="https://app.post-bridge.com/accounts"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-green-300 hover:text-green-200"
            >
              Manage <ExternalLink size={12} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connected.map((account) => {
              const Icon = PlatformIcons[account.platform] || Globe;
              const color = PlatformColors[account.platform] || "#888";

              return (
                <div
                  key={account.id}
                  className="bg-[#111] border border-[#222] rounded-lg p-6 flex flex-col relative overflow-hidden group hover:border-[#444] transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-[#1a1a1a] flex items-center justify-center border border-[#333]">
                        <Icon size={24} style={{ color }} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold capitalize">{account.platform}</h3>
                        <span className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Connected
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-[#222] flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-medium">
                        {account.accountName !== account.accountHandle ? account.accountName : `@${account.accountHandle}`}
                      </p>
                      {account.accountName !== account.accountHandle && (
                        <p className="text-xs text-gray-400 font-mono">@{account.accountHandle}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}

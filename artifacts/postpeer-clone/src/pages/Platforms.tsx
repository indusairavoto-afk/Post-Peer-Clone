import { useState, useEffect } from "react";
import {
  useListPlatforms,
  useListConnectedPlatforms,
  useGetUserProfile,
  getListConnectedPlatformsQueryKey,
  getListPlatformsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Loader2, ExternalLink, CheckCircle2, Unlink, X, Eye, EyeOff, Zap, Lock
} from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube, FaPinterest } from "react-icons/fa";
import { SiBluesky, SiThreads } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

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

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function getApiBase() {
  // In development Replit proxies, BASE_URL is like /postpeer-clone
  // API calls go to the API server artifact path
  return `${BASE_URL.replace(/\/[^/]+$/, "")}/api-server`;
}

/** Open OAuth start URL in the same window — user returns via callback redirect. */
function startOAuth(platform: string) {
  const apiBase = window.location.origin;
  // The OAuth start route is on the API server. In the Replit proxy it's at /api-server/api/oauth/...
  // but the platform's callback URL must match what's registered. We use the direct API server URL.
  window.location.href = `${apiBase}/api-server/api/oauth/start/${platform}`;
}

export default function Platforms() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Pick up ?connected=platform or ?error=... from OAuth callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");
    if (connected) {
      queryClient.invalidateQueries({ queryKey: getListConnectedPlatformsQueryKey() });
      toast({ title: `${connected} connected!`, description: "Your account is now live." });
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (error) {
      toast({ title: "OAuth failed", description: decodeURIComponent(error), variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const { data: platformsData, isLoading: platformsLoading } = useListPlatforms({
    query: { queryKey: getListPlatformsQueryKey() },
  });
  const { data: connectedData, isLoading: connectedLoading } = useListConnectedPlatforms({
    query: { queryKey: getListConnectedPlatformsQueryKey() },
  });

  const [blueskyOpen, setBlueskyOpen] = useState(false);
  const [bsIdentifier, setBsIdentifier] = useState("");
  const [bsPassword, setBsPassword] = useState("");
  const [bsShowPwd, setBsShowPwd] = useState(false);
  const [bsLoading, setBsLoading] = useState(false);

  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  if (platformsLoading || connectedLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading…
      </div>
    );
  }

  const allPlatforms = (platformsData as any)?.platforms ?? [];
  const connected = connectedData?.platforms ?? [];
  const connectedSet = new Set(connected.map((c: any) => c.platform));

  const handleBlueskyConnect = async () => {
    if (!bsIdentifier || !bsPassword) return;
    setBsLoading(true);
    try {
      const base = window.location.origin;
      const res = await fetch(`${base}/api-server/api/oauth/bluesky/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier: bsIdentifier, appPassword: bsPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      queryClient.invalidateQueries({ queryKey: getListConnectedPlatformsQueryKey() });
      toast({ title: "Bluesky connected!", description: `@${data.accountHandle}` });
      setBlueskyOpen(false);
      setBsIdentifier(""); setBsPassword("");
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBsLoading(false);
    }
  };

  const handleDisconnect = async (platform: string) => {
    setDisconnecting(platform);
    try {
      const base = window.location.origin;
      await fetch(`${base}/api-server/api/oauth/${platform}/disconnect`, {
        method: "DELETE",
        credentials: "include",
      });
      queryClient.invalidateQueries({ queryKey: getListConnectedPlatformsQueryKey() });
      toast({ title: `${platform} disconnected` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Platforms</h1>
          <p className="text-gray-400 text-sm">
            Connect your accounts directly — PostMVP handles OAuth and publishes to each platform's API.
          </p>
        </div>
        {connected.length > 0 && (
          <div className="bg-[#111] border border-[#333] px-4 py-2 rounded-md text-sm text-gray-300 shrink-0">
            <span className="text-white font-bold">{connected.length}</span> account{connected.length !== 1 ? "s" : ""} connected
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allPlatforms.map((p: any) => {
          const Icon = PlatformIcons[p.id] ?? Globe;
          const isConnected = connectedSet.has(p.id);
          const connRow = connected.find((c: any) => c.platform === p.id);
          const configured = p.oauthConfigured;

          return (
            <div
              key={p.id}
              className={`bg-[#111] border rounded-lg p-5 flex flex-col gap-4 transition-colors ${
                isConnected ? "border-[#333] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" : "border-[#222] hover:border-[#333]"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center"
                    style={{ background: `${p.color}22` }}
                  >
                    <Icon size={20} style={{ color: p.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{p.name}</h3>
                    <span className="text-[11px] text-gray-500">
                      {p.requiresMedia ? "Media required" : `Up to ${p.maxLength.toLocaleString()} chars`}
                    </span>
                  </div>
                </div>
                {isConnected && (
                  <span className="flex items-center gap-1 text-[11px] text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
                  </span>
                )}
              </div>

              {/* Connected account info */}
              {isConnected && connRow && (
                <div className="bg-[#0a0a0a] rounded px-3 py-2 text-sm">
                  <p className="text-white font-medium">{connRow.accountName || `@${connRow.accountHandle}`}</p>
                  {connRow.accountName !== connRow.accountHandle && (
                    <p className="text-gray-500 text-xs font-mono">@{connRow.accountHandle}</p>
                  )}
                </div>
              )}

              {/* Action button */}
              <div className="mt-auto">
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(p.id)}
                    disabled={disconnecting === p.id}
                    className="w-full py-2 text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Unlink size={12} />
                    {disconnecting === p.id ? "Disconnecting…" : "Disconnect"}
                  </button>
                ) : p.id === "bluesky" ? (
                  <button
                    onClick={() => setBlueskyOpen(true)}
                    className="w-full py-2 text-xs font-medium bg-[#0085FF] hover:bg-[#006ee6] text-white rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap size={12} /> Connect with App Password
                  </button>
                ) : configured ? (
                  <button
                    onClick={() => startOAuth(p.id)}
                    className="w-full py-2 text-xs font-medium bg-white hover:bg-gray-100 text-black rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={12} /> Connect {p.name}
                  </button>
                ) : (
                  <div className="w-full py-2 text-xs text-gray-600 border border-[#1a1a1a] rounded flex items-center justify-center gap-2 cursor-not-allowed" title={`Set ${p.requiredEnvVars?.join(" + ")} to enable`}>
                    <Lock size={12} /> Needs developer app
                  </div>
                )}
              </div>

              {/* Unconfigured hint */}
              {!isConnected && !configured && p.requiredEnvVars?.length > 0 && (
                <p className="text-[11px] text-gray-600 font-mono leading-snug">
                  Set {p.requiredEnvVars.join(" & ")}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Bluesky Modal */}
      <AnimatePresence>
        {blueskyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setBlueskyOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-[#333] rounded-lg p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <SiBluesky size={20} className="text-[#0085FF]" />
                  <h2 className="text-white font-bold">Connect Bluesky</h2>
                </div>
                <button onClick={() => setBlueskyOpen(false)} className="text-gray-500 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-400 mb-5">
                Bluesky uses <strong className="text-gray-200">App Passwords</strong> instead of OAuth.
                Create one at{" "}
                <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  bsky.app/settings/app-passwords
                </a>{" "}
                — it never grants access to your main password.
              </p>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Handle</label>
                  <input
                    type="text"
                    value={bsIdentifier}
                    onChange={(e) => setBsIdentifier(e.target.value)}
                    placeholder="yourhandle.bsky.social"
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">App Password</label>
                  <div className="relative">
                    <input
                      type={bsShowPwd ? "text" : "password"}
                      value={bsPassword}
                      onChange={(e) => setBsPassword(e.target.value)}
                      placeholder="xxxx-xxxx-xxxx-xxxx"
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 pr-10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white transition-colors font-mono"
                    />
                    <button type="button" onClick={() => setBsShowPwd(!bsShowPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {bsShowPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBlueskyConnect}
                disabled={!bsIdentifier || !bsPassword || bsLoading}
                className="w-full py-2.5 bg-[#0085FF] hover:bg-[#006ee6] text-white text-sm font-bold rounded transition-colors disabled:opacity-50"
              >
                {bsLoading ? "Connecting…" : "Connect Account"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

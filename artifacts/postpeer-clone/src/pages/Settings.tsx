import { useState, useRef } from "react";
import { useGetUserProfile, useGetDashboardStats, useUpdateUserSettings, getGetUserProfileQueryKey, getListConnectedPlatformsQueryKey } from "@workspace/api-client-react";
import { useUser, useClerk } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { User, CreditCard, LogOut, ExternalLink, Key, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useGetUserProfile({
    query: { queryKey: getGetUserProfileQueryKey() },
  });
  const { data: stats } = useGetDashboardStats();

  const updateSettings = useUpdateUserSettings();
  const updateFnRef = useRef(updateSettings.mutate);
  updateFnRef.current = updateSettings.mutate;

  const [pbKey, setPbKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasKey = (profile as any)?.hasPostBridgeKey;
  const percentUsed = stats ? Math.min(100, Math.round((stats.creditsUsed / stats.creditsTotal) * 100)) : 0;

  const handleSaveKey = () => {
    if (!pbKey.trim()) return;
    setSaving(true);
    updateFnRef.current(
      { data: { postBridgeApiKey: pbKey.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListConnectedPlatformsQueryKey() });
          toast({ title: "Post Bridge connected!", description: "Your social accounts are now available." });
          setPbKey("");
          setSaving(false);
        },
        onError: (err: any) => {
          toast({ title: "Failed to connect", description: err.message, variant: "destructive" });
          setSaving(false);
        },
      }
    );
  };

  const handleRemoveKey = () => {
    setSaving(true);
    updateFnRef.current(
      { data: { postBridgeApiKey: null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListConnectedPlatformsQueryKey() });
          toast({ title: "Post Bridge disconnected" });
          setSaving(false);
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
          setSaving(false);
        },
      }
    );
  };

  const planLabels: Record<string, string> = {
    free: "Free",
    starter: "Starter",
    standard: "Standard",
    pro: "Pro",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-3xl"
    >
      <header className="border-b border-[#222] pb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your account preferences and integrations.</p>
      </header>

      <div className="space-y-6">

        {/* Account Section */}
        <section className="bg-[#111] border border-[#222] rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] bg-[#0a0a0a] flex items-center gap-2">
            <User size={16} className="text-gray-400" />
            <h2 className="text-sm font-medium text-white">Account Details</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-md bg-[#222] flex items-center justify-center border border-[#333] overflow-hidden shrink-0">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">
                    {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user?.fullName || "User"}</h3>
                <p className="text-sm text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
                {profile && (
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-[#222] pt-6">
              <button
                onClick={() => window.open("https://accounts.clerk.com/user", "_blank")}
                className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors border border-[#333] hover:border-gray-500 px-4 py-2 rounded bg-[#0a0a0a]"
              >
                Manage Profile in Clerk <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* Post Bridge Integration */}
        <section className="bg-[#111] border border-[#222] rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] bg-[#0a0a0a] flex items-center gap-2">
            <Key size={16} className="text-gray-400" />
            <h2 className="text-sm font-medium text-white">Post Bridge Integration</h2>
            {hasKey ? (
              <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 size={12} /> Connected
              </span>
            ) : (
              <span className="ml-auto text-xs text-yellow-400 flex items-center gap-1">
                <AlertCircle size={12} /> Not configured
              </span>
            )}
          </div>
          <div className="p-6 space-y-5">
            <p className="text-sm text-gray-400">
              PostMVP uses <a href="https://post-bridge.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Post Bridge</a> to publish to Instagram, TikTok, YouTube, X, LinkedIn, Facebook, Pinterest, Threads, and Bluesky.
              Your accounts are connected and verified by Post Bridge — PostMVP never handles your social passwords or tokens.
            </p>

            {hasKey ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-green-300 bg-green-950/20 border border-green-900 rounded px-4 py-3">
                  <CheckCircle2 size={16} />
                  <span>Post Bridge API key is active. Your social accounts are live.</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="https://app.post-bridge.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm border border-[#333] text-gray-300 hover:text-white px-4 py-2 rounded transition-colors"
                  >
                    Open Post Bridge Dashboard <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={handleRemoveKey}
                    disabled={saving}
                    className="text-sm text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-4 py-2 rounded transition-colors disabled:opacity-50"
                  >
                    {saving ? "Removing…" : "Remove Key"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ol className="text-sm text-gray-300 space-y-1.5 list-decimal list-inside">
                  <li>Sign up at <a href="https://post-bridge.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">post-bridge.com</a></li>
                  <li>Connect your social accounts on their dashboard</li>
                  <li>Go to <a href="https://post-bridge.com/dashboard/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Settings › API Keys</a> and enable API access ($5/mo add-on)</li>
                  <li>Paste your key below</li>
                </ol>

                <div className="space-y-2">
                  <label className="block text-xs text-gray-500 uppercase tracking-wider">Post Bridge API Key</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKey ? "text" : "password"}
                        value={pbKey}
                        onChange={(e) => setPbKey(e.target.value)}
                        placeholder="pb_live_xxxxxxxxxxxxxxxx"
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 pr-10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <button
                      onClick={handleSaveKey}
                      disabled={!pbKey.trim() || saving}
                      className="px-4 py-2 bg-white text-black text-sm font-bold rounded hover:bg-gray-200 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {saving ? "Verifying…" : "Connect"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">The key is verified against the Post Bridge API before being saved.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Subscription Section */}
        <section className="bg-[#111] border border-[#222] rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-[#222] bg-[#0a0a0a] flex items-center gap-2">
            <CreditCard size={16} className="text-gray-400" />
            <h2 className="text-sm font-medium text-white">Subscription & Usage</h2>
          </div>
          <div className="p-6 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Plan</p>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg">
                    {planLabels[profile?.plan ?? "free"] ?? "Free"}
                  </span>
                  <span className="text-xs border border-[#333] text-gray-400 px-2 py-0.5 rounded-full">
                    {profile?.plan ?? "free"}
                  </span>
                </div>
              </div>
            </div>

            {stats && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Usage</p>
                  <p className="text-xs text-gray-400 font-mono">{stats.creditsUsed} / {stats.creditsTotal}</p>
                </div>
                <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${percentUsed > 90 ? "bg-red-500" : percentUsed > 70 ? "bg-yellow-500" : "bg-white"}`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{percentUsed}% used this billing period</p>
              </div>
            )}
          </div>
        </section>

        {/* Sign Out */}
        <section className="bg-[#111] border border-[#222] rounded-md overflow-hidden">
          <div className="p-6">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </section>

      </div>
    </motion.div>
  );
}

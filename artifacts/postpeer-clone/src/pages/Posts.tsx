import { useState, useRef } from "react";
import { useListPosts, useDeletePost, getListPostsQueryKey, ListPostsStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Trash2, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube, FaPinterest } from "react-icons/fa";
import { SiBluesky, SiThreads } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

type TabId = "all" | "published" | "scheduled" | "failed";

export default function Posts() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const statusParam = activeTab === "all" ? undefined : activeTab as ListPostsStatus;
  
  const { data, isLoading } = useListPosts(
    { status: statusParam },
    { query: { queryKey: getListPostsQueryKey({ status: statusParam }) } }
  );
  
  const deletePost = useDeletePost();
  const deleteFnRef = useRef(deletePost.mutate);
  deleteFnRef.current = deletePost.mutate;

  const handleDelete = () => {
    if (!deleteId) return;
    
    deleteFnRef.current(
      { id: deleteId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
          toast({ title: "Post deleted" });
          setDeleteId(null);
        },
        onError: (err: any) => {
          toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
          setDeleteId(null);
        }
      }
    );
  };

  const tabs = [
    { id: "all", label: "All Posts" },
    { id: "published", label: "Published" },
    { id: "scheduled", label: "Scheduled" },
    { id: "failed", label: "Failed" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header>
        <h1 className="text-2xl font-bold text-white mb-1">Posts</h1>
        <p className="text-gray-400 text-sm">Manage your content history and schedule.</p>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#222]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? "border-white text-white" 
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-[#222] rounded-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-500 flex flex-col items-center justify-center">
            <RefreshCw size={24} className="animate-spin mb-3 text-gray-400" />
            Loading posts...
          </div>
        ) : !data?.posts.length ? (
          <div className="p-16 text-center border-b border-[#222]">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4 border border-[#333]">
              <AlertCircle size={24} className="text-gray-500" />
            </div>
            <h3 className="text-white text-base font-medium mb-2">No posts found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              {activeTab === 'all' 
                ? "You haven't created any posts yet. Start composing to see your content here."
                : `No posts found with status '${activeTab}'.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#222] bg-[#0a0a0a] text-xs uppercase tracking-wider text-gray-500">
                  <th className="text-left py-4 px-5 font-medium w-[40%]">Content</th>
                  <th className="text-left py-4 px-5 font-medium">Platforms</th>
                  <th className="text-left py-4 px-5 font-medium">Status</th>
                  <th className="text-left py-4 px-5 font-medium">Date</th>
                  <th className="text-right py-4 px-5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.posts.map((post) => (
                  <tr key={post.id} className="border-b border-[#222] last:border-0 hover:bg-[#161616] transition-colors group">
                    <td className="py-4 px-5">
                      <div className="text-gray-200 font-sans max-w-[400px] truncate" title={post.content}>
                        {post.content}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-1 font-mono">ID: {post.id}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex gap-2">
                        {post.platforms.map((p, i) => {
                          const Icon = PlatformIcons[p] || ExternalLink;
                          return (
                            <div key={i} className="w-7 h-7 rounded bg-[#222] flex items-center justify-center text-white" title={p}>
                              <Icon size={12} />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-sm border font-medium ${
                        post.status === 'published' ? 'border-green-900 text-green-400 bg-green-950/30' :
                        post.status === 'scheduled' ? 'border-yellow-900 text-yellow-400 bg-yellow-950/30' :
                        post.status === 'failed' ? 'border-red-900 text-red-400 bg-red-950/30' :
                        'border-gray-800 text-gray-400 bg-gray-900'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          post.status === 'published' ? 'bg-green-400' :
                          post.status === 'scheduled' ? 'bg-yellow-400' :
                          post.status === 'failed' ? 'bg-red-400' :
                          'bg-gray-400'
                        }`}></span>
                        {post.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-400">
                      {post.status === 'scheduled' && post.scheduledAt ? (
                        <>
                          <div className="text-yellow-400">{format(new Date(post.scheduledAt), "MMM d, yyyy")}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{format(new Date(post.scheduledAt), "h:mm a")}</div>
                        </>
                      ) : post.status === 'published' && post.publishedAt ? (
                        <>
                          <div className="text-gray-300">{format(new Date(post.publishedAt), "MMM d, yyyy")}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{format(new Date(post.publishedAt), "h:mm a")}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-gray-300">{format(new Date(post.createdAt), "MMM d, yyyy")}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{format(new Date(post.createdAt), "h:mm a")}</div>
                        </>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={() => setDeleteId(post.id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-[#111] border-[#333] text-white font-mono">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this post? If it is scheduled, it will be cancelled. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button 
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 text-sm text-white hover:bg-[#222] rounded border border-[#333] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              disabled={deletePost.isPending}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deletePost.isPending ? "Deleting..." : "Delete Permanently"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
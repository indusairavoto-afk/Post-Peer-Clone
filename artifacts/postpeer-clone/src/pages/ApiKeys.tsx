import { useState, useRef } from "react";
import { 
  useListApiKeys, 
  useCreateApiKey, 
  useDeleteApiKey,
  getListApiKeysQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Plus, Key as KeyIcon, Copy, Check, Trash2, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ApiKeys() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newKeyData, setNewKeyData] = useState<{name: string, fullKey: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListApiKeys({
    query: { queryKey: getListApiKeysQueryKey() }
  });

  const createMutation = useCreateApiKey();
  const createFnRef = useRef(createMutation.mutate);
  createFnRef.current = createMutation.mutate;

  const deleteMutation = useDeleteApiKey();
  const deleteFnRef = useRef(deleteMutation.mutate);
  deleteFnRef.current = deleteMutation.mutate;

  const handleCreate = () => {
    if (!keyName.trim()) return;
    
    createFnRef.current(
      { data: { name: keyName } },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
          setNewKeyData({ name: res.name, fullKey: res.fullKey });
          setCreateModalOpen(false);
          setKeyName("");
        },
        onError: (err: any) => {
          toast({ title: "Failed to create key", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    
    deleteFnRef.current(
      { id: deleteId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListApiKeysQueryKey() });
          toast({ title: "API key deleted" });
          setDeleteId(null);
        },
        onError: (err: any) => {
          toast({ title: "Failed to delete key", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const copyToClipboard = () => {
    if (newKeyData) {
      navigator.clipboard.writeText(newKeyData.fullKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied to clipboard" });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">API Keys</h1>
          <p className="text-gray-400 text-sm">Manage access keys for the PostPeer API.</p>
        </div>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-white text-black px-4 py-2 text-sm font-bold rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> New API Key
        </button>
      </header>

      <div className="bg-[#111] border border-[#222] rounded-md overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading keys...</div>
        ) : !data?.keys.length ? (
          <div className="p-16 text-center border-b border-[#222]">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4 border border-[#333]">
              <KeyIcon size={24} className="text-gray-500" />
            </div>
            <h3 className="text-white text-base font-medium mb-2">No API keys yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Create an API key to authenticate your programmatic requests to PostPeer.
            </p>
            <button 
              onClick={() => setCreateModalOpen(true)}
              className="text-xs text-black bg-white px-4 py-2 font-bold rounded hover:bg-gray-200"
            >
              Create First Key
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222] bg-[#0a0a0a] text-xs uppercase tracking-wider text-gray-500">
                <th className="text-left py-4 px-5 font-medium">Name</th>
                <th className="text-left py-4 px-5 font-medium">Key Prefix</th>
                <th className="text-left py-4 px-5 font-medium">Created</th>
                <th className="text-left py-4 px-5 font-medium">Last Used</th>
                <th className="text-right py-4 px-5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.keys.map((k) => (
                <tr key={k.id} className="border-b border-[#222] last:border-0 hover:bg-[#161616] transition-colors group">
                  <td className="py-4 px-5 font-medium text-white">{k.name}</td>
                  <td className="py-4 px-5 font-mono text-gray-400">
                    {k.keyPrefix}<span className="tracking-widest opacity-50">••••••••••••</span>
                  </td>
                  <td className="py-4 px-5 text-gray-500">
                    {format(new Date(k.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="py-4 px-5 text-gray-500">
                    {k.lastUsedAt ? format(new Date(k.lastUsedAt), "MMM d, yyyy") : "Never"}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button 
                      onClick={() => setDeleteId(k.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Revoke key"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-[#111] border border-[#222] rounded-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Code2 size={20} className="text-gray-400" />
          <h2 className="text-lg font-medium text-white">Using the API</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Authenticate your requests by including your API key in the Authorization header.
        </p>
        <div className="bg-[#0a0a0a] border border-[#333] rounded p-4 overflow-x-auto relative">
          <div className="absolute top-0 right-0 bg-[#222] text-[10px] text-gray-400 px-2 py-1 rounded-bl border-b border-l border-[#333]">BASH</div>
          <pre className="text-xs text-gray-300 font-mono mt-2">
<span className="text-blue-400">curl</span> -X POST https://api.postpeer.com/v1/posts \<br/>
  -H <span className="text-green-400">"Authorization: Bearer pp_your_api_key_here"</span> \<br/>
  -H <span className="text-green-400">"Content-Type: application/json"</span> \<br/>
  -d <span className="text-yellow-300">'{'{'}
    "content": "Hello world from the API!",
    "platforms": ["twitter", "linkedin"]
  {'}'}'</span>
          </pre>
        </div>
      </div>

      {/* Create Key Modal */}
      <Dialog open={createModalOpen} onOpenChange={(open) => !open && setCreateModalOpen(false)}>
        <DialogContent className="bg-[#111] border-[#333] text-white font-mono">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a name to identify this key in your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input 
              type="text" 
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. Production Server, Zapier Integration"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
              autoFocus
            />
          </div>
          <DialogFooter>
            <button 
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-sm text-white hover:bg-[#222] rounded border border-[#333] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreate}
              disabled={createMutation.isPending || !keyName.trim()}
              className="px-4 py-2 text-sm bg-white text-black rounded hover:bg-gray-200 transition-colors disabled:opacity-50 font-bold"
            >
              {createMutation.isPending ? "Creating..." : "Create Key"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show New Key Modal */}
      <Dialog open={!!newKeyData} onOpenChange={(open) => !open && setNewKeyData(null)}>
        <DialogContent className="bg-[#111] border-[#333] text-white font-mono sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-400 flex items-center gap-2">
              <Check size={18} /> API Key Created
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Please copy your new API key. <strong className="text-white">You will not be able to see it again.</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-xs text-gray-500 mb-2">{newKeyData?.name}</p>
            <div className="bg-[#0a0a0a] border border-[#333] rounded flex items-center overflow-hidden">
              <code className="flex-1 px-3 py-3 text-sm text-yellow-300 overflow-x-auto whitespace-nowrap">
                {newKeyData?.fullKey}
              </code>
              <button 
                onClick={copyToClipboard}
                className="p-3 bg-[#222] hover:bg-[#333] text-white transition-colors border-l border-[#333]"
                title="Copy to clipboard"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <DialogFooter>
            <button 
              onClick={() => setNewKeyData(null)}
              className="w-full px-4 py-2 text-sm bg-white text-black rounded hover:bg-gray-200 font-bold transition-colors"
            >
              I have copied my key
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Key Modal */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-[#111] border-[#333] text-white font-mono">
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to revoke this API key? Any applications using it will immediately lose access.
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
              disabled={deleteMutation.isPending}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Revoking..." : "Revoke Key"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
import { useState } from "react";

export default function SyncSetup({ currentUID, onSync }) {
  const [code, setCode] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyUID = () => {
    navigator.clipboard.writeText(currentUID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = () => {
    if (!code.trim()) return alert("Please enter a sync code");
    if (!code.startsWith("user_")) return alert("Invalid sync code format");
    if (confirm(`Sync to device code: ${code}?\n\nThis will replace your current data view with the synced device's data.`)) {
      localStorage.setItem("spendsmart_uid", code.trim());
      onSync(code.trim());
      setShowInput(false);
      setCode("");
      alert("✅ Synced successfully! Your data will now load.");
    }
  };

  return (
    <div className="bg-[#12121a] border border-white/5 rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">☁️</span>
        <h3 className="text-sm font-semibold text-white">Cloud Sync</h3>
      </div>

      {/* Your Device Code */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Your Device Sync Code:</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <p className="text-xs text-[#b5c99a] font-mono truncate">{currentUID}</p>
          </div>
          <button
            onClick={copyUID}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
              copied
                ? "bg-[#6b7f5a] text-white"
                : "bg-[#4a5d3e] hover:bg-[#3a4d30] text-white"
            }`}
          >
            {copied ? "✅ Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Share this code with your other device to sync data
        </p>
      </div>

      {/* Sync from another device */}
      <div>
        <button
          onClick={() => setShowInput(!showInput)}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm py-2.5 rounded-xl transition"
        >
          {showInput ? "✕ Cancel" : "📲 Sync from another device"}
        </button>

        {showInput && (
          <div className="mt-3 space-y-2">
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6b7f5a] font-mono"
              placeholder="Paste sync code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              onClick={handleSync}
              className="w-full bg-[#4a5d3e] hover:bg-[#3a4d30] text-white font-semibold py-3 rounded-xl transition"
            >
              🔄 Apply Sync Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
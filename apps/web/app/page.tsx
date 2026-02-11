"use client";
import { useState } from "react";
import axios from "axios";

// Use environment variable for production, fallback to localhost for dev
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Home() {
  const [secret, setSecret] = useState('{"amount": 1000, "to": "IronMan"}');
  const [createdId, setCreatedId] = useState("");
  const [lookupId, setLookupId] = useState("");
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt">("encrypt");

  // ACTION: ENCRYPT
  const handleEncrypt = async () => {
    setLoading(true);
    try {
      const payload = JSON.parse(secret);
      const res = await axios.post(`${API_URL}/tx/encrypt`, {
        partyId: "web_user",
        payload,
      });
      setCreatedId(res.data.id);
      setLookupId(res.data.id);
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}\nAPI URL: ${API_URL}`);
    }
    setLoading(false);
  };

  // ACTION: DECRYPT
  const handleDecrypt = async () => {
    setLoading(true);
    setDecryptedData(null);
    try {
      if (!lookupId) return alert("Enter an ID");
      const res = await axios.post(`${API_URL}/tx/${lookupId}/decrypt`);
      setDecryptedData(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      console.error(err);
      setDecryptedData(`Error: ${err.message}\nAPI URL: ${API_URL}`);
    }
    setLoading(false);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white font-sans selection:bg-cyan-500 selection:text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
              AES-256-GCM Encryption
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Mirfa Vault
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Military-grade encryption for your sensitive JSON data. Secure, fast, and tamper-proof.
          </p>
        </header>

        {/* Tab Switcher (Mobile) */}
        <div className="flex md:hidden mb-6 bg-[#1e293b]/50 p-1 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setActiveTab("encrypt")}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${activeTab === "encrypt"
              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
              : "text-slate-400 hover:text-white"
              }`}
          >
            Encrypt
          </button>
          <button
            onClick={() => setActiveTab("decrypt")}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${activeTab === "decrypt"
              ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
              : "text-slate-400 hover:text-white"
              }`}
          >
            Decrypt
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* ENCRYPT CARD */}
          <div
            className={`relative group ${activeTab !== "encrypt" ? "hidden md:block" : ""}`}
          >
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm" />
            <div className="relative bg-[#111827] border border-slate-800 p-6 md:p-8 rounded-2xl h-full flex flex-col">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                  <svg
                    className="w-6 h-6 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Encrypt</h2>
                  <p className="text-slate-500 text-sm">Secure your payload</p>
                </div>
              </div>

              {/* Input */}
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 block">
                JSON Payload
              </label>
              <textarea
                className="w-full bg-[#0a0f1a] border border-slate-800 rounded-xl p-4 text-cyan-300 font-mono text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition h-36 resize-none mb-4 placeholder-slate-600"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                spellCheck="false"
                placeholder='{"key": "value"}'
              />

              {/* Encrypt Button */}
              <button
                onClick={handleEncrypt}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Encrypt & Store
                  </>
                )}
              </button>

              {/* Success Result */}
              {createdId && (
                <div className="mt-6 p-4 bg-green-500/5 border border-green-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Transaction ID
                    </span>
                    <button
                      onClick={() => copyToClipboard(createdId)}
                      className="text-slate-400 hover:text-white transition p-1"
                      title="Copy ID"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <code className="text-white font-mono text-sm break-all block bg-black/20 p-2 rounded-lg">
                    {createdId}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* DECRYPT CARD */}
          <div
            className={`relative group ${activeTab !== "decrypt" ? "hidden md:block" : ""}`}
          >
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm" />
            <div className="relative bg-[#111827] border border-slate-800 p-6 md:p-8 rounded-2xl h-full flex flex-col">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                  <svg
                    className="w-6 h-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Decrypt</h2>
                  <p className="text-slate-500 text-sm">Retrieve your data</p>
                </div>
              </div>

              {/* Input */}
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 block">
                Transaction ID
              </label>
              <input
                type="text"
                className="w-full bg-[#0a0f1a] border border-slate-800 rounded-xl p-4 text-purple-300 font-mono text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition mb-4 placeholder-slate-600"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Enter transaction ID..."
              />

              {/* Decrypt Button */}
              <button
                onClick={handleDecrypt}
                disabled={loading || !lookupId}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Decrypting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Decrypt & Reveal
                  </>
                )}
              </button>

              {/* Decrypted Result */}
              {decryptedData && (
                <div
                  className={`mt-6 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300 ${decryptedData.includes("Failed")
                    ? "bg-red-500/5 border border-red-500/20"
                    : "bg-purple-500/5 border border-purple-500/20"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${decryptedData.includes("Failed") ? "text-red-400" : "text-purple-400"
                        }`}
                    >
                      {decryptedData.includes("Failed") ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Error
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Decrypted Payload
                        </>
                      )}
                    </span>
                    {!decryptedData.includes("Failed") && (
                      <button
                        onClick={() => copyToClipboard(decryptedData)}
                        className="text-slate-400 hover:text-white transition p-1"
                        title="Copy"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <pre
                    className={`font-mono text-sm break-all whitespace-pre-wrap bg-black/20 p-3 rounded-lg max-h-48 overflow-auto ${decryptedData.includes("Failed") ? "text-red-300" : "text-white"
                      }`}
                  >
                    {decryptedData}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 text-slate-500 text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              256-bit AES-GCM
            </span>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <span>End-to-end encrypted</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <span>Zero-knowledge storage</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
"use client";
import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3001";

export default function Home() {
  const [secret, setSecret] = useState('{"amount": 1000, "to": "IronMan"}');
  const [createdId, setCreatedId] = useState("");
  const [lookupId, setLookupId] = useState("");
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ACTION: ENCRYPT
  const handleEncrypt = async () => {
    setLoading(true);
    try {
      const payload = JSON.parse(secret);
      const res = await axios.post(`${API_URL}/tx/encrypt`, {
        partyId: "web_user",
        payload
      });
      setCreatedId(res.data.id);
      setLookupId(res.data.id); 
    } catch (err) {
      alert("Error: Invalid JSON or Server Down");
    }
    setLoading(false);
  };

  // ACTION: DECRYPT
  const handleDecrypt = async () => {
    setLoading(true);
    try {
      if (!lookupId) return alert("Enter an ID");
      const res = await axios.post(`${API_URL}/tx/${lookupId}/decrypt`);
      setDecryptedData(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setDecryptedData("Decryption Failed: Integrity Check Failed or Wrong ID");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-cyan-500 selection:text-white">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        
        <div className="text-center mb-16">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold tracking-widest border border-cyan-500/20 mb-4 inline-block">
            AES-256-GCM POWERED
          </span>
          <h1 className="text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Mirfa Secure Vault
          </h1>
          <p className="text-slate-400 text-lg">
            Bank-grade encryption for your JSON data.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ENCRYPT CARD */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <div className="relative bg-[#1e293b] border border-slate-700 p-8 rounded-2xl h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Encrypt Data</h2>
              </div>

              <label className="text-sm text-slate-400 font-medium mb-2 block">Secret Payload (JSON)</label>
              <textarea 
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-4 text-cyan-300 font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition h-40 resize-none mb-6"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                spellCheck="false"
              />

              <button 
                onClick={handleEncrypt}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Processing..." : "Encrypt & Store"}
              </button>

              {createdId && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-fade-in">
                  <p className="text-green-400 text-xs font-bold uppercase tracking-wider mb-1">Success • Transaction ID</p>
                  <p className="text-white font-mono break-all text-sm">{createdId}</p>
                </div>
              )}
            </div>
          </div>

          {/* DECRYPT CARD */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <div className="relative bg-[#1e293b] border border-slate-700 p-8 rounded-2xl h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Decrypt Data</h2>
              </div>

              <label className="text-sm text-slate-400 font-medium mb-2 block">Transaction ID</label>
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-4 text-white font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="tx_12345..."
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                />
              </div>

              <button 
                onClick={handleDecrypt}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 mb-6"
              >
                {loading ? "Processing..." : "Retrieve Secret"}
              </button>

              <div className="flex-1 bg-[#0f172a] rounded-xl border border-slate-800 p-4 relative overflow-hidden group/console">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />
                 
                 {!decryptedData ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                      <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                      <p className="text-sm">Waiting for input...</p>
                   </div>
                 ) : (
                   <pre className={`font-mono text-sm overflow-auto h-40 ${decryptedData.includes("Failed") ? "text-red-400" : "text-emerald-400"}`}>
                     {decryptedData}
                   </pre>
                 )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
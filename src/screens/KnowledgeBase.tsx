import * as React from "react";
import { motion } from "motion/react";
import { SectionHeader } from "../components/SectionHeader";
import { MetricCard } from "../components/MetricCard";
import { Card } from "../components/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FileText, Upload, Search, Filter, Database, Zap, BookOpen, Clock, Activity, MoreVertical, Send, Loader2, Trash2 } from "lucide-react";
import { IconButton } from "../components/ui/IconButton";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { useAppStore, Document } from "../store";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const KnowledgeBase = () => {
  const { documents, setDocuments } = useAppStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [chatMessages, setChatMessages] = React.useState<{ role: "user" | "model"; text: string }[]>([
    { role: "model", text: "Hello! I'm your Knowledge Base assistant. Ask me anything about the documents you've uploaded." }
  ]);
  const [inputMessage, setInputMessage] = React.useState("");
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDocs: Document[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;
        
      const doc: Document = {
        name: file.name,
        size: sizeStr,
        chunks: Math.ceil(file.size / 500), // Mock chunks
        status: "Syncing",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        type: file.type
      };

      try {
        // Read file content
        if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
          doc.textContent = await file.text();
          doc.status = "Active";
        } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = "";
          for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const content = await page.getTextContent();
            const pageText = content.items.map((item: any) => item.str).join(" ");
            fullText += pageText + "\n";
          }
          doc.textContent = fullText;
          doc.status = "Active";
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
          // Parse DOCX using mammoth
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
          doc.textContent = result.value;
          doc.status = "Active";
        } else {
          // Fallback
          doc.textContent = await file.text();
          doc.status = "Active";
        }
        newDocs.push(doc);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        doc.status = "Error";
        newDocs.push(doc);
      }
    }

    setDocuments(prev => [...prev, ...newDocs]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:*/*;base64, prefix
        resolve(base64.split(",")[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleDeleteDocument = (name: string) => {
    setDocuments(prev => prev.filter(doc => doc.name !== name));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setChatMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInputMessage("");
    setIsChatLoading(true);

    try {
      let contextDocs = "";
      documents.forEach(doc => {
        if (doc.status !== "Active") return;
        if (doc.textContent) {
          contextDocs += `Document [${doc.name}]:\n${doc.textContent}\n\n`;
        }
      });

      const systemPrompt = `You are a professional customer support assistant. Answer using ONLY the provided documents.

RESPONSE RULES:
- Read the customer's message carefully. If they provide specific details about their situation (e.g., "I already opened it", "I used it once"), acknowledge that detail directly in your answer.
- ALWAYS start with a direct, empathetic one-liner that addresses their specific situation (e.g., "Unfortunately, since the item has been unpacked, it may affect your return eligibility.").
- Do NOT list general conditions if the customer has already told you their situation — instead, apply the policy to their case and give them a clear yes/no/maybe answer.
- If the answer is "no" based on their situation, say so politely but clearly. Do not leave them guessing.
- Only list conditions or steps if they are still relevant to the customer's specific case.
- Be concise, warm, and human. Under 100 words preferred.
- End with: "Let me know if you need anything else!" or offer next steps if relevant.
- Never show ** or * markdown. Use plain dashes (-) for any lists.
- If the answer is not in the documents, say: "I don't have that information. Please contact our support team."
- Never make up information.

Context Documents:
${contextDocs}`;

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...chatMessages.map(m => ({ role: m.role === "model" ? "assistant" : "user", content: m.text })),
            { role: "user", content: userMessage }
          ]
        })
      });
      
      if (!response.ok) throw new Error("Backend error");
      const data = await response.json();
      
      setChatMessages(prev => [...prev, { role: "model", text: data.reply }]);
    } catch (error) {
      console.error("Error calling API:", error);
      setChatMessages(prev => [...prev, { role: "model", text: "Sorry, I encountered an error while processing your request." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-8 max-w-[1400px] mx-auto"
    >
      <SectionHeader 
        title="Knowledge Base &amp; Chatbot" 
        subtitle="Manage the documents that power your AI Agent and test them in real-time."
      />

      <div className="grid grid-cols-3 gap-6 mb-8">
        <MetricCard label="Total Documents" value={documents.length.toString()} icon={<Database size={16} />} />
        <MetricCard label="Knowledge Chunks" value={documents.reduce((acc, doc) => acc + doc.chunks, 0).toString()} icon={<Zap size={16} className="text-brand" />} />
        <MetricCard label="Last Sync" value="Just now" icon={<Clock size={16} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document List */}
        <div className="lg:col-span-2">
          <Card variant="noPad">
            <div className="p-4 border-b border-border-faint flex items-center justify-between bg-bg-elevated/50">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                <input 
                  type="text" 
                  placeholder="Search documentation..."
                  className="w-full bg-bg border border-border-mid rounded-lg h-9 pl-9 pr-3 text-[12px] outline-none text-text-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <IconButton><Filter size={14} /></IconButton>
              </div>
            </div>
            
            <div className="divide-y divide-border-faint max-h-[400px] overflow-y-auto">
              {filteredDocuments.map((doc, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-surface-high/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border-strong flex items-center justify-center text-text-muted group-hover:text-brand">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-text-primary">{doc.name}</h4>
                      <p className="text-[11px] text-text-muted mt-0.5 font-mono">{doc.size} • {doc.chunks} chunks</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <span className="text-[11px] text-text-muted font-mono">{doc.date}</span>
                    <Badge variant={doc.status === "Active" ? "success" : doc.status === "Syncing" ? "warn" : doc.status === "Error" ? "danger" : "default"} size="xs">
                      {doc.status}
                    </Badge>
                    <div className="flex gap-2">
                      <IconButton onClick={() => handleDeleteDocument(doc.name)}>
                        <Trash2 size={14} className="text-text-muted hover:text-red-500" />
                      </IconButton>
                      <IconButton><MoreVertical size={14} /></IconButton>
                    </div>
                  </div>
                </div>
              ))}
              {filteredDocuments.length === 0 && (
                <div className="p-8 text-center text-text-muted text-[13px]">
                  No documents found.
                </div>
              )}
            </div>
          </Card>

          {/* Upload Card */}
          <div className="mt-6">
            <div onClick={() => fileInputRef.current?.click()}>
              <Card className="border-dashed border-2 border-border-strong bg-brand-faint/5 group hover:border-brand/40 transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-faint flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={20} />
                  </div>
                  <h3 className="text-[14px] font-bold text-text-primary">Upload New Sources</h3>
                  <p className="text-[12px] text-text-muted mt-1 px-4">Drag and drop PDF, TXT, MD, or DOCX files to train your agent.</p>
                  <Button size="sm" variant="primary" className="mt-4">Select Files</Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept=".pdf,.txt,.md,.docx"
                    onChange={handleFileUpload}
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Chatbot Sidebar */}
        <div className="space-y-6">
          <Card className="h-[550px] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-border-faint pb-3">
              <div>
                <h3 className="text-[14px] font-bold text-text-primary">KB Assistant</h3>
                <p className="text-[11px] text-text-muted">Answers based on uploaded data</p>
              </div>
              <Activity size={14} className="text-brand" />
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2 text-[12px]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-brand text-white rounded-br-none' 
                      : 'bg-surface border border-border-strong text-text-primary rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-border-strong text-text-primary p-3 rounded-lg rounded-bl-none flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-brand" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2 border-t border-border-faint pt-3">
              <input 
                type="text" 
                placeholder="Ask a question..."
                className="flex-1 bg-bg border border-border-mid rounded-lg h-9 px-3 text-[12px] outline-none text-text-primary"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isChatLoading}
              />
              <Button 
                variant="primary"
                size="sm"
                onClick={handleSendMessage}
                disabled={isChatLoading || !inputMessage.trim()}
              >
                <Send size={14} />
              </Button>
            </div>
          </Card>

          <Card variant="glow" className="bg-gradient-to-br from-brand-faint to-surface border-brand/20">
             <div className="flex items-start gap-4">
               <BookOpen size={18} className="text-brand flex-shrink-0" />
               <div>
                  <h4 className="text-[13px] font-bold text-text-primary">V1 Pilot Note</h4>
                  <p className="text-[12px] text-text-second mt-1 leading-relaxed">
                    This chatbot uses OpenAI GPT-4o-mini to answer questions. It reads the text of `.txt`, `.md`, and `.docx` files.
                  </p>
               </div>
             </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

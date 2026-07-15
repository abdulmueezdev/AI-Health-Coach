"use client"

declare global {
  interface Window {
    responsiveVoice?: {
      speak: (text: string, voice: string, parameters?: object) => void;
      cancel: () => void;
      pause: () => void;
      resume: () => void;
    };
  }
}
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, Square, Send, RotateCcw } from "lucide-react"
import { askCoach } from "@/server/actions/coach"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function CoachChat({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Hi there! I'm Vitalis. How can I help you with your fitness journey today?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const responseText = await askCoach(userMsg.content, userId)
      const coachMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: responseText }
      setMessages(prev => [...prev, coachMsg])
    } catch (error) {
      console.error("Failed to get response:", error)
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, I'm having trouble connecting right now." }])
    } finally {
      setLoading(false)
    }
  }

  // Voice controls
  const playVoice = (text: string, id: string) => {
    if (typeof window !== "undefined" && window.responsiveVoice) {
      if (playingId === id) {
        window.responsiveVoice.resume()
      } else {
        window.responsiveVoice.cancel()
        setPlayingId(id)
        window.responsiveVoice.speak(text, "US English Female", {
          onend: () => setPlayingId(null)
        })
      }
    }
  }

  const pauseVoice = () => {
    if (typeof window !== "undefined" && window.responsiveVoice) {
      window.responsiveVoice.pause()
      setPlayingId(null) // Resetting ID so UI shows play button again, though it's technically paused
    }
  }

  const stopVoice = () => {
    if (typeof window !== "undefined" && window.responsiveVoice) {
      window.responsiveVoice.cancel()
      setPlayingId(null)
    }
  }

  const replayVoice = (text: string, id: string) => {
    stopVoice()
    setTimeout(() => playVoice(text, id), 100)
  }

  return (
    <div className="flex flex-col h-[600px] w-full bg-gray-50/30">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white
                  ${msg.role === "user" ? "bg-gray-800" : "bg-accent-primary font-comico"}
                `}>
                  {msg.role === "user" ? "U" : "V"}
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className={`p-4 rounded-2xl ${
                    msg.role === "user" 
                      ? "bg-text-primary text-white rounded-tr-none" 
                      : "bg-white border border-gray-100 shadow-sm text-text-primary rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                  
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => playVoice(msg.content, msg.id)}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-text-secondary transition-colors"
                        title="Play"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={pauseVoice}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-text-secondary transition-colors"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={stopVoice}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-text-secondary transition-colors"
                        title="Stop"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => replayVoice(msg.content, msg.id)}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-text-secondary transition-colors"
                        title="Replay"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 max-w-[80%] flex-row">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white bg-accent-primary font-comico">
                  V
                </div>
                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-text-primary rounded-tl-none flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Vitalis anything..."
            className="flex-1 rounded-full h-12 bg-gray-50 border-transparent focus:bg-white"
            disabled={loading}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-full p-0 flex items-center justify-center"
          >
            <Send className="w-5 h-5 -ml-1" />
          </Button>
        </form>
      </div>
    </div>
  )
}

"use client"

import React, { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Monitor,
    Share2,
    MessageSquare,
    Users,
    Settings,
    PhoneOff,
    Send,
    Brush,
    Eraser,
    Trash2,
    Camera,
    FolderKanban,
    AlertCircle,
    Maximize2,
    BadgeAlert,
    Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function LiveMeetingRoom() {
    const params = useParams()
    const router = useRouter()
    const sessionId = params?.sessionId as string

    // Audio/Video control states
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    const [activeTab, setActiveTab] = useState<"CHAT" | "PEOPLE" | "WHITEBOARD">("CHAT")

    // Chat states
    const [messages, setMessages] = useState([
        { sender: "System", text: "Welcome to YIF Capital Escrow Meeting Room. Attendance has been logged.", time: "14:00" },
        { sender: "Dr. Elirehema Kitundu", text: "Habari! Glad you could make it today. Let's start with your DSE portfolio review.", time: "14:02" }
    ])
    const [messageInput, setMessageInput] = useState("")

    // Participants list
    const [participants, setParticipants] = useState([
        { name: "Dr. Elirehema Kitundu", role: "Expert (Host)", active: true, muted: false, video: true },
        { name: "John Mwangi (You)", role: "Learner", active: true, muted: false, video: true }
    ])

    // Whiteboard Canvas refs & states
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [brushColor, setBrushColor] = useState("#D4AF37") // Gold accent
    const [brushWidth, setBrushWidth] = useState(3)
    const [tool, setTool] = useState<"BRUSH" | "ERASER">("BRUSH")

    // Setup attendance logging
    useEffect(() => {
        const timer = setTimeout(() => {
            toast.success("Attendance verified! Escrow confirmation sent to smart contract.")
        }, 4000)
        return () => clearTimeout(timer)
    }, [])

    // Initialize Canvas settings on mount/tab change
    useEffect(() => {
        if (activeTab === "WHITEBOARD" && canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = canvas.parentElement?.clientWidth || 600
            canvas.height = 450
            const ctx = canvas.getContext("2d")
            if (ctx) {
                ctx.lineCap = "round"
                ctx.lineJoin = "round"
                ctx.strokeStyle = brushColor
                ctx.lineWidth = brushWidth
            }
        }
    }, [activeTab])

    // Drawing logic
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const ctx = canvas.getContext("2d")
        if (ctx) {
            ctx.beginPath()
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
            setIsDrawing(true)
        }
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const ctx = canvas.getContext("2d")
        if (ctx) {
            ctx.strokeStyle = tool === "ERASER" ? "#0F172A" : brushColor // Eraser matches bg-slate-900
            ctx.lineWidth = tool === "ERASER" ? 20 : brushWidth
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
            ctx.stroke()
        }
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clearWhiteboard = () => {
        if (!canvasRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (ctx) {
            ctx.fillStyle = "#0F172A"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            toast.info("Whiteboard cleared")
        }
    }

    // Chat action
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!messageInput.trim()) return

        const now = new Date()
        const timeString = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

        setMessages((prev) => [
            ...prev,
            { sender: "John Mwangi (You)", text: messageInput, time: timeString }
        ])
        setMessageInput("")

        // Auto answer simulation
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { sender: "Dr. Elirehema Kitundu", text: "Excellent point. I have noted that down in our dashboard notes.", time: timeString }
            ])
        }, 1500)
    }

    const handleLeaveSession = () => {
        toast.success("You have disconnected from the live session.")
        router.push("/lms/bookings")
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Session Top Bar */}
            <header className="h-16 bg-slate-900 border-b border-white/10 px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">Escrow Meeting Room</h1>
                        <span className="text-[10px] text-white/50 font-mono">Session ID: {sessionId || "1"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                        Active Escrow Secured
                    </Badge>
                    <Badge variant="outline" className="border-white/10 text-white/70">
                        {participants.length} connected
                    </Badge>
                </div>
            </header>

            {/* Main Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Area: Streams and Drawing board */}
                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                    {activeTab !== "WHITEBOARD" ? (
                        /* ================= VIDEOS PANEL ================= */
                        <div className="grid gap-6 md:grid-cols-2 flex-1">
                            {/* Expert Stream Box */}
                            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 aspect-video flex flex-col justify-between">
                                {/* Simulated Webcam Video background styling */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950/20 flex items-center justify-center">
                                    <div className="text-center space-y-2">
                                        <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-2xl mx-auto">
                                            EK
                                        </div>
                                        <p className="text-xs text-white/50">Dr. Elirehema Kitundu Stream</p>
                                    </div>
                                </div>

                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-slate-950/80 text-white border-white/10">Host</Badge>
                                </div>

                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                    <span className="text-xs font-semibold bg-slate-950/80 px-2.5 py-1 rounded-md">
                                        Dr. Elirehema Kitundu
                                    </span>
                                </div>
                            </div>

                            {/* Learner Stream Box (Self) */}
                            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 aspect-video flex flex-col justify-between">
                                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950/20 flex items-center justify-center">
                                    {isVideoOff ? (
                                        <div className="text-center space-y-2">
                                            <VideoOff className="h-10 w-10 text-white/20 mx-auto" />
                                            <p className="text-xs text-white/40">Your Video is Off</p>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-2 animate-pulse">
                                            <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-2xl mx-auto">
                                                JM
                                            </div>
                                            <p className="text-xs text-white/50">Your Webcam Active</p>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-slate-950/80 text-emerald-400 border-white/10">You</Badge>
                                </div>

                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                    <span className="text-xs font-semibold bg-slate-950/80 px-2.5 py-1 rounded-md">
                                        John Mwangi
                                    </span>
                                    {isMuted && <MicOff className="h-4 w-4 text-red-500" />}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ================= WHITEBOARD CANVAS PANEL ================= */
                        <Card className="bg-slate-900 border-white/10 text-white flex flex-col flex-1 overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 py-3">
                                <div>
                                    <CardTitle className="text-sm">Collaborative Whiteboard</CardTitle>
                                    <CardDescription className="text-[11px] text-white/50">Sketch structures, workflows, and diagrams together.</CardDescription>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        size="sm"
                                        variant={tool === "BRUSH" ? "default" : "ghost"}
                                        onClick={() => setTool("BRUSH")}
                                        className={tool === "BRUSH" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                    >
                                        <Brush className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={tool === "ERASER" ? "default" : "ghost"}
                                        onClick={() => setTool("ERASER")}
                                        className={tool === "ERASER" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                    >
                                        <Eraser className="h-4 w-4" />
                                    </Button>
                                    <div className="h-4 w-px bg-white/10 mx-1" />
                                    {/* Color Dots */}
                                    {["#D4AF37", "#10B981", "#3B82F6", "#EF4444", "#FFFFFF"].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                setBrushColor(color)
                                                setTool("BRUSH")
                                            }}
                                            className={`h-4.5 w-4.5 rounded-full border border-white/20 transition-all ${
                                                brushColor === color && tool === "BRUSH" ? "scale-125 ring-1 ring-emerald-500" : ""
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <div className="h-4 w-px bg-white/10 mx-1" />
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={clearWhiteboard}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 relative bg-slate-950">
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    className="cursor-crosshair w-full block"
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Side Bar: Chat, People, Shared files panel */}
                <aside className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col">
                    {/* Tabs Headers */}
                    <div className="flex border-b border-white/10">
                        {["CHAT", "PEOPLE", "WHITEBOARD"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 py-3.5 text-xs font-semibold border-b-2 transition-all ${
                                    activeTab === tab
                                        ? "border-emerald-500 text-emerald-400 bg-white/5"
                                        : "border-transparent text-white/60 hover:text-white"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Chat Panel */}
                    {activeTab === "CHAT" && (
                        <div className="flex-1 flex flex-col justify-between overflow-hidden">
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex flex-col space-y-1 ${
                                            msg.sender === "System" ? "items-center" : "items-start"
                                        }`}
                                    >
                                        {msg.sender !== "System" && (
                                            <span className="text-[10px] text-white/55 font-bold">
                                                {msg.sender}
                                            </span>
                                        )}
                                        <div
                                            className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                                                msg.sender === "System"
                                                    ? "bg-slate-800/40 text-emerald-400 text-center border border-emerald-500/10 italic w-full"
                                                    : msg.sender.includes("You")
                                                    ? "bg-emerald-600 text-white rounded-tr-none ml-auto"
                                                    : "bg-slate-800 text-white/95 rounded-tl-none"
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                        {msg.sender !== "System" && (
                                            <span className="text-[9px] text-white/30 self-end">
                                                {msg.time}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-slate-950 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type message..."
                                    className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                />
                                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                    <Send className="h-4.5 w-4.5" />
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* People List Panel */}
                    {activeTab === "PEOPLE" && (
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {participants.map((person, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8.5 w-8.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                                            {person.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold">{person.name}</h4>
                                            <span className="text-[9px] text-white/40 block">{person.role}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px]">
                                            Connected
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Mini whiteboard config drawer fallback inside tabs */}
                    {activeTab === "WHITEBOARD" && (
                        <div className="flex-1 p-4 space-y-4 text-xs text-white/60 leading-relaxed">
                            <h4 className="font-semibold text-white">Whiteboard Instructions</h4>
                            <p>
                                1. Draw using left mouse click drag inside the central panel.
                                <br />
                                2. Switch colors using the color circles above.
                                <br />
                                3. Use the eraser tool to wipe specific lines, or trash icon to empty the canvas.
                            </p>
                            <div className="bg-slate-800/40 p-3 rounded border border-white/5 space-y-1">
                                <span className="text-white font-semibold block">Brush Width</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={brushWidth}
                                    onChange={(e) => setBrushWidth(Number(e.target.value))}
                                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Bottom Actions Tray Controls */}
            <div className="h-20 bg-slate-900 border-t border-white/10 px-6 flex items-center justify-between">
                <div>
                    <span className="text-xs text-white/50 block">Subject Topic</span>
                    <span className="text-sm font-semibold text-white">DSE Valuation Review</span>
                </div>

                {/* Central Media Controls */}
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsMuted(!isMuted)}
                        variant={isMuted ? "destructive" : "outline"}
                        className={`h-11 w-11 rounded-full p-0 ${!isMuted ? "border-white/10 text-white hover:bg-white/5" : ""}`}
                    >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>

                    <Button
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        variant={isVideoOff ? "destructive" : "outline"}
                        className={`h-11 w-11 rounded-full p-0 ${!isVideoOff ? "border-white/10 text-white hover:bg-white/5" : ""}`}
                    >
                        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </Button>

                    <Button
                        onClick={() => {
                            setIsScreenSharing(!isScreenSharing)
                            toast.info(isScreenSharing ? "Screen sharing stopped." : "Screen sharing active.")
                        }}
                        variant={isScreenSharing ? "default" : "outline"}
                        className={`h-11 w-11 rounded-full p-0 bg-transparent ${isScreenSharing ? "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700" : "border-white/10 text-white hover:bg-white/5"}`}
                    >
                        <Monitor className="h-5 w-5" />
                    </Button>

                    <div className="h-6 w-px bg-white/10 mx-2" />

                    <Button
                        onClick={handleLeaveSession}
                        variant="destructive"
                        className="h-11 rounded-full px-5 flex items-center gap-1.5 font-semibold text-xs"
                    >
                        <PhoneOff className="h-4.5 w-4.5" /> Disconnect
                    </Button>
                </div>

                <div className="text-right hidden sm:block">
                    <span className="text-xs text-white/55 block">Meeting Elapsed</span>
                    <span className="text-sm font-mono text-emerald-400 font-bold">14:04 / 60:00</span>
                </div>
            </div>
        </div>
    )
}

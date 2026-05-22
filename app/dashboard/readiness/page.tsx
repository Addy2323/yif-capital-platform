"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    Trophy,
    TrendingUp,
    Target,
    AlertCircle,
    BookOpen,
    ArrowRight,
    BarChart3,
    Shield,
    Zap,
    Clock,
    DollarSign,
    Percent,
    Star
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Quiz Questions — Tanzania Investment Context
const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "How would you describe your current knowledge of the Dar es Salaam Stock Exchange (DSE)?",
        options: [
            { text: "I've never heard of it before", points: 2 },
            { text: "I know it exists but don't understand it", points: 4 },
            { text: "I have a basic understanding of how it works", points: 7 },
            { text: "I actively follow DSE listed companies and indices", points: 10 }
        ]
    },
    {
        id: 2,
        question: "How much of your monthly income are you currently saving or investing?",
        options: [
            { text: "I don't save regularly", points: 2 },
            { text: "Less than 10%", points: 4 },
            { text: "Between 10% and 25%", points: 7 },
            { text: "More than 25%", points: 10 }
        ]
    },
    {
        id: 3,
        question: "What is your experience with Tanzania's Government Bonds (e.g., Treasury Bills, Treasury Bonds)?",
        options: [
            { text: "I've never invested in bonds", points: 2 },
            { text: "I've heard about them but don't know how to buy", points: 4 },
            { text: "I understand the bidding process on the BoT auction", points: 7 },
            { text: "I currently hold Treasury Bonds/Bills in my portfolio", points: 10 }
        ]
    },
    {
        id: 4,
        question: "How do you typically react to sudden drops in your investments?",
        options: [
            { text: "I would immediately sell to avoid further loss", points: 2 },
            { text: "I'd feel very anxious and consider selling", points: 4 },
            { text: "I would hold and wait for recovery", points: 7 },
            { text: "I would buy more at the lower price", points: 10 }
        ]
    },
    {
        id: 5,
        question: "Which best describes your primary investment time horizon?",
        options: [
            { text: "I need my money back within 3 months", points: 2 },
            { text: "6 months to 1 year", points: 4 },
            { text: "1-5 years", points: 7 },
            { text: "More than 5 years (long-term wealth building)", points: 10 }
        ]
    },
    {
        id: 6,
        question: "Are you familiar with SACCOs (Savings and Credit Cooperative Organizations) in Tanzania?",
        options: [
            { text: "No, I don't know what they are", points: 2 },
            { text: "I've heard of them but never joined one", points: 4 },
            { text: "I am a member of a SACCO", points: 7 },
            { text: "I actively manage or invest through a SACCO", points: 10 }
        ]
    },
    {
        id: 7,
        question: "How well do you understand investment diversification?",
        options: [
            { text: "I put all my money in one place (e.g., savings account)", points: 2 },
            { text: "I know I should diversify but don't know how", points: 4 },
            { text: "I spread investments across 2-3 asset classes", points: 7 },
            { text: "I have a well-balanced portfolio across stocks, bonds, real estate, and funds", points: 10 }
        ]
    },
    {
        id: 8,
        question: "Do you know what a Unit Trust Fund is (e.g., UTT AMIS)?",
        options: [
            { text: "I have no idea", points: 2 },
            { text: "I've heard of UTT AMIS but don't understand it", points: 4 },
            { text: "I understand how unit trusts work and their NAV pricing", points: 7 },
            { text: "I currently invest in one or more unit trust funds", points: 10 }
        ]
    },
    {
        id: 9,
        question: "How would you rate your understanding of inflation and its impact on savings?",
        options: [
            { text: "I don't think about inflation at all", points: 2 },
            { text: "I know it makes prices go up but haven't factored it", points: 4 },
            { text: "I try to invest at rates higher than inflation", points: 7 },
            { text: "I actively design my portfolio to beat inflation consistently", points: 10 }
        ]
    },
    {
        id: 10,
        question: "What best describes your goal from this learning platform?",
        options: [
            { text: "I want to learn the absolute basics of investing", points: 2 },
            { text: "I want to start investing but need guidance", points: 4 },
            { text: "I want to expand and optimize my current portfolio", points: 7 },
            { text: "I want expert-level strategies for wealth creation and passive income", points: 10 }
        ]
    }
]

// Level classification thresholds
function classifyLevel(score: number): { level: string; color: string; description: string } {
    if (score >= 80) {
        return {
            level: "Advanced",
            color: "text-emerald-400",
            description: "You have strong financial literacy and investment experience. Focus on advanced strategies, portfolio optimization, and alternative investments."
        }
    }
    if (score >= 50) {
        return {
            level: "Intermediate",
            color: "text-amber-400",
            description: "You have a solid foundation but there's room to grow. Build on your knowledge with structured courses on treasury bonds, fund analysis, and risk management."
        }
    }
    return {
        level: "Beginner",
        color: "text-blue-400",
        description: "You're just getting started — that's great! We recommend beginning with the basics of personal finance, understanding DSE, and learning about SACCOs."
    }
}

// Suggested courses based on classification
function getSuggestedCourses(level: string) {
    if (level === "Beginner") {
        return [
            { title: "Introduction to DSE Stock Market", category: "Stock Market", price: "35,000 TZS" },
            { title: "Personal Finance & Saccos Strategy", category: "SACCO Investment", price: "FREE" },
            { title: "Understanding Treasury Bills & Bonds", category: "Bonds & Treasury", price: "25,000 TZS" }
        ]
    }
    if (level === "Intermediate") {
        return [
            { title: "Tanzania Treasury Bonds Masterclass", category: "Bonds & Treasury", price: "75,000 TZS" },
            { title: "Portfolio Diversification Workshop", category: "Personal Finance", price: "50,000 TZS" },
            { title: "UTT AMIS Fund Analysis Deep Dive", category: "Mutual Funds", price: "45,000 TZS" }
        ]
    }
    return [
        { title: "Kigamboni & Bagamoyo Real Estate Valuation", category: "Real Estate", price: "120,000 TZS" },
        { title: "Angel Investing & Startup Due Diligence", category: "Startup Investment", price: "100,000 TZS" },
        { title: "Forex Markets & Currency Risk Hedging", category: "Forex Education", price: "90,000 TZS" }
    ]
}

export default function ReadinessQuizPage() {
    const router = useRouter()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<{ questionId: number; selectedIndex: number; points: number }[]>([])
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [isComplete, setIsComplete] = useState(false)
    const [totalScore, setTotalScore] = useState(0)

    const progress = ((currentQuestion) / QUIZ_QUESTIONS.length) * 100
    const question = QUIZ_QUESTIONS[currentQuestion]

    const handleSelectOption = (index: number) => {
        setSelectedOption(index)
    }

    const handleNext = () => {
        if (selectedOption === null) {
            toast.error("Please select an answer to continue.")
            return
        }

        const newAnswers = [
            ...answers,
            {
                questionId: question.id,
                selectedIndex: selectedOption,
                points: question.options[selectedOption].points
            }
        ]
        setAnswers(newAnswers)
        setSelectedOption(null)

        if (currentQuestion + 1 >= QUIZ_QUESTIONS.length) {
            // Quiz complete
            const score = newAnswers.reduce((sum, a) => sum + a.points, 0)
            setTotalScore(score)
            setIsComplete(true)
            toast.success("Assessment complete! Your results are ready.")
        } else {
            setCurrentQuestion((c) => c + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestion === 0) return
        const prevAnswers = answers.slice(0, -1)
        setAnswers(prevAnswers)
        const prevAnswer = answers[answers.length - 1]
        setSelectedOption(prevAnswer?.selectedIndex ?? null)
        setCurrentQuestion((c) => c - 1)
    }

    const handleRetake = () => {
        setCurrentQuestion(0)
        setAnswers([])
        setSelectedOption(null)
        setIsComplete(false)
        setTotalScore(0)
    }

    // Score circle rendering
    const scorePercent = totalScore // out of 100
    const classification = classifyLevel(scorePercent)
    const suggestedCourses = getSuggestedCourses(classification.level)

    // Circular progress ring parameters
    const radius = 70
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (scorePercent / 100) * circumference

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {!isComplete ? (
                <div className="max-w-2xl mx-auto space-y-8 py-8 px-4">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Investment Readiness Assessment</h1>
                        <p className="text-white/60 text-sm max-w-md mx-auto">
                            Discover your current investment knowledge level and get personalized learning recommendations.
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-white/50">
                            <span>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Question Card */}
                    <Card className="bg-slate-800/50 border-white/10 text-white">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                                    {currentQuestion + 1}
                                </div>
                                <Badge className="bg-slate-700/60 text-white/60 border-white/5 text-[10px]">
                                    {currentQuestion < 3 ? "Knowledge" : currentQuestion < 6 ? "Experience" : "Strategy"}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg font-semibold leading-relaxed">
                                {question.question}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {question.options.map((option, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelectOption(index)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center gap-3 ${
                                        selectedOption === index
                                            ? "border-emerald-500 bg-emerald-500/5"
                                            : "border-white/5 bg-slate-900/30 hover:border-white/20 hover:bg-slate-900/60"
                                    }`}
                                >
                                    <div
                                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                            selectedOption === index
                                                ? "border-emerald-500 bg-emerald-500"
                                                : "border-white/20"
                                        }`}
                                    >
                                        {selectedOption === index && (
                                            <CheckCircle className="h-3 w-3 text-slate-900 stroke-[3]" />
                                        )}
                                    </div>
                                    <span className="text-sm">{option.text}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center">
                        <Button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            variant="ghost"
                            className="text-white/60 hover:text-white disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <Button
                            onClick={handleNext}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {currentQuestion + 1 === QUIZ_QUESTIONS.length ? "Finish Assessment" : "Next Question"}{" "}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            ) : (
                /* ========================== RESULTS PANEL ========================== */
                <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
                    {/* Title */}
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
                            <Trophy className="h-6 w-6 text-amber-400" /> Assessment Results
                        </h1>
                        <p className="text-white/60 text-sm">Here's your personalized investment readiness profile</p>
                    </div>

                    {/* Score Ring + Classification */}
                    <Card className="bg-slate-800/40 border-white/10 text-white text-center p-8">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                            {/* SVG Circular Score */}
                            <div className="relative">
                                <svg width="180" height="180" viewBox="0 0 180 180">
                                    <circle
                                        cx="90"
                                        cy="90"
                                        r={radius}
                                        fill="none"
                                        stroke="rgba(255,255,255,0.05)"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="90"
                                        cy="90"
                                        r={radius}
                                        fill="none"
                                        stroke={scorePercent >= 80 ? "#34D399" : scorePercent >= 50 ? "#FBBF24" : "#60A5FA"}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        transform="rotate(-90 90 90)"
                                        style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-4xl font-bold ${classification.color}`}>{scorePercent}</span>
                                    <span className="text-xs text-white/40">/ 100</span>
                                </div>
                            </div>

                            {/* Classification Details */}
                            <div className="text-left max-w-md space-y-3">
                                <Badge className={`text-sm px-3 py-1 ${
                                    classification.level === "Advanced" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                    classification.level === "Intermediate" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                    "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                }`}>
                                    {classification.level} Investor
                                </Badge>
                                <p className="text-sm text-white/70 leading-relaxed">{classification.description}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Recommended Courses */}
                    <Card className="bg-slate-800/40 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-emerald-400" /> Recommended Learning Path
                            </CardTitle>
                            <CardDescription className="text-white/60">
                                Based on your assessment, we suggest these courses to advance your investment knowledge.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {suggestedCourses.map((course, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300 cursor-pointer group"
                                        onClick={() => router.push("/courses")}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                                                <Star className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold group-hover:text-emerald-400 transition-colors">
                                                    {course.title}
                                                </h4>
                                                <span className="text-[11px] text-white/40">{course.category}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className={`text-xs font-bold ${course.price === "FREE" ? "text-emerald-400" : "text-white"}`}>
                                                {course.price}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={() => router.push("/courses")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Browse Courses <ArrowRight className="h-4 w-4 ml-1.5" />
                        </Button>
                        <Button
                            onClick={() => router.push("/experts")}
                            variant="outline"
                            className="border-white/10 text-white hover:bg-white/5"
                        >
                            Book a Financial Expert
                        </Button>
                        <Button
                            onClick={handleRetake}
                            variant="ghost"
                            className="text-white/60 hover:text-white"
                        >
                            Retake Assessment
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

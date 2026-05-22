"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, CheckCircle2, XCircle, ArrowRight, RotateCcw, TrendingUp } from "lucide-react"
import { toast } from "sonner"

interface Question {
    id: number
    question: string
    options: string[]
    correct: number
    explanation: string
}

const QUESTIONS: Question[] = [
    {
        id: 1,
        question: "What does DSE stand for in the Tanzanian financial market?",
        options: ["Dar es Salaam Stock Exchange", "Dar es Salaam Securities Exchange", "Domestic Securities Exchange", "Dar es Salaam Share Exchange"],
        correct: 0,
        explanation: "DSE stands for Dar es Salaam Stock Exchange, Tanzania's primary securities exchange."
    },
    {
        id: 2,
        question: "Which of the following best describes a Treasury Bond?",
        options: ["A share in a company's ownership", "A long-term government debt instrument", "A short-term bank deposit", "A mutual fund investment"],
        correct: 1,
        explanation: "Treasury bonds are long-term debt instruments issued by the government to raise funds, typically with maturities of 2-25 years."
    },
    {
        id: 3,
        question: "What is diversification in investing?",
        options: ["Putting all funds into one high-return asset", "Spreading investments across different assets to reduce risk", "Only investing in government securities", "Investing in foreign currencies"],
        correct: 1,
        explanation: "Diversification reduces risk by spreading investments across various asset classes, sectors, and instruments."
    },
    {
        id: 4,
        question: "What is the minimum investment for most Tanzanian Treasury Bills?",
        options: ["TZS 100,000", "TZS 500,000", "TZS 1,000,000", "TZS 5,000,000"],
        correct: 1,
        explanation: "Treasury bills in Tanzania typically require a minimum investment of TZS 500,000."
    },
    {
        id: 5,
        question: "What does 'liquidity' mean in the context of investing?",
        options: ["The interest rate on an investment", "How quickly an asset can be converted to cash without significant loss", "The total return on investment", "The risk level of an investment"],
        correct: 1,
        explanation: "Liquidity refers to how quickly and easily an investment can be converted to cash without significant price impact."
    },
]

type QuizState = "intro" | "quiz" | "results"

function mapLabelToLevel(label: string): string {
    if (label === "Investment Ready") return "ADVANCED"
    if (label === "Nearly Ready") return "INTERMEDIATE"
    return "BEGINNER"
}

export default function LmsReadinessPage() {
    const [state, setState] = useState<QuizState>("intro")
    const [currentQ, setCurrentQ] = useState(0)
    const [answers, setAnswers] = useState<number[]>([])
    const [selected, setSelected] = useState<number | null>(null)
    const [showExplanation, setShowExplanation] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const score = answers.filter((a, i) => a === QUESTIONS[i].correct).length
    const percentage = Math.round((score / QUESTIONS.length) * 100)

    const handleAnswer = (optionIndex: number) => {
        if (selected !== null) return
        setSelected(optionIndex)
        setShowExplanation(true)
    }

    const handleNext = () => {
        const newAnswers = [...answers, selected!]
        setAnswers(newAnswers)
        if (currentQ + 1 >= QUESTIONS.length) {
            setState("results")
            saveResult(newAnswers)
        } else {
            setCurrentQ(c => c + 1)
            setSelected(null)
            setShowExplanation(false)
        }
    }

    const saveResult = async (finalAnswers: number[]) => {
        const finalScore = finalAnswers.filter((a, i) => a === QUESTIONS[i].correct).length
        const finalPct = Math.round((finalScore / QUESTIONS.length) * 100)
        const label =
            finalPct >= 80 ? "Investment Ready" : finalPct >= 60 ? "Nearly Ready" : "Keep Learning"
        const level = mapLabelToLevel(label)

        setSaving(true)
        try {
            const payload = finalAnswers.map((selectedIdx, i) => ({
                questionId: QUESTIONS[i].id,
                selectedIndex: selectedIdx,
                correct: selectedIdx === QUESTIONS[i].correct,
            }))

            const res = await fetch("/api/readiness", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ totalScore: finalScore, level, answers: payload }),
            })

            if (res.ok) {
                setSaved(true)
                toast.success("Your results have been saved!")
            }
        } catch {
            // silently fail — results still shown to user
        } finally {
            setSaving(false)
        }
    }

    const handleRestart = () => {
        setState("intro")
        setCurrentQ(0)
        setAnswers([])
        setSelected(null)
        setShowExplanation(false)
        setSaved(false)
    }

    const getReadinessLabel = () => {
        if (percentage >= 80) return { label: "Investment Ready", colorClass: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }
        if (percentage >= 60) return { label: "Nearly Ready", colorClass: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" }
        return { label: "Keep Learning", colorClass: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" }
    }

    if (state === "intro") {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        Readiness Quiz <Target className="h-8 w-8 text-amber-500 dark:text-amber-400" />
                    </h1>
                    <p className="text-slate-500 dark:text-white/50 mt-1">Test your investment knowledge and see where you stand</p>
                </div>
                <Card className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                    <CardContent className="p-8 space-y-6">
                        <div className="text-center space-y-3">
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10">
                                <Target className="h-10 w-10 text-amber-500 dark:text-amber-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Investment Readiness Assessment</h2>
                            <p className="text-slate-500 dark:text-white/60 max-w-md mx-auto">
                                Answer {QUESTIONS.length} questions about Tanzanian financial markets, investment concepts, and personal finance.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center py-4 border-y border-gray-200 dark:border-white/10">
                            {[
                                { label: "Questions", value: QUESTIONS.length },
                                { label: "Minutes", value: "~5" },
                                { label: "Topics", value: "Finance" },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                                    <p className="text-xs text-slate-500 dark:text-white/50">{label}</p>
                                </div>
                            ))}
                        </div>
                        <Button onClick={() => setState("quiz")} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-base py-6">
                            Start Quiz <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (state === "results") {
        const { label, colorClass, bg } = getReadinessLabel()
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Results</h1>
                <Card className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                    <CardContent className="p-8 space-y-6 text-center">
                        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/10 mx-auto">
                            <TrendingUp className="h-12 w-12 text-amber-500 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-5xl font-bold text-slate-900 dark:text-white">{percentage}%</p>
                            <p className="text-slate-500 dark:text-white/50 mt-1">{score} of {QUESTIONS.length} correct</p>
                        </div>
                        <Badge variant="outline" className={`text-sm px-4 py-1 ${bg} ${colorClass}`}>
                            {label}
                        </Badge>
                        <Progress value={percentage} className="h-3 bg-gray-200 dark:bg-white/10" />

                        {saving && (
                            <p className="text-xs text-slate-400 dark:text-white/40">Saving your results...</p>
                        )}
                        {saved && !saving && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">Results saved to your profile.</p>
                        )}

                        <div className="grid grid-cols-5 gap-2 pt-2">
                            {QUESTIONS.map((q, i) => {
                                const correct = answers[i] === q.correct
                                return (
                                    <div key={q.id} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${correct ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                                        {correct ? <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />}
                                        <span className="text-[10px] text-slate-500 dark:text-white/50">Q{i + 1}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handleRestart} variant="outline" className="flex-1 bg-transparent border-gray-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                                <RotateCcw className="mr-2 h-4 w-4" /> Retry
                            </Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => window.location.href = "/lms/explore"}>
                                Explore Courses
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const question = QUESTIONS[currentQ]
    const progress = (currentQ / QUESTIONS.length) * 100

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Readiness Quiz</h1>
                <span className="text-sm text-slate-500 dark:text-white/50">Question {currentQ + 1} of {QUESTIONS.length}</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200 dark:bg-white/10" />
            <Card className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <CardContent className="p-6 space-y-6">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white leading-snug">{question.question}</p>
                    <div className="space-y-3">
                        {question.options.map((option, idx) => {
                            let optionClass = "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                            if (selected !== null) {
                                if (idx === question.correct) optionClass = "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                else if (idx === selected) optionClass = "border-red-500/50 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                                else optionClass = "border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-slate-400 dark:text-white/40"
                            }
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={selected !== null}
                                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors disabled:cursor-default ${optionClass}`}
                                >
                                    <span className="mr-3 text-slate-400 dark:text-white/40">{String.fromCharCode(65 + idx)}.</span>
                                    {option}
                                </button>
                            )
                        })}
                    </div>
                    {showExplanation && (
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Explanation</p>
                            <p className="text-sm text-slate-700 dark:text-white/70">{question.explanation}</p>
                        </div>
                    )}
                    {selected !== null && (
                        <Button onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            {currentQ + 1 >= QUESTIONS.length ? "See Results" : "Next Question"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

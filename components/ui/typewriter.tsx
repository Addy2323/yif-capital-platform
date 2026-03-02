"use client"

import { useState, useEffect } from "react"

interface TypewriterProps {
    phrases: string[]
    typingSpeed?: number
    deletingSpeed?: number
    delayBetweenPhrases?: number
    className?: string
}

export function Typewriter({
    phrases,
    typingSpeed = 150,
    deletingSpeed = 100,
    delayBetweenPhrases = 2000,
    className = "",
}: TypewriterProps) {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
    const [currentText, setCurrentText] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const phrase = phrases[currentPhraseIndex]

        const handleTyping = () => {
            if (!isDeleting) {
                // Typing
                if (currentText.length < phrase.length) {
                    setCurrentText(phrase.slice(0, currentText.length + 1))
                } else {
                    // Finished typing, wait before deleting
                    setTimeout(() => setIsDeleting(true), delayBetweenPhrases)
                    return
                }
            } else {
                // Deleting
                if (currentText.length > 0) {
                    setCurrentText(phrase.slice(0, currentText.length - 1))
                } else {
                    // Finished deleting, move to next phrase
                    setIsDeleting(false)
                    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
                    return
                }
            }
        }

        const speed = isDeleting ? deletingSpeed : typingSpeed
        const timer = setTimeout(handleTyping, speed)

        return () => clearTimeout(timer)
    }, [currentText, isDeleting, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, delayBetweenPhrases])

    return (
        <span className={className}>
            {currentText}
            <span className="ml-0.5 inline-block w-1.5 h-8 bg-gold animate-pulse align-middle" />
        </span>
    )
}

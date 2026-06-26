import * as React from "react"
import { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

type Props = {
    endpointUrl: string
    buttonText: string
}

export default function AICopilot(props: Props) {
    const { endpointUrl, buttonText } = props

    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isFocused, setIsFocused] = useState(false)

    // Typewriter state mechanics
    const [placeholderText, setPlaceholderText] = useState("")
    const [phraseIndex, setPhraseIndex] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)
    const [charIndex, setCharIndex] = useState(0)

    const phrases = [
        "Ask me how I approach scaling enterprise design systems.",
        "Ask me about a time I optimized a user journey to drive revenue growth.",
        "Ask me what my philosophy is on end-to-end product ownership.",
    ]

    const abortControllerRef = React.useRef<AbortController | null>(null)

    // Inject mobile responsive media queries dynamically
    useEffect(() => {
        const styleId = "ai-copilot-responsive-styles"
        if (!document.getElementById(styleId)) {
            const styleTag = document.createElement("style")
            styleTag.id = styleId
            styleTag.innerHTML = `
                @media (max-width: 520px) {
                    .ai-copilot-form {
                        padding: 24px 20px !important;
                        border-radius: 24px !important;
                    }
                    .ai-copilot-inner-layout {
                        gap: 18px !important;
                    }
                    .ai-copilot-response-output {
                        flex-direction: row !important;
                        flex-wrap: wrap !important;
                        padding: 0 4px !important;
                    }
                }
            `
            document.head.appendChild(styleTag)
        }
    }, [])

    // Typewriter Animation Hook
    useEffect(() => {
        const currentFullPhrase = phrases[phraseIndex]
        let typingSpeed = isDeleting ? 25 : 50

        if (!isDeleting && charIndex === currentFullPhrase.length) {
            typingSpeed = 2500
            setIsDeleting(true)
        } else if (isDeleting && charIndex === 0) {
            setIsDeleting(false)
            setPhraseIndex((prev) => (prev + 1) % phrases.length)
        }

        const timeout = setTimeout(() => {
            setPlaceholderText(
                isDeleting
                    ? currentFullPhrase.substring(0, charIndex - 1)
                    : currentFullPhrase.substring(0, charIndex + 1)
            )
            setCharIndex((prev) => prev + (isDeleting ? -1 : 1))
        }, typingSpeed)

        return () => clearTimeout(timeout)
    }, [charIndex, isDeleting, phraseIndex])

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    const handleFetchAIResponse = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!input.trim() || !endpointUrl || isLoading) return

        const userQuery = input.trim()
        setInput("")

        setIsLoading(true)
        setError(null)
        setOutput("")

        abortControllerRef.current = new AbortController()

        try {
            const response = await fetch(endpointUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                signal: abortControllerRef.current.signal,
                body: JSON.stringify({ prompt: userQuery }),
            })

            if (!response.ok) {
                throw new Error(`Server returned status: ${response.status}`)
            }

            const data = await response.json()
            setOutput(data.reply || "No response received.")
        } catch (err: any) {
            if (err.name !== "AbortError") {
                setError(
                    err.message || "Something went wrong. Please try again."
                )
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Handle Keyboard Enter submission
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleFetchAIResponse()
        }
    }

    const handleInputFocus = () => {
        setIsFocused(true)
        if (output || error) {
            setOutput("")
            setError(null)
        }
    }

    const activeFormStyle = {
        ...formWrapperStyle,
        borderColor: isFocused ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.1)",
        boxShadow: isFocused
            ? "0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.03)"
            : "0 8px 24px -6px rgba(0, 0, 0, 0.05)",
    }

    return (
        <div style={containerStyle}>
            <form
                onSubmit={handleFetchAIResponse}
                style={activeFormStyle}
                className="ai-copilot-form"
            >
                <div
                    style={innerContentLayout}
                    className="ai-copilot-inner-layout"
                >
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholderText}
                        disabled={isLoading}
                        onFocus={handleInputFocus}
                        onBlur={() => setIsFocused(false)}
                        style={inputStyle}
                        className="ai-copilot-input"
                        rows={1}
                    />

                    <div style={bottomActionsRow}>
                        <a
                            href="https://drive.google.com/file/d/1YqBtlO52tIi5j11une-RzksMaSGOKun9/view"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={resumeButtonStyle}
                        >
                            <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <polyline points="19 12 12 19 5 12"></polyline>
                            </svg>
                            Download my resume
                        </a>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    style={{
                        ...submitButtonStyle,
                        opacity: isLoading || !input.trim() ? 0.6 : 1,
                    }}
                >
                    {isLoading ? (
                        <div style={spinnerStyle} />
                    ) : (
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                    )}
                </button>
            </form>

            {/* AI Response Window */}
            {(output || isLoading || error) && (
                <div style={responseContainerStyle}>
                    {isLoading && (
                        <div style={loadingContainerStyle}>
                            <div style={glowingLineStyle} />
                            <div style={loadingStyle}>
                                Synthesizing portfolio insight...
                            </div>
                        </div>
                    )}
                    {error && <div style={errorStyle}>✕ {error}</div>}
                    {output && !isLoading && (
                        <div
                            style={outputStyle}
                            className="ai-copilot-response-output"
                        >
                            <span style={sparkleIconStyle}>✦</span>
                            <div style={textStyle}>{output}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

AICopilot.defaultProps = {
    endpointUrl: "https://bejewelled-cocada-c0a15b.netlify.app/chat",
    buttonText: "Ask Copilot",
}

addPropertyControls(AICopilot, {
    endpointUrl: {
        type: ControlType.String,
        title: "API Endpoint",
    },
    buttonText: {
        type: ControlType.String,
        title: "Button Label",
    },
})

// Styled Elements
const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "auto", // Let Framer "Fit Content" handle the height calculations natively
    display: "block", // Changed to block to allow natural document flow heights
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    WebkitFontSmoothing: "antialiased",
    boxSizing: "border-box",
}

const formWrapperStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "20px 24px 20px 32px",
    background: "#FFFFFF",
    borderRadius: "32px",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    boxShadow: "0 8px 24px -6px rgba(0, 0, 0, 0.05)",
    transition:
        "border-color 0.35s ease, box-shadow 0.35s ease, padding 0.2s ease",
    boxSizing: "border-box",
}

const innerContentLayout: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    flexGrow: 1,
    marginRight: "20px",
}

const inputStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    color: "#111111",
    fontSize: "15px",
    lineHeight: "1.4",
    letterSpacing: "-0.01em",
    outline: "none",
    width: "100%",
    resize: "none",
    fontFamily: "inherit",
}

const bottomActionsRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
}

const resumeButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid rgba(0, 0, 0, 0.25)",
    background: "transparent",
    color: "#111111",
    fontSize: "12px",
    fontWeight: 500,
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 0.2s ease",
}

const submitButtonStyle: React.CSSProperties = {
    background: "#3B99FC",
    border: "none",
    color: "#FFFFFF",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(59, 153, 252, 0.25)",
    transition: "transform 0.2s ease, opacity 0.2s ease",
    flexShrink: 0,
}

const responseContainerStyle: React.CSSProperties = {
    width: "100%",
    padding: "0 16px",
    marginTop: "16px", // Clean separation layout replacement for parent gaps
    boxSizing: "border-box",
}

const loadingContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
}

const glowingLineStyle: React.CSSProperties = {
    height: "1px",
    width: "100%",
    background:
        "linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)",
}

const loadingStyle: React.CSSProperties = {
    color: "rgba(0, 0, 0, 0.4)",
    fontSize: "11px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontWeight: 500,
}

const errorStyle: React.CSSProperties = {
    color: "#e5484d",
    fontSize: "13px",
}

const outputStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    width: "100%",
    boxSizing: "border-box",
}

const sparkleIconStyle: React.CSSProperties = {
    color: "rgba(0, 0, 0, 0.6)",
    fontSize: "12px",
    marginTop: "4px",
    flexShrink: 0,
}

const textStyle: React.CSSProperties = {
    color: "#111111",
    fontSize: "15px",
    lineHeight: "1.6",
    fontWeight: 400,
    letterSpacing: "-0.005em",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    flexGrow: 1,
    minWidth: "0px",
}

const spinnerStyle: React.CSSProperties = {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid #FFFFFF",
    borderRadius: "50%",
}

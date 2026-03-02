"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Loader2 } from "lucide-react"
import { Button } from "./button"

type AlertType = "success" | "error" | "warning" | "info" | "loading"

interface AlertConfig {
  type: AlertType
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  autoClose?: number
  showCancel?: boolean
}

interface SweetAlertContextType {
  showAlert: (config: AlertConfig) => void
  hideAlert: () => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string, onConfirm?: () => void) => void
  info: (title: string, message?: string) => void
  loading: (title: string, message?: string) => void
  confirm: (title: string, message?: string, onConfirm?: () => void, onCancel?: () => void) => void
}

const SweetAlertContext = createContext<SweetAlertContextType | null>(null)

export function useSweetAlert() {
  const context = useContext(SweetAlertContext)
  if (!context) {
    throw new Error("useSweetAlert must be used within a SweetAlertProvider")
  }
  return context
}

const alertIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
}

const alertColors = {
  success: {
    bg: "bg-success/10",
    icon: "text-success",
    border: "border-success/20",
    button: "bg-success hover:bg-success/90 text-white",
  },
  error: {
    bg: "bg-error/10",
    icon: "text-error",
    border: "border-error/20",
    button: "bg-error hover:bg-error/90 text-white",
  },
  warning: {
    bg: "bg-warning/10",
    icon: "text-warning",
    border: "border-warning/20",
    button: "bg-warning hover:bg-warning/90 text-white",
  },
  info: {
    bg: "bg-blue-500/10",
    icon: "text-blue-500",
    border: "border-blue-500/20",
    button: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  loading: {
    bg: "bg-gold/10",
    icon: "text-gold",
    border: "border-gold/20",
    button: "bg-gold hover:bg-gold/90 text-navy",
  },
}

export function SweetAlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertConfig | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const hideAlert = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      setAlert(null)
      setIsVisible(false)
      setIsExiting(false)
      setIsLoading(false)
    }, 200)
  }, [])

  const showAlert = useCallback((config: AlertConfig) => {
    setAlert(config)
    setIsVisible(true)
    setIsExiting(false)

    if (config.autoClose && config.type !== "loading") {
      setTimeout(hideAlert, config.autoClose)
    }
  }, [hideAlert])

  const success = useCallback((title: string, message?: string) => {
    showAlert({ type: "success", title, message, autoClose: 3000, confirmText: "OK" })
  }, [showAlert])

  const error = useCallback((title: string, message?: string) => {
    showAlert({ type: "error", title, message, confirmText: "OK" })
  }, [showAlert])

  const warning = useCallback((title: string, message?: string, onConfirm?: () => void) => {
    showAlert({ 
      type: "warning", 
      title, 
      message, 
      confirmText: "Yes, proceed",
      cancelText: "Cancel",
      showCancel: true,
      onConfirm 
    })
  }, [showAlert])

  const info = useCallback((title: string, message?: string) => {
    showAlert({ type: "info", title, message, autoClose: 4000, confirmText: "Got it" })
  }, [showAlert])

  const loading = useCallback((title: string, message?: string) => {
    showAlert({ type: "loading", title, message })
  }, [showAlert])

  const confirm = useCallback((title: string, message?: string, onConfirm?: () => void, onCancel?: () => void) => {
    showAlert({
      type: "warning",
      title,
      message,
      confirmText: "Confirm",
      cancelText: "Cancel",
      showCancel: true,
      onConfirm,
      onCancel,
    })
  }, [showAlert])

  const handleConfirm = async () => {
    if (alert?.onConfirm) {
      setIsLoading(true)
      try {
        await alert.onConfirm()
      } finally {
        setIsLoading(false)
      }
    }
    hideAlert()
  }

  const handleCancel = () => {
    alert?.onCancel?.()
    hideAlert()
  }

  const Icon = alert ? alertIcons[alert.type] : null
  const colors = alert ? alertColors[alert.type] : null

  return (
    <SweetAlertContext.Provider value={{ showAlert, hideAlert, success, error, warning, info, loading, confirm }}>
      {children}

      {/* Overlay */}
      {isVisible && (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-200",
            isExiting ? "opacity-0" : "opacity-100"
          )}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={alert?.type !== "loading" ? hideAlert : undefined}
          />

          {/* Alert Box */}
          <div
            className={cn(
              "relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl transition-all duration-200",
              colors?.border,
              isExiting ? "scale-95 opacity-0" : "scale-100 opacity-100"
            )}
            style={{
              animation: !isExiting ? "sweetAlertIn 0.3s ease-out" : undefined,
            }}
          >
            {/* Close button (not for loading) */}
            {alert?.type !== "loading" && (
              <button
                onClick={hideAlert}
                className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Icon */}
            <div className="flex justify-center">
              <div className={cn("rounded-full p-4", colors?.bg)}>
                {Icon && (
                  <Icon 
                    className={cn(
                      "h-12 w-12",
                      colors?.icon,
                      alert?.type === "loading" && "animate-spin"
                    )} 
                  />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold text-card-foreground">{alert?.title}</h3>
              {alert?.message && (
                <p className="mt-2 text-muted-foreground leading-relaxed">{alert.message}</p>
              )}
            </div>

            {/* Buttons */}
            {alert?.type !== "loading" && (
              <div className={cn(
                "mt-6 flex gap-3",
                alert?.showCancel ? "justify-center" : "justify-center"
              )}>
                {alert?.showCancel && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="min-w-[100px] bg-transparent"
                    disabled={isLoading}
                  >
                    {alert.cancelText || "Cancel"}
                  </Button>
                )}
                <Button
                  onClick={handleConfirm}
                  className={cn("min-w-[100px]", colors?.button)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    alert?.confirmText || "OK"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes sweetAlertIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </SweetAlertContext.Provider>
  )
}

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ backgroundColor: "#0B0F0D" }}
        >
          <div className="text-center max-w-sm space-y-4">
            <AlertTriangle size={48} className="mx-auto" style={{ color: "#FF6B6B" }} />
            <h1 className="text-xl font-bold" style={{ color: "#F5F7F5" }}>Something went wrong</h1>
            <p className="text-sm" style={{ color: "#9CA69D" }}>
              SpendSmart encountered an unexpected error. Please try reloading.
            </p>
            {this.state.error && (
              <p className="text-xs font-mono rounded-xl p-3 break-all" style={{ color: "#FF6B6B", backgroundColor: "rgba(255,107,107,0.1)" }}>
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 font-semibold px-6 py-2.5 rounded-xl transition-all"
              style={{ backgroundColor: "#7CFF6B", color: "#0B0F0D" }}
            >
              <RotateCcw size={14} />
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

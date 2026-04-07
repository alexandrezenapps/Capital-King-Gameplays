import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = parsed.error;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border-b-8 border-slate-200 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="font-headline font-black text-2xl text-blue-900 mb-4 uppercase tracking-tight">
              Oops! Something went wrong
            </h1>
            <div className="bg-slate-50 p-4 rounded-xl mb-8 text-left border border-slate-100">
              <p className="text-slate-500 text-sm font-mono break-words">
                {errorMessage}
              </p>
            </div>
            <Button
              onClick={this.handleReset}
              className="w-full h-14 bg-blue-900 hover:bg-blue-800 text-white font-headline font-bold rounded-2xl flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" />
              RESTART GAME
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

"use client";

import React, { Component } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import Button from "./Button";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === "function"
          ? this.props.fallback(this.state.error, this.handleReset)
          : this.props.fallback;
      }

      return (
        <div className="p-6 bg-red-50/70 border border-red-200 rounded-2xl text-center space-y-3 my-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-red-950">
              {this.props.title || "This section encountered an unexpected error"}
            </h3>
            <p className="text-xs text-red-700/90 mt-1 max-w-md mx-auto">
              {this.state.error?.message || "An error occurred while loading this tab. You can reload this section without affecting the rest of the page."}
            </p>
          </div>
          <div className="pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-red-700 border-red-300 hover:bg-red-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Section</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, BookOpen } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('books_and_friends_session_user');
      localStorage.removeItem('books_and_friends_books_v9');
      localStorage.removeItem('books_and_friends_members_v8');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-6 text-stone-800 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-stone-200 shadow-xl text-center space-y-6">
            <div className="w-14 h-14 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto border border-amber-200">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-semibold text-stone-900">
                The Six — Reading Salon
              </h2>
              <p className="text-sm text-stone-600">
                A temporary display issue occurred while rendering the page.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-stone-50 hover:bg-stone-800 font-medium text-sm transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Salon
              </button>
            </div>

            {this.state.error && (
              <details className="text-left bg-stone-50 rounded-lg p-3 text-xs text-stone-500 font-mono overflow-auto max-h-36 border border-stone-200">
                <summary className="cursor-pointer text-stone-600 font-sans font-medium mb-1">
                  Technical details
                </summary>
                {this.state.error.toString()}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

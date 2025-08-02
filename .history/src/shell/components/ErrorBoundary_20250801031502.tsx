// ErrorBoundary component for Tourist Tax Payment System
// Catch React errors and display user-friendly error messages

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Container } from 'react-bootstrap';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('🚨 React Error Boundary caught an error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }

    // In production, you might want to send this to an error reporting service
    // like Sentry, LogRocket, etc.
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Container className="mt-5">
          <Alert variant="danger">
            <Alert.Heading>
              <i className="bi bi-exclamation-triangle me-2"></i>
              Wystąpił błąd aplikacji
            </Alert.Heading>
            <p>
              Aplikacja napotkała nieoczekiwany błąd podczas przetwarzania płatności opłaty miejscowej.
              Przepraszamy za niedogodności.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-3">
                <summary>Szczegóły błędu (tryb deweloperski)</summary>
                <pre className="mt-2 small text-muted bg-light p-2 rounded">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\nStack trace:\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <hr />

            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">
                  Jeśli problem się powtarza, skontaktuj się z pomocą techniczną.
                </small>
              </div>
              <div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={this.handleGoHome}
                  className="me-2"
                >
                  <i className="bi bi-house me-1"></i>
                  Strona główna
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={this.handleReload}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Odśwież aplikację
                </Button>
              </div>
            </div>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };
}

export default ErrorBoundary;

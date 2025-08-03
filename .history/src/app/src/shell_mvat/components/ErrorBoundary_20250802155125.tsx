// src/components/ErrorBoundary.tsx - Catch React errors
import React, {Component, ErrorInfo, ReactNode} from 'react';
import {Alert, Button, Container} from 'react-bootstrap';
import {logger} from '@/platform/CentralizedLogger';

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
        this.state = {hasError: false, error: null};
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {hasError: true, error};
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        logger.critical('🚨 React Error Boundary caught an error', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
        });
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <Container className="mt-5">
                    <Alert variant="danger">
                        <Alert.Heading>Something went wrong!</Alert.Heading>
                        <p>The application encountered an unexpected error.</p>
                        {this.state.error && (
                            <details className="mt-3">
                                <summary>Error Details</summary>
                                <pre className="mt-2 small text-muted">
                  {this.state.error.message}
                </pre>
                            </details>
                        )}
                        <hr/>
                        <div className="d-flex justify-content-end">
                            <Button
                                variant="outline-danger"
                                onClick={this.handleReload}
                            >
                                Reload Application
                            </Button>
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
}

export default ErrorBoundary;

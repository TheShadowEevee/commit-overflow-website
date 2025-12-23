import { Component, type ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
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

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            const title = this.props.fallbackTitle || "COMPONENT";
            return (
                <section className="error-section">
                    <pre className="error-box">
                        {`┌${"─".repeat(50)}┐`}
                        {"\n"}
                        {`│ ERROR: ${title.padEnd(40)} │`}
                        {"\n"}
                        {`├${"─".repeat(50)}┤`}
                        {"\n"}
                        {`│ ${"Something went wrong.".padEnd(49)}│`}
                        {"\n"}
                        {`│ ${(this.state.error?.message || "Unknown error").slice(0, 48).padEnd(49)}│`}
                        {"\n"}
                        {`└${"─".repeat(50)}┘`}
                    </pre>
                    <button
                        onClick={this.handleRetry}
                        className="error-retry-btn"
                        style={{
                            background: "none",
                            border: "1px solid var(--text)",
                            color: "var(--text)",
                            fontFamily: "inherit",
                            fontSize: "inherit",
                            padding: "0.5rem 1rem",
                            cursor: "pointer",
                            marginTop: "1rem",
                        }}
                    >
                        [retry]
                    </button>
                </section>
            );
        }

        return this.props.children;
    }
}

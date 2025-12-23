import useSWR from "swr";
import { fetcher } from "../lib/fetcher";

interface StatsData {
    commitsByDay: Record<string, number>;
    event: {
        startDate: string;
        endDate: string;
    };
}

const HEATMAP_CHARS = [" ", "░", "▒", "▓", "█"];

function getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr + "T12:00:00");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
}

function verticalBarChart(commitsByDay: Record<string, number>, days: string[]): string[] {
    const values = days.map((day) => commitsByDay[day] || 0);
    const max = Math.max(...values, 1);
    const height = max;
    const lines: string[] = [];
    const barWidth = 4;

    for (let row = height; row >= 1; row--) {
        const threshold = row;
        const yLabel = Math.round(threshold).toString().padStart(4);

        const bars = values
            .map((v) => {
                if (v >= threshold) return ' <span class="green">██</span> ';
                if (v >= threshold - 0.5) return ' <span class="green">▄▄</span> ';
                return "    ";
            })
            .join("");

        lines.push(`${yLabel} │${bars}│`);
    }

    lines.push("     └" + "─".repeat(days.length * barWidth) + "┘");

    const labels = days
        .map((day) => {
            const d = new Date(day + "T12:00:00").getDate().toString();
            return d.padStart(Math.floor((barWidth + d.length) / 2)).padEnd(barWidth);
        })
        .join("");
    lines.push("      " + labels);

    return lines;
}

function heatmapRow(commitsByDay: Record<string, number>, days: string[]): string {
    const values = days.map((day) => commitsByDay[day] || 0);
    const max = Math.max(...values, 1);

    return values
        .map((count) => {
            const level = count === 0 ? 0 : Math.ceil((count / max) * 4);
            return HEATMAP_CHARS[level].repeat(2);
        })
        .join("");
}

export function CommitChart() {
    const { data, error, mutate } = useSWR<StatsData>("/api/stats", fetcher, {
        refreshInterval: 60000,
    });

    if (error) {
        return (
            <section className="chart-section">
                <h2>COMMIT ACTIVITY</h2>
                <pre style={{ color: "var(--error, #ff6b6b)" }}>
                    ╳ Failed to load chart data.{" "}
                    <button
                        onClick={() => mutate()}
                        style={{
                            background: "none",
                            border: "none",
                            color: "inherit",
                            fontFamily: "inherit",
                            fontSize: "inherit",
                            cursor: "pointer",
                            textDecoration: "underline",
                        }}
                    >
                        [retry]
                    </button>
                </pre>
            </section>
        );
    }

    if (!data) {
        const skeletonBars = Array(10)
            .fill(0)
            .map(() => {
                const yLabel = "░░░░";
                const bars = "░░░░".repeat(22);
                return `${yLabel} │${bars}│`;
            })
            .join("\n");
        const skeletonLabels = "     └" + "─".repeat(88) + "┘\n      " + "░░  ".repeat(22);

        return (
            <section className="chart-section">
                <h2>COMMIT ACTIVITY</h2>
                <pre className="bar-chart skeleton">{skeletonBars + "\n" + skeletonLabels}</pre>
                <div className="heatmap-container">
                    <pre className="heatmap skeleton">
                        <span className="date-label">░░░ ░░</span> [
                        <span className="heatmap-chars">{"░░".repeat(22)}</span>]{" "}
                        <span className="date-label">░░░ ░░</span>
                    </pre>
                    <p className="heatmap-legend">
                        <span className="unselectable">░▒▓█</span> = commit density
                    </p>
                </div>
            </section>
        );
    }

    const { commitsByDay, event } = data;
    const days = getDateRange(event.startDate, event.endDate);
    const chart = verticalBarChart(commitsByDay, days);
    const heatmap = heatmapRow(commitsByDay, days);

    const startLabel = formatDateLabel(event.startDate);
    const endLabel = formatDateLabel(event.endDate);

    return (
        <section className="chart-section">
            <h2>COMMIT ACTIVITY</h2>
            <pre className="bar-chart" dangerouslySetInnerHTML={{ __html: chart.join("\n") }} />
            <div className="heatmap-container">
                <pre className="heatmap">
                    <span className="date-label">{startLabel}</span> [
                    <span className="heatmap-chars">{heatmap}</span>]{" "}
                    <span className="date-label">{endLabel}</span>
                </pre>
                <p className="heatmap-legend">
                    <span className="unselectable">░▒▓█</span> = commit density
                </p>
            </div>
        </section>
    );
}

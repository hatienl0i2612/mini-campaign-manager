/**
 * Animated AI-themed background for auth pages.
 * Renders: dot grid, neural network nodes with connections,
 * voice waveform bars, and pulsing signal rings.
 * All colors are theme-aware via CSS variables.
 */
export default function AIBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {/* Dot grid pattern */}
            <div className="ai-dot-grid absolute inset-0 opacity-[0.35]" />

            {/* Neural network nodes + connections (SVG) */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--theme-foreground)" stopOpacity="0.06" />
                        <stop
                            offset="100%"
                            stopColor="var(--theme-foreground)"
                            stopOpacity="0.02"
                        />
                    </linearGradient>
                    <radialGradient id="node-glow">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Connection lines */}
                <line
                    x1="10%"
                    y1="20%"
                    x2="30%"
                    y2="40%"
                    stroke="url(#line-grad)"
                    strokeWidth="1"
                    className="ai-line ai-line-1"
                />
                <line
                    x1="30%"
                    y1="40%"
                    x2="55%"
                    y2="25%"
                    stroke="url(#line-grad)"
                    strokeWidth="1"
                    className="ai-line ai-line-2"
                />
                <line
                    x1="55%"
                    y1="25%"
                    x2="80%"
                    y2="45%"
                    stroke="url(#line-grad)"
                    strokeWidth="1"
                    className="ai-line ai-line-3"
                />
                <line
                    x1="20%"
                    y1="70%"
                    x2="45%"
                    y2="55%"
                    stroke="url(#line-grad)"
                    strokeWidth="1"
                    className="ai-line ai-line-4"
                />
                <line
                    x1="45%"
                    y1="55%"
                    x2="75%"
                    y2="70%"
                    stroke="url(#line-grad)"
                    strokeWidth="1"
                    className="ai-line ai-line-5"
                />
                <line
                    x1="30%"
                    y1="40%"
                    x2="45%"
                    y2="55%"
                    stroke="url(#line-grad)"
                    strokeWidth="1"
                    className="ai-line ai-line-6"
                />
                <line
                    x1="55%"
                    y1="25%"
                    x2="45%"
                    y2="55%"
                    stroke="url(#line-grad)"
                    strokeWidth="1"
                    className="ai-line ai-line-1"
                />

                {/* Neural nodes */}
                {[
                    { cx: '10%', cy: '20%', r: 3, delay: 0 },
                    { cx: '30%', cy: '40%', r: 4, delay: 1 },
                    { cx: '55%', cy: '25%', r: 3.5, delay: 2 },
                    { cx: '80%', cy: '45%', r: 3, delay: 0.5 },
                    { cx: '20%', cy: '70%', r: 3, delay: 1.5 },
                    { cx: '45%', cy: '55%', r: 5, delay: 0.8 },
                    { cx: '75%', cy: '70%', r: 3, delay: 2.5 },
                    { cx: '65%', cy: '85%', r: 2.5, delay: 3 },
                    { cx: '85%', cy: '15%', r: 2.5, delay: 1.2 },
                    { cx: '15%', cy: '90%', r: 2, delay: 2.2 },
                ].map((node, i) => (
                    <g key={i}>
                        {/* Glow ring */}
                        <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={node.r * 4}
                            fill="url(#node-glow)"
                            className="ai-node-pulse"
                            style={{
                                animationDelay: `${node.delay}s`,
                            }}
                        />
                        {/* Solid node */}
                        <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={node.r}
                            fill="#6366f1"
                            opacity="0.5"
                            className="ai-node-pulse"
                            style={{
                                animationDelay: `${node.delay}s`,
                            }}
                        />
                    </g>
                ))}
            </svg>

            {/* Voice waveform — represents AI phone calls */}
            <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 flex items-end gap-[3px] h-16 opacity-30">
                {Array.from({ length: 32 }).map((_, i) => (
                    <div
                        key={i}
                        className="ai-wave-bar w-[2px] rounded-full bg-primary"
                        style={{
                            animationDelay: `${i * 0.08}s`,
                            height: '4px',
                        }}
                    />
                ))}
            </div>

            {/* Signal pulse rings — emanate from center-left */}
            <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="ai-signal-ring absolute rounded-full border border-primary/20"
                        style={{
                            width: '200px',
                            height: '200px',
                            top: '-100px',
                            left: '-100px',
                            animationDelay: `${i * 1.5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Floating micro-particles */}
            {[
                { top: '15%', left: '70%', size: 2, delay: 0 },
                { top: '35%', left: '85%', size: 1.5, delay: 1 },
                { top: '60%', left: '15%', size: 2, delay: 2 },
                { top: '80%', left: '60%', size: 1.5, delay: 0.5 },
                { top: '25%', left: '45%', size: 1, delay: 3 },
                { top: '70%', left: '35%', size: 1, delay: 1.8 },
            ].map((p, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-accent ai-float"
                    style={{
                        top: p.top,
                        left: p.left,
                        width: `${p.size * 3}px`,
                        height: `${p.size * 3}px`,
                        opacity: 0.3,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}

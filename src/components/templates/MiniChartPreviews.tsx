import React from 'react';

export function renderMiniChart(name: string): React.ReactNode {
    const cleanName = name.toLowerCase().replace(/chart|diagram|plot/g, '').trim();

    switch (cleanName) {
        case 'line':
        case 'multi line':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <path
                        d="M10,48 Q30,20 50,35 T90,12 T110,25"
                        stroke="#8b5cf6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {cleanName === 'multi line' && (
                        <path
                            d="M10,38 Q35,45 60,15 T95,35 T110,10"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.75"
                        />
                    )}
                    <circle cx="50" cy="35" r="3" fill="#8b5cf6" stroke="#fff" strokeWidth="1" />
                    <circle cx="90" cy="12" r="3" fill="#8b5cf6" stroke="#fff" strokeWidth="1" />
                </svg>
            );

        case 'vertical bar':
        case 'bar - vertical':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <rect x="10" y="35" width="10" height="20" rx="2" fill="#8b5cf6" opacity="0.6" />
                    <rect x="28" y="20" width="10" height="35" rx="2" fill="#8b5cf6" opacity="0.8" />
                    <rect x="46" y="42" width="10" height="13" rx="2" fill="#a78bfa" />
                    <rect x="64" y="15" width="10" height="40" rx="2" fill="#7c3aed" />
                    <rect x="82" y="28" width="10" height="27" rx="2" fill="#6d28d9" />
                    <rect x="100" y="38" width="10" height="17" rx="2" fill="#c084fc" opacity="0.7" />
                </svg>
            );

        case 'horizontal bar':
        case 'bar - horizontal':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <rect x="5" y="8" width="85" height="7" rx="1.5" fill="#6366f1" />
                    <rect x="5" y="20" width="105" height="7" rx="1.5" fill="#4f46e5" />
                    <rect x="5" y="32" width="65" height="7" rx="1.5" fill="#818cf8" />
                    <rect x="5" y="44" width="90" height="7" rx="1.5" fill="#312e81" opacity="0.8" />
                </svg>
            );

        case 'stacked bar':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    {/* Bar 1 */}
                    <rect x="15" y="40" width="12" height="15" rx="1.5" fill="#3b82f6" />
                    <rect x="15" y="25" width="12" height="15" fill="#8b5cf6" />
                    <rect x="15" y="10" width="12" height="15" rx="1.5" fill="#10b981" />
                    {/* Bar 2 */}
                    <rect x="40" y="35" width="12" height="20" rx="1.5" fill="#3b82f6" />
                    <rect x="40" y="20" width="12" height="15" fill="#8b5cf6" />
                    <rect x="40" y="5" width="12" height="15" rx="1.5" fill="#10b981" />
                    {/* Bar 3 */}
                    <rect x="65" y="45" width="12" height="10" rx="1.5" fill="#3b82f6" />
                    <rect x="65" y="30" width="12" height="15" fill="#8b5cf6" />
                    <rect x="65" y="15" width="12" height="15" rx="1.5" fill="#10b981" />
                    {/* Bar 4 */}
                    <rect x="90" y="38" width="12" height="17" rx="1.5" fill="#3b82f6" />
                    <rect x="90" y="22" width="12" height="16" fill="#8b5cf6" />
                    <rect x="90" y="12" width="12" height="10" rx="1.5" fill="#10b981" />
                </svg>
            );

        case 'donut':
        case 'pie':
        case 'semi donut':
            const isSemi = cleanName === 'semi donut';
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    {isSemi ? (
                        <path
                            d="M 25,50 A 35,35 0 0,1 95,50"
                            stroke="#8b5cf6"
                            strokeWidth="12"
                            strokeDasharray="40 100"
                            strokeLinecap="butt"
                            fill="none"
                        />
                    ) : (
                        <circle
                            cx="60"
                            cy="30"
                            r="20"
                            stroke="#8b5cf6"
                            strokeWidth={cleanName === 'donut' ? "8" : "20"}
                            strokeDasharray="30 40 25 30"
                            strokeDashoffset="15"
                            fill="none"
                        />
                    )}
                    {isSemi ? (
                        <path
                            d="M 25,50 A 35,35 0 0,1 95,50"
                            stroke="#3b82f6"
                            strokeWidth="12"
                            strokeDasharray="70 110"
                            strokeDashoffset="-40"
                            strokeLinecap="butt"
                            fill="none"
                            opacity="0.8"
                        />
                    ) : null}
                </svg>
            );

        case 'area':
        case 'stacked area':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <defs>
                        <linearGradient id="miniAreaGrad1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="miniAreaGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d="M10,48 C30,30 50,40 70,18 C90,28 100,10 110,15 L110,55 L10,55 Z" fill="url(#miniAreaGrad1)" />
                    <path d="M10,48 C30,30 50,40 70,18 C90,28 100,10 110,15" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                    
                    {cleanName === 'stacked area' && (
                        <>
                            <path d="M10,50 C30,42 50,48 70,35 C90,40 100,28 110,32 L110,55 L10,55 Z" fill="url(#miniAreaGrad2)" />
                            <path d="M10,50 C30,42 50,48 70,35 C90,40 100,28 110,32" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                        </>
                    )}
                </svg>
            );

        case 'scatter':
        case 'bubble':
            const points = [
                { x: 20, y: 45, r: 3 }, { x: 35, y: 30, r: 4 }, { x: 40, y: 18, r: 6 },
                { x: 55, y: 40, r: 3.5 }, { x: 60, y: 25, r: 5 }, { x: 75, y: 15, r: 7 },
                { x: 80, y: 48, r: 2.5 }, { x: 92, y: 35, r: 5.5 }, { x: 105, y: 22, r: 4 }
            ];
            const isBubble = cleanName === 'bubble';
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    {points.map((p, idx) => (
                        <circle
                            key={idx}
                            cx={p.x}
                            cy={p.y}
                            r={isBubble ? p.r : 3.5}
                            fill={idx % 3 === 0 ? "#8b5cf6" : idx % 3 === 1 ? "#d946ef" : "#3b82f6"}
                            fillOpacity={isBubble ? "0.6" : "0.8"}
                            stroke={isBubble ? (idx % 3 === 0 ? "#8b5cf6" : idx % 3 === 1 ? "#d946ef" : "#3b82f6") : "none"}
                            strokeWidth={isBubble ? 1 : 0}
                        />
                    ))}
                </svg>
            );

        case 'line with target':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    {/* Target line */}
                    <line x1="10" y1="25" x2="110" y2="25" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                    {/* Trend line */}
                    <path
                        d="M10,48 C30,38 50,45 70,22 C90,15 100,28 110,12"
                        stroke="#8b5cf6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                    <circle cx="70" cy="22" r="3.5" fill="#8b5cf6" stroke="#fff" strokeWidth="1" />
                </svg>
            );

        case 'area range':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <defs>
                        <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    {/* Range Area */}
                    <path
                        d="M10,25 C30,15 60,30 90,10 C100,15 110,5 L110,40 C90,45 60,50 30,35 C20,38 10,42 Z"
                        fill="url(#rangeGrad)"
                    />
                    {/* Boundary Lines */}
                    <path d="M10,25 C30,15 60,30 90,10 C100,15 110,5" stroke="#8b5cf6" strokeWidth="1.5" />
                    <path d="M10,42 C20,38 30,35 C60,50 90,45 110,40" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.6" />
                </svg>
            );

        case 'gauge':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    {/* Dial */}
                    <path
                        d="M 30,50 A 30,30 0 0,1 90,50"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d="M 30,50 A 30,30 0 0,1 78,24"
                        stroke="#8b5cf6"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                    />
                    {/* Needle */}
                    <line x1="60" y1="48" x2="75" y2="28" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="60" cy="48" r="4" fill="#3b82f6" />
                </svg>
            );

        case 'treemap':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <rect x="8" y="8" width="48" height="44" rx="2" fill="#8b5cf6" />
                    <rect x="58" y="8" width="54" height="21" rx="2" fill="#3b82f6" />
                    <rect x="58" y="31" width="26" height="21" rx="2" fill="#10b981" />
                    <rect x="86" y="31" width="26" height="21" rx="2" fill="#f59e0b" />
                </svg>
            );

        case 'waterfall':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <rect x="10" y="35" width="10" height="15" rx="1" fill="#8b5cf6" />
                    <rect x="25" y="20" width="10" height="15" rx="1" fill="#10b981" />
                    <rect x="40" y="10" width="10" height="10" rx="1" fill="#10b981" />
                    <rect x="55" y="10" width="10" height="20" rx="1" fill="#ef4444" />
                    <rect x="70" y="30" width="10" height="8" rx="1" fill="#10b981" />
                    <rect x="85" y="23" width="10" height="15" rx="1" fill="#ef4444" />
                    <rect x="100" y="38" width="10" height="12" rx="1" fill="#8b5cf6" />
                    {/* Connecting lines */}
                    <line x1="20" y1="35" x2="25" y2="35" stroke="#ccc" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="35" y1="20" x2="40" y2="20" stroke="#ccc" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="50" y1="10" x2="55" y2="10" stroke="#ccc" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="65" y1="30" x2="70" y2="30" stroke="#ccc" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="80" y1="38" x2="85" y2="38" stroke="#ccc" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
            );

        case 'radar':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    {/* Spider webs */}
                    <polygon points="60,6 100,20 85,52 35,52 20,20" stroke="#ccc" strokeWidth="0.5" />
                    <polygon points="60,18 88,28 77,44 43,44 32,28" stroke="#ccc" strokeWidth="0.5" />
                    <polygon points="60,30 74,35 69,40 51,40 46,35" stroke="#ccc" strokeWidth="0.5" />
                    {/* Axis lines */}
                    <line x1="60" y1="30" x2="60" y2="6" stroke="#ccc" strokeWidth="0.5" />
                    <line x1="60" y1="30" x2="100" y2="20" stroke="#ccc" strokeWidth="0.5" />
                    <line x1="60" y1="30" x2="85" y2="52" stroke="#ccc" strokeWidth="0.5" />
                    <line x1="60" y1="30" x2="35" y2="52" stroke="#ccc" strokeWidth="0.5" />
                    <line x1="60" y1="30" x2="20" y2="20" stroke="#ccc" strokeWidth="0.5" />
                    {/* Radar Area */}
                    <polygon points="60,12 90,22 75,47 45,38 30,22" fill="#8b5cf6" fillOpacity="0.25" stroke="#8b5cf6" strokeWidth="1.5" />
                </svg>
            );

        case 'box':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    {/* Box 1 */}
                    <line x1="25" y1="10" x2="25" y2="50" stroke="#8b5cf6" strokeWidth="1.5" />
                    <line x1="20" y1="10" x2="30" y2="10" stroke="#8b5cf6" strokeWidth="1.5" />
                    <line x1="20" y1="50" x2="30" y2="50" stroke="#8b5cf6" strokeWidth="1.5" />
                    <rect x="18" y="20" width="14" height="20" rx="1" fill="#a78bfa" stroke="#8b5cf6" strokeWidth="1.5" />
                    <line x1="18" y1="30" x2="32" y2="30" stroke="#7c3aed" strokeWidth="2" />

                    {/* Box 2 */}
                    <line x1="60" y1="5" x2="60" y2="55" stroke="#3b82f6" strokeWidth="1.5" />
                    <line x1="55" y1="5" x2="65" y2="5" stroke="#3b82f6" strokeWidth="1.5" />
                    <line x1="55" y1="55" x2="65" y2="55" stroke="#3b82f6" strokeWidth="1.5" />
                    <rect x="53" y="15" width="14" height="25" rx="1" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5" />
                    <line x1="53" y1="28" x2="67" y2="28" stroke="#2563eb" strokeWidth="2" />

                    {/* Box 3 */}
                    <line x1="95" y1="15" x2="95" y2="45" stroke="#10b981" strokeWidth="1.5" />
                    <line x1="90" y1="15" x2="100" y2="15" stroke="#10b981" strokeWidth="1.5" />
                    <line x1="90" y1="45" x2="100" y2="45" stroke="#10b981" strokeWidth="1.5" />
                    <rect x="88" y="22" width="14" height="15" rx="1" fill="#6ee7b7" stroke="#10b981" strokeWidth="1.5" />
                    <line x1="88" y1="29" x2="102" y2="29" stroke="#059669" strokeWidth="2" />
                </svg>
            );

        case 'violin':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    {/* Symmetrical density curves */}
                    <path
                        d="M30,10 C35,20 40,25 35,38 C32,44 30,48 30,50 C30,48 28,44 25,38 C20,25 25,20 30,10 Z"
                        fill="#8b5cf6"
                        fillOpacity="0.4"
                        stroke="#8b5cf6"
                        strokeWidth="1.5"
                    />
                    <line x1="30" y1="15" x2="30" y2="45" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="30" cy="30" r="2.5" fill="#fff" />

                    <path
                        d="M75,5 C82,18 90,22 80,42 C77,48 75,52 75,55 C75,52 73,48 70,42 C60,22 68,18 75,5 Z"
                        fill="#3b82f6"
                        fillOpacity="0.4"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                    />
                    <line x1="75" y1="12" x2="75" y2="48" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="75" cy="28" r="2.5" fill="#fff" />
                </svg>
            );

        case 'candlestick':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    {/* Candle 1 (Green) */}
                    <line x1="25" y1="10" x2="25" y2="50" stroke="#10b981" strokeWidth="1.5" />
                    <rect x="20" y="18" width="10" height="22" fill="#10b981" rx="0.5" />

                    {/* Candle 2 (Red) */}
                    <line x1="60" y1="5" x2="60" y2="55" stroke="#ef4444" strokeWidth="1.5" />
                    <rect x="55" y="12" width="10" height="34" fill="#ef4444" rx="0.5" />

                    {/* Candle 3 (Green) */}
                    <line x1="95" y1="15" x2="95" y2="45" stroke="#10b981" strokeWidth="1.5" />
                    <rect x="90" y="24" width="10" height="12" fill="#10b981" rx="0.5" />
                </svg>
            );

        case 'funnel':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <polygon points="10,6 110,6 95,15 25,15" fill="#8b5cf6" fillOpacity="0.85" />
                    <polygon points="27,17 93,17 80,26 40,26" fill="#3b82f6" fillOpacity="0.85" />
                    <polygon points="42,28 78,28 68,37 52,37" fill="#10b981" fillOpacity="0.85" />
                    <polygon points="54,39 66,39 62,48 58,48" fill="#f59e0b" fillOpacity="0.85" />
                    <rect x="58" y="50" width="4" height="6" rx="0.5" fill="#ef4444" />
                </svg>
            );

        case 'pyramid':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <polygon points="60,6 74,20 46,20" fill="#8b5cf6" fillOpacity="0.9" />
                    <polygon points="44,22 76,22 84,34 36,34" fill="#3b82f6" fillOpacity="0.8" />
                    <polygon points="34,36 86,36 94,48 26,48" fill="#10b981" fillOpacity="0.7" />
                    <polygon points="24,50 96,50 102,58 18,58" fill="#f59e0b" fillOpacity="0.6" />
                </svg>
            );

        case 'sankey':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    {/* Left Nodes */}
                    <rect x="10" y="8" width="6" height="16" fill="#8b5cf6" rx="1" />
                    <rect x="10" y="30" width="6" height="22" fill="#3b82f6" rx="1" />

                    {/* Right Nodes */}
                    <rect x="104" y="6" width="6" height="12" fill="#10b981" rx="1" />
                    <rect x="104" y="22" width="6" height="20" fill="#f59e0b" rx="1" />
                    <rect x="104" y="46" width="6" height="8" fill="#ef4444" rx="1" />

                    {/* Connecting Ribbons */}
                    <path d="M 16,16 C 50,16 70,12 104,12 L 104,8 C 70,8 50,12 16,12 Z" fill="#8b5cf6" fillOpacity="0.2" />
                    <path d="M 16,16 C 50,16 70,32 104,32 L 104,26 C 70,26 50,16 16,16 Z" fill="#8b5cf6" fillOpacity="0.25" />
                    <path d="M 16,36 C 50,36 70,26 104,26 L 104,22 C 70,22 50,36 16,36 Z" fill="#3b82f6" fillOpacity="0.2" />
                    <path d="M 16,46 C 50,46 70,38 104,38 L 104,32 C 70,32 50,46 16,46 Z" fill="#3b82f6" fillOpacity="0.25" />
                    <path d="M 16,46 C 50,46 70,50 104,50 L 104,46 C 70,46 50,46 16,46 Z" fill="#3b82f6" fillOpacity="0.15" />
                </svg>
            );

        case 'circular progress':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <circle cx="60" cy="30" r="22" stroke="#e2e8f0" strokeWidth="5" />
                    <circle
                        cx="60"
                        cy="30"
                        r="22"
                        stroke="#8b5cf6"
                        strokeWidth="5"
                        strokeDasharray="138"
                        strokeDashoffset="35"
                        strokeLinecap="round"
                        transform="rotate(-90 60 30)"
                    />
                    <text x="60" y="34" fill="#334155" fontSize="10" fontWeight="bold" textAnchor="middle">75%</text>
                </svg>
            );

        case 'step line':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <path
                        d="M 10,48 L 30,48 L 30,32 L 55,32 L 55,18 L 80,18 L 80,28 L 105,28 L 105,10"
                        stroke="#8b5cf6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle cx="30" cy="32" r="3.5" fill="#8b5cf6" stroke="#fff" strokeWidth="1" />
                    <circle cx="55" cy="18" r="3.5" fill="#8b5cf6" stroke="#fff" strokeWidth="1" />
                    <circle cx="80" cy="28" r="3.5" fill="#8b5cf6" stroke="#fff" strokeWidth="1" />
                    <circle cx="105" cy="10" r="3.5" fill="#8b5cf6" stroke="#fff" strokeWidth="1" />
                </svg>
            );

        case 'bullet':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    {/* Background Ranges */}
                    <rect x="10" y="24" width="100" height="12" rx="2" fill="#f1f5f9" />
                    <rect x="10" y="24" width="70" height="12" rx="2" fill="#cbd5e1" opacity="0.6" />
                    <rect x="10" y="24" width="40" height="12" rx="2" fill="#94a3b8" opacity="0.6" />
                    {/* Actual Value Bar */}
                    <rect x="10" y="28" width="60" height="4" rx="1" fill="#4f46e5" />
                    {/* Target Line */}
                    <line x1="80" y1="20" x2="80" y2="40" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            );

        case 'range bar':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <rect x="25" y="10" width="55" height="6" rx="1.5" fill="#8b5cf6" />
                    <rect x="12" y="22" width="78" height="6" rx="1.5" fill="#3b82f6" />
                    <rect x="45" y="34" width="42" height="6" rx="1.5" fill="#10b981" />
                    <rect x="30" y="46" width="65" height="6" rx="1.5" fill="#f59e0b" />
                </svg>
            );

        case 'velocity trend':
        case 'relay velocity trend':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <line x1="10" y1="42" x2="110" y2="42" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="10" y1="18" x2="110" y2="18" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                    <path
                        d="M10,48 C25,48 40,25 55,20 C70,15 85,28 100,10 L110,12"
                        stroke="#3b82f6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                    <circle cx="55" cy="20" r="3.5" fill="#3b82f6" stroke="#fff" strokeWidth="1" />
                    <circle cx="100" cy="10" r="3.5" fill="#10b981" stroke="#fff" strokeWidth="1" />
                    {/* Low/High Callout Badges */}
                    <g transform="translate(100, 1)">
                        <rect width="18" height="8" rx="2.5" fill="#10b981" />
                        <text x="9" y="6" fill="#fff" fontSize="5" fontWeight="black" textAnchor="middle">High</text>
                    </g>
                    <g transform="translate(15, 38)">
                        <rect width="15" height="8" rx="2.5" fill="#ef4444" />
                        <text x="7.5" y="6" fill="#fff" fontSize="5" fontWeight="black" textAnchor="middle">Low</text>
                    </g>
                </svg>
            );

        case 'relay velocity by sprint':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <rect x="15" y="40" width="10" height="15" rx="1.5" fill="#a855f7" />
                    <rect x="35" y="30" width="10" height="25" rx="1.5" fill="#3b82f6" />
                    <rect x="55" y="20" width="10" height="35" rx="1.5" fill="#10b981" />
                    <rect x="75" y="10" width="10" height="45" rx="1.5" fill="#f59e0b" />
                    <rect x="95" y="25" width="10" height="30" rx="1.5" fill="#ec4899" />
                </svg>
            );

        case 'relay control chart':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <line x1="10" y1="12" x2="110" y2="12" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" />
                    <line x1="10" y1="30" x2="110" y2="30" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="10" y1="48" x2="110" y2="48" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" />
                    <path
                        d="M10,44 L30,38 L50,22 L70,34 L90,15 L110,25"
                        stroke="#3b82f6"
                        strokeWidth="2"
                    />
                    {[10, 30, 50, 70, 90, 110].map((x, idx) => {
                        const ys = [44, 38, 22, 34, 15, 25];
                        return <circle key={idx} cx={x} cy={ys[idx]} r="2.5" fill="#3b82f6" stroke="#fff" strokeWidth="0.8" />;
                    })}
                </svg>
            );

        case 'relay velocity distribution':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <rect x="15" y="45" width="14" height="10" rx="1" fill="#3b82f6" />
                    <rect x="33" y="25" width="14" height="30" rx="1" fill="#3b82f6" />
                    <rect x="51" y="15" width="14" height="40" rx="1" fill="#3b82f6" />
                    <rect x="69" y="30" width="14" height="25" rx="1" fill="#3b82f6" />
                    <rect x="87" y="40" width="14" height="15" rx="1" fill="#3b82f6" />
                </svg>
            );

        case 'relay team contribution':
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <circle cx="60" cy="30" r="18" stroke="#cbd5e1" strokeWidth="6" fill="none" />
                    <circle
                        cx="60"
                        cy="30"
                        r="18"
                        stroke="#a855f7"
                        strokeWidth="6"
                        strokeDasharray="113"
                        strokeDashoffset="45"
                        fill="none"
                    />
                    <circle
                        cx="60"
                        cy="30"
                        r="18"
                        stroke="#3b82f6"
                        strokeWidth="6"
                        strokeDasharray="113"
                        strokeDashoffset="80"
                        transform="rotate(-90 60 30)"
                        fill="none"
                    />
                </svg>
            );

        default:
            return (
                <svg viewBox="0 0 120 60" className="w-full h-full" fill="none">
                    <rect x="10" y="10" width="100" height="40" rx="4" stroke="#e2e8f0" strokeWidth="1" />
                    <text x="60" y="34" fill="#94a3b8" fontSize="8" textAnchor="middle">{name}</text>
                </svg>
            );
    }
}

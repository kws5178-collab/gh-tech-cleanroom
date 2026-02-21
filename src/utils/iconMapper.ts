import {
    Hammer, Wrench, Ruler, PenTool, Zap, Wind, Triangle, Hexagon, Link,
    Circle, Square, Layout, Component, Settings, Scissors, Box,
    Crosshair, Disc, Package, Paintbrush, FileEdit, CheckCircle2,
    Anchor, Grip
} from 'lucide-react';
import React from 'react';

// Common aliases for better matching
// Lucide icons are React components

export const getIconForName = (name: string): React.ElementType => {
    if (!name) return Package;

    const n = name.toLowerCase();

    // --- Tools ---

    // Drilling & Impact
    if (n.includes('드릴') || n.includes('임팩') || n.includes('펀칭')) return Zap;

    // Wrenching & Gripping
    if (n.includes('스패너') || n.includes('렌치') || n.includes('바이스') || n.includes('플라이어')) return Wrench;
    if (n.includes('그립')) return Grip;

    // Hammering
    if (n.includes('망치') || n.includes('함마') || n.includes('해머')) return Hammer;

    // Measuring & Leveling
    if (n.includes('줄자') || n.includes('자') || n.includes('각자')) return Ruler;
    if (n.includes('수평') || n.includes('수직') || n.includes('레벨')) return Crosshair;

    // Marking
    if (n.includes('마커') || n.includes('펜') || n.includes('패드') || n.includes('네임펜')) return PenTool;
    if (n.includes('페인트')) return Paintbrush;

    // Cleaning
    if (n.includes('청소기')) return Wind;

    // Support & Stands
    if (n.includes('삼각대') || n.includes('다이')) return Triangle;

    // Sockets
    if (n.includes('복스')) return Hexagon;

    // Binding
    if (n.includes('결속')) return Link;

    // --- Materials ---

    // Fasteners (Bolts, Nuts, Anchors)
    if (n.includes('앙카') || n.includes('앵커')) return Anchor;
    if (n.includes('볼트') || n.includes('너트') || n.includes('나사') || n.includes('피스')) return Settings; // Gear icon represents mechanics
    if (n.includes('와셔')) return Disc;

    // Structures
    if (n.includes('파이프') || n.includes('환봉')) return Square; // Generic structural shape
    if (n.includes('브라켓') || n.includes('타입')) return Component;
    if (n.includes('판넬')) return Layout;
    if (n.includes('몰드바')) return Box;
    if (n.includes('씰') || n.includes('가스켓')) return Circle;

    // Default
    return Package;
};

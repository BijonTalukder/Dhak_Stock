// StockChartScreen.tsx
// Install: npm install react-native-svg
// Add to android/app/build.gradle & ios Podfile per react-native-svg docs

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Dimensions, PanResponder,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';
import Svg, {
    Circle,
    Defs,
    G,
    Line,
    LinearGradient,
    Path,
    Rect,
    Stop,
    Text as SvgText,
} from 'react-native-svg';
import { MappedStock } from '../screens/MarketTab';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const { width: SW } = Dimensions.get('window');
const PAD_L = 6;
const PAD_R = 54;
const DRAW_W = SW - PAD_L - PAD_R;
const MAIN_H = 260;
const VOL_H = 42;
const SUB_H = 100;
const X_AXIS_H = 20;

const C = {
    bg: '#080C18',
    card: '#0F1528',
    border: '#1A2240',
    text: '#E2E6F3',
    textSub: '#4A5580',
    textMut: '#2E3A60',
    green: '#00D09C',
    red: '#FF4466',
    blue: '#6398FF',
    amber: '#F59E0B',
    orange: '#FB923C',
    purple: '#A78BFA',
    cyan: '#22D3EE',
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type OHLCV = {
    open: number; high: number; low: number;
    close: number; volume: number; time: string;
};
type Period = '1D' | '1W' | '1M' | '3M' | '1Y';
type ChartType = 'candle' | 'line';
type Overlay = 'MA5' | 'MA10' | 'MA20' | 'EMA20' | 'BB' | 'VWAP';
type SubInd = 'RSI' | 'MACD' | 'Volume';

// ─────────────────────────────────────────────────────────────────────────────
// Data Generator (replace with real API when available)
// ─────────────────────────────────────────────────────────────────────────────
function generateOHLCV(stock: MappedStock, period: Period): OHLCV[] {
    const counts: Record<Period, number> = {
        '1D': 78, '1W': 390, '1M': 132, '3M': 180, '1Y': 252,
    };
    const n = counts[period];
    const vola = stock.price * 0.007;
    const data: OHLCV[] = [];
    let price = stock.price / (1 + stock.pct / 100) * (1 - Math.random() * 0.005);
    let cumVol = 0;

    for (let i = 0; i < n; i++) {
        const open = price;
        const move = (Math.random() - 0.475) * vola;
        const close = Math.max(open * 0.9, open + move);
        const wick = vola * 0.4 * Math.random();
        const high = Math.max(open, close) + wick;
        const low = Math.min(open, close) - wick;
        const vol = Math.floor((stock.vol / n) * (0.3 + Math.random() * 1.4));
        cumVol += vol;

        // Time labels
        let time = '';
        if (period === '1D') {
            const m = 570 + i * 5;
            time = `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
        } else if (period === '1W') {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            time = i % 78 === 0 ? days[Math.floor(i / 78)] : '';
        } else if (period === '1M') {
            time = i % 22 === 0 ? `W${Math.floor(i / 22) + 1}` : '';
        } else {
            time = i % 60 === 0 ? `M${Math.floor(i / 60) + 1}` : '';
        }

        data.push({ open, high, low, close, volume: vol, time });
        price = close;
    }

    // Scale last close to match actual current price
    if (data.length) {
        const scale = stock.price / data[data.length - 1].close;
        for (const d of data) {
            d.open *= scale; d.high *= scale;
            d.low *= scale; d.close *= scale;
        }
    }
    return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Technical Indicator Math
// ─────────────────────────────────────────────────────────────────────────────
const closes = (d: OHLCV[]) => d.map(x => x.close);

function sma(data: OHLCV[], n: number): (number | null)[] {
    const cl = closes(data);
    return cl.map((_, i) => {
        if (i < n - 1) return null;
        return cl.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n;
    });
}

function ema(data: OHLCV[], n: number): (number | null)[] {
    const cl = closes(data);
    const k = 2 / (n + 1);
    const res: (number | null)[] = new Array(n - 1).fill(null);
    let val = cl.slice(0, n).reduce((a, b) => a + b, 0) / n;
    res.push(val);
    for (let i = n; i < cl.length; i++) {
        val = cl[i] * k + val * (1 - k);
        res.push(val);
    }
    return res;
}

function emaRaw(vals: number[], n: number): number[] {
    const k = 2 / (n + 1);
    const res = [vals.slice(0, n).reduce((a, b) => a + b, 0) / n];
    for (let i = n; i < vals.length; i++)
        res.push(vals[i] * k + res[res.length - 1] * (1 - k));
    return res;
}

function bb(data: OHLCV[], n = 20, mult = 2) {
    const mid = sma(data, n);
    const upper: (number | null)[] = [];
    const lower: (number | null)[] = [];
    const cl = closes(data);
    cl.forEach((_, i) => {
        if (i < n - 1) { upper.push(null); lower.push(null); return; }
        const slice = cl.slice(i - n + 1, i + 1);
        const mean = mid[i]!;
        const std = Math.sqrt(slice.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
        upper.push(mean + mult * std);
        lower.push(mean - mult * std);
    });
    return { mid, upper, lower };
}

function rsi(data: OHLCV[], n = 14): (number | null)[] {
    const cl = closes(data);
    const res: (number | null)[] = new Array(n).fill(null);
    let ag = 0, al = 0;
    for (let i = 1; i <= n; i++) {
        const d = cl[i] - cl[i - 1];
        if (d > 0) ag += d; else al -= d;
    }
    ag /= n; al /= n;
    const r0 = 100 - 100 / (1 + ag / (al || 1e-9));
    res.push(r0);
    for (let i = n + 1; i < cl.length; i++) {
        const d = cl[i] - cl[i - 1];
        const g = d > 0 ? d : 0;
        const l = d < 0 ? -d : 0;
        ag = (ag * (n - 1) + g) / n;
        al = (al * (n - 1) + l) / n;
        res.push(100 - 100 / (1 + ag / (al || 1e-9)));
    }
    return res;
}

function macd(data: OHLCV[]) {
    const e12 = ema(data, 12);
    const e26 = ema(data, 26);
    const macdLine: (number | null)[] = e12.map((v, i) =>
        v !== null && e26[i] !== null ? v - e26[i]! : null,
    );
    const validMacd = macdLine.filter((v): v is number => v !== null);
    const firstIdx = macdLine.findIndex(v => v !== null);
    const sigRaw = validMacd.length >= 9 ? emaRaw(validMacd, 9) : [];
    const signal: (number | null)[] = new Array(firstIdx + 8).fill(null);
    sigRaw.slice(8).forEach(v => signal.push(v));
    while (signal.length < data.length) signal.push(null);
    const histogram = macdLine.map((m, i) => {
        const s = signal[i];
        return m !== null && s !== null ? m - s : null;
    });
    return { macdLine, signal, histogram };
}

function vwap(data: OHLCV[]): (number | null)[] {
    let cumPV = 0, cumVol = 0;
    return data.map(d => {
        const tp = (d.high + d.low + d.close) / 3;
        cumPV += tp * d.volume;
        cumVol += d.volume;
        return cumVol > 0 ? cumPV / cumVol : null;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Chart Math Helpers
// ─────────────────────────────────────────────────────────────────────────────
const sy = (v: number, lo: number, hi: number, h: number, pad = 4) =>
    pad + (1 - (v - lo) / (hi - lo || 1)) * (h - pad * 2);

function linePath(vals: (number | null)[], lo: number, hi: number, h: number, n: number): string {
    let d = '';
    const step = DRAW_W / n;
    vals.forEach((v, i) => {
        if (v === null) return;
        const x = PAD_L + i * step + step / 2;
        const y = sy(v, lo, hi, h);
        d += d === '' ? `M${x} ${y}` : ` L${x} ${y}`;
    });
    return d;
}

function areaPath(vals: (number | null)[], lo: number, hi: number, h: number, n: number): string {
    let d = '', lx = 0;
    const step = DRAW_W / n;
    let started = false;
    vals.forEach((v, i) => {
        if (v === null) return;
        const x = PAD_L + i * step + step / 2;
        const y = sy(v, lo, hi, h);
        if (!started) { d = `M${x} ${h} L${x} ${y}`; started = true; }
        else d += ` L${x} ${y}`;
        lx = x;
    });
    if (started) d += ` L${lx} ${h} Z`;
    return d;
}

const fmt = (n: number) => n?.toFixed(2) ?? '0.00';
const fmtVol = (n: number) =>
    n >= 1e7 ? `${(n / 1e7).toFixed(2)}Cr`
        : n >= 1e5 ? `${(n / 1e5).toFixed(1)}L`
            : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K`
                : String(n);

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface StockChartScreenProps {
    stock: MappedStock;
    onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const StockChartScreen: React.FC<StockChartScreenProps> = ({
    stock, onClose,
}) => {
    const [period, setPeriod] = useState<Period>('1D');
    const [chartType, setChartType] = useState<ChartType>('candle');
    const [subInd, setSubInd] = useState<SubInd>('RSI');
    const [overlays, setOverlays] = useState<Set<Overlay>>(new Set(['MA5', 'MA20']));
    const [visibleN, setVisibleN] = useState(60);
    const [offset, setOffset] = useState(0);
    const [crossIdx, setCrossIdx] = useState<number | null>(null);
    const [livePrice, setLivePrice] = useState(stock.price);
    const [showSettings, setShowSettings] = useState(false);

    // Simulated live price tick
    useEffect(() => {
        const t = setInterval(() => {
            setLivePrice(p => parseFloat(
                (p + (Math.random() - 0.492) * stock.price * 0.0008).toFixed(2),
            ));
        }, 2500);
        return () => clearInterval(t);
    }, [stock.price]);

    // Raw data
    const allData = useMemo(() => generateOHLCV(stock, period), [stock.id, period]);

    // Visible slice
    const maxOffset = Math.max(0, allData.length - visibleN);
    const safeOffset = Math.min(offset, maxOffset);
    const vis = allData.slice(safeOffset, safeOffset + visibleN);
    const step = DRAW_W / Math.max(1, vis.length);
    const cw = Math.max(1.5, step - 1);

    // Indicators (on full data, then slice)
    const iMA5 = useMemo(() => sma(allData, 5), [allData]);
    const iMA10 = useMemo(() => sma(allData, 10), [allData]);
    const iMA20 = useMemo(() => sma(allData, 20), [allData]);
    const iEMA20 = useMemo(() => ema(allData, 20), [allData]);
    const iBB = useMemo(() => bb(allData), [allData]);
    const iVWAP = useMemo(() => vwap(allData), [allData]);
    const iRSI = useMemo(() => rsi(allData), [allData]);
    const iMACD = useMemo(() => macd(allData), [allData]);

    const sl = (arr: (number | null)[]) => arr.slice(safeOffset, safeOffset + visibleN);
    const vMA5 = sl(iMA5);
    const vMA10 = sl(iMA10);
    const vMA20 = sl(iMA20);
    const vEMA20 = sl(iEMA20);
    const vBBU = sl(iBB.upper);
    const vBBL = sl(iBB.lower);
    const vBBM = sl(iBB.mid);
    const vVWAP = sl(iVWAP);
    const vRSI = sl(iRSI);
    const vMACD = sl(iMACD.macdLine);
    const vSig = sl(iMACD.signal);
    const vHist = sl(iMACD.histogram);

    // Price range
    const prices = vis.flatMap(d => [d.high, d.low]);
    const extras = [
        ...(overlays.has('BB') ? [...vBBU, ...vBBL].filter(Boolean) as number[] : []),
        ...(overlays.has('VWAP') ? vVWAP.filter(Boolean) as number[] : []),
    ];
    const pLo = Math.min(...prices, ...extras) * 0.9985;
    const pHi = Math.max(...prices, ...extras) * 1.0015;

    const volMax = Math.max(1, ...vis.map(d => d.volume));
    const rsiLo = 0, rsiHi = 100;

    const macdVals = [...vMACD, ...vSig, ...vHist].filter(Boolean) as number[];
    const mLo = macdVals.length ? Math.min(...macdVals) * 1.15 : -0.5;
    const mHi = macdVals.length ? Math.max(...macdVals) * 1.15 : 0.5;
    const mZ = sy(0, mLo, mHi, SUB_H);

    // Y-axis grid
    const yGrid = useMemo(() => {
        const ticks = 4;
        return Array.from({ length: ticks + 1 }, (_, i) => {
            const v = pLo + (pHi - pLo) * (i / ticks);
            return { v, y: sy(v, pLo, pHi, MAIN_H) };
        });
    }, [pLo, pHi]);

    // ── Gesture ────────────────────────────────────────────────────────────────
    const panStart = useRef({ x: 0, off: 0 });
    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
            panStart.current = { x: e.nativeEvent.pageX, off: safeOffset };
            const ix = Math.round((e.nativeEvent.locationX - PAD_L) / step);
            setCrossIdx(Math.max(0, Math.min(vis.length - 1, ix)));
        },
        onPanResponderMove: (e, gs) => {
            const scrolled = Math.round(-gs.dx / step);
            setOffset(Math.max(0, Math.min(maxOffset, panStart.current.off + scrolled)));
            const ix = Math.round((e.nativeEvent.locationX - PAD_L) / step);
            setCrossIdx(Math.max(0, Math.min(vis.length - 1, ix)));
        },
        onPanResponderRelease: () => setTimeout(() => setCrossIdx(null), 2000),
    }), [safeOffset, maxOffset, step, vis.length]);

    const toggleOverlay = useCallback((o: Overlay) => {
        setOverlays(prev => {
            const next = new Set(prev);
            next.has(o) ? next.delete(o) : next.add(o);
            return next;
        });
    }, []);

    const zoomIn = () => { setVisibleN(v => Math.max(10, v - 10)); };
    const zoomOut = () => { setVisibleN(v => Math.min(allData.length, v + 15)); };

    // Crosshair candle
    const cd = crossIdx !== null ? vis[crossIdx] : vis[vis.length - 1];
    const isUp = cd ? cd.close >= cd.open : stock.pct >= 0;
    const dispP = crossIdx !== null ? cd?.close ?? livePrice : livePrice;
    const crossX = crossIdx !== null ? PAD_L + crossIdx * step + step / 2 : null;

    // RSI crosshair value
    const crossRSI = crossIdx !== null ? vRSI[crossIdx] : vRSI[vRSI.length - 1];
    const crossMACD = crossIdx !== null ? vMACD[crossIdx] : null;
    const crossSig = crossIdx !== null ? vSig[crossIdx] : null;

    // ── Render helpers ─────────────────────────────────────────────────────────
    const lp = (arr: (number | null)[], lo: number, hi: number, h: number) =>
        linePath(arr, lo, hi, h, vis.length);
    const ap = (arr: (number | null)[], lo: number, hi: number, h: number) =>
        areaPath(arr, lo, hi, h, vis.length);

    // ── Live price Y ───────────────────────────────────────────────────────────
    const livePY = sy(livePrice, pLo, pHi, MAIN_H);
    const livePInRange = livePY > 2 && livePY < MAIN_H - 2;

    return (
        <View style={st.root}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />
            <SafeAreaView style={{ backgroundColor: C.bg }}>

                {/* ── Header ───────────────────────────────────────────────────── */}
                <View style={st.header}>
                    <TouchableOpacity onPress={onClose} style={st.backBtn}>
                        <Text style={{ color: C.text, fontSize: 22, lineHeight: 26 }}>‹</Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={st.symbol}>{stock.symbol}</Text>
                            <View style={st.sectorBadge}>
                                <Text style={{ fontSize: 10, color: C.blue }}>{stock.sector}</Text>
                            </View>
                            {/* Live indicator */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                <View style={st.liveDot} />
                                <Text style={{ fontSize: 9, color: C.green, fontWeight: '700', letterSpacing: 0.5 }}>LIVE</Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: 11, color: C.textSub, marginTop: 1 }}>{stock.name}</Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[st.price, { color: isUp ? C.green : C.red }]}>৳{fmt(dispP)}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: isUp ? C.green : C.red }}>
                            {isUp ? '+' : ''}{stock.pct.toFixed(2)}%
                        </Text>
                    </View>

                    <TouchableOpacity onPress={() => setShowSettings(s => !s)} style={st.settingsBtn}>
                        <Text style={{ color: C.textSub, fontSize: 16 }}>⋮</Text>
                    </TouchableOpacity>
                </View>

                {/* ── OHLCV Bar ─────────────────────────────────────────────────── */}
                <View style={st.ohlcvRow}>
                    {[
                        { l: 'O', v: cd?.open, c: C.text },
                        { l: 'H', v: cd?.high, c: C.green },
                        { l: 'L', v: cd?.low, c: C.red },
                        { l: 'C', v: cd?.close, c: isUp ? C.green : C.red },
                        { l: 'V', v: cd?.volume, c: C.blue, vol: true },
                    ].map(({ l, v, c, vol }) => (
                        <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Text style={{ fontSize: 9, color: C.textSub }}>{l}:</Text>
                            <Text style={{ fontSize: 10, color: c, fontWeight: '600' }}>
                                {v == null ? '—' : vol ? fmtVol(v) : fmt(v)}
                            </Text>
                        </View>
                    ))}
                    {cd?.time ? <Text style={{ fontSize: 9, color: C.textMut, marginLeft: 'auto' }}>{cd.time}</Text> : null}
                </View>
            </SafeAreaView>

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={crossIdx === null}
                bounces={false}>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* MAIN PRICE CHART                                               */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <View style={{ height: MAIN_H, backgroundColor: C.bg }} {...panResponder.panHandlers}>
                    <Svg width={SW} height={MAIN_H}>
                        <Defs>
                            <LinearGradient id="gUp" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={C.green} stopOpacity="0.22" />
                                <Stop offset="1" stopColor={C.green} stopOpacity="0" />
                            </LinearGradient>
                            <LinearGradient id="gDn" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={C.red} stopOpacity="0.22" />
                                <Stop offset="1" stopColor={C.red} stopOpacity="0" />
                            </LinearGradient>
                            <LinearGradient id="gBB" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={C.purple} stopOpacity="0.08" />
                                <Stop offset="1" stopColor={C.purple} stopOpacity="0.08" />
                            </LinearGradient>
                        </Defs>

                        {/* Y-grid */}
                        {yGrid.map(({ v, y }, i) => (
                            <G key={i}>
                                <Line x1={PAD_L} y1={y} x2={SW - PAD_R} y2={y}
                                    stroke={C.border} strokeWidth="0.5" strokeDasharray="4 4" />
                                <SvgText x={SW - PAD_R + 4} y={y + 3.5}
                                    fontSize={8.5} fill={C.textSub} textAnchor="start">
                                    {fmt(v)}
                                </SvgText>
                            </G>
                        ))}

                        {/* Bollinger Bands */}
                        {overlays.has('BB') && (
                            <>
                                <Path d={ap(vBBU, pLo, pHi, MAIN_H)} fill="url(#gBB)" />
                                <Path d={lp(vBBU, pLo, pHi, MAIN_H)} fill="none" stroke={C.purple} strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.7" />
                                <Path d={lp(vBBL, pLo, pHi, MAIN_H)} fill="none" stroke={C.purple} strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.7" />
                                <Path d={lp(vBBM, pLo, pHi, MAIN_H)} fill="none" stroke={C.purple} strokeWidth="0.7" strokeOpacity="0.4" />
                            </>
                        )}

                        {/* VWAP */}
                        {overlays.has('VWAP') && (
                            <Path d={lp(vVWAP, pLo, pHi, MAIN_H)} fill="none" stroke={C.cyan} strokeWidth="1.2" strokeDasharray="6 3" />
                        )}

                        {/* Candlestick or Line */}
                        {chartType === 'candle'
                            ? vis.map((d, i) => {
                                const cx = PAD_L + i * step + step / 2;
                                const oY = sy(d.open, pLo, pHi, MAIN_H);
                                const cY = sy(d.close, pLo, pHi, MAIN_H);
                                const hY = sy(d.high, pLo, pHi, MAIN_H);
                                const lY = sy(d.low, pLo, pHi, MAIN_H);
                                const up = d.close >= d.open;
                                const col = up ? C.green : C.red;
                                const bT = Math.min(oY, cY);
                                const bH = Math.max(1.5, Math.abs(cY - oY));
                                const highlighted = crossIdx === i;
                                return (
                                    <G key={i} opacity={highlighted ? 1 : 0.92}>
                                        <Line x1={cx} y1={hY} x2={cx} y2={lY} stroke={col} strokeWidth={highlighted ? 1.5 : 1} />
                                        <Rect x={cx - cw / 2} y={bT} width={cw} height={bH}
                                            fill={up ? col : col} fillOpacity={up ? 0.95 : 0.8}
                                            stroke={col} strokeWidth="0.5" rx="0.5" />
                                    </G>
                                );
                            })
                            : (
                                <>
                                    <Path d={ap(vis.map(d => d.close), pLo, pHi, MAIN_H)} fill={`url(#${isUp ? 'gUp' : 'gDn'})`} />
                                    <Path d={lp(vis.map(d => d.close), pLo, pHi, MAIN_H)} fill="none"
                                        stroke={isUp ? C.green : C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </>
                            )}

                        {/* MA Overlays */}
                        {overlays.has('MA5') && <Path d={lp(vMA5, pLo, pHi, MAIN_H)} fill="none" stroke={C.amber} strokeWidth="1.2" />}
                        {overlays.has('MA10') && <Path d={lp(vMA10, pLo, pHi, MAIN_H)} fill="none" stroke={C.orange} strokeWidth="1.2" />}
                        {overlays.has('MA20') && <Path d={lp(vMA20, pLo, pHi, MAIN_H)} fill="none" stroke={C.blue} strokeWidth="1.2" />}
                        {overlays.has('EMA20') && <Path d={lp(vEMA20, pLo, pHi, MAIN_H)} fill="none" stroke={C.purple} strokeWidth="1.2" strokeDasharray="5 3" />}

                        {/* Live price line */}
                        {crossIdx === null && livePInRange && (
                            <>
                                <Line x1={PAD_L} y1={livePY} x2={SW - PAD_R} y2={livePY}
                                    stroke={isUp ? C.green : C.red} strokeWidth="0.7" strokeDasharray="6 4" strokeOpacity="0.9" />
                                <Rect x={SW - PAD_R + 2} y={livePY - 9} width={PAD_R - 4} height={17}
                                    fill={isUp ? C.green : C.red} rx="3" />
                                <SvgText x={SW - PAD_R + 2 + (PAD_R - 4) / 2} y={livePY + 3.5}
                                    fontSize="8.5" fill={C.bg} textAnchor="middle" fontWeight="bold">
                                    {fmt(livePrice)}
                                </SvgText>
                            </>
                        )}

                        {/* Crosshair */}
                        {crossIdx !== null && crossX !== null && (
                            <>
                                <Line x1={crossX} y1={2} x2={crossX} y2={MAIN_H - 2}
                                    stroke={C.text} strokeWidth="0.5" strokeDasharray="5 4" strokeOpacity="0.6" />
                                <Line x1={PAD_L} y1={sy(dispP, pLo, pHi, MAIN_H)} x2={SW - PAD_R} y2={sy(dispP, pLo, pHi, MAIN_H)}
                                    stroke={C.text} strokeWidth="0.5" strokeDasharray="5 4" strokeOpacity="0.4" />
                                <Circle cx={crossX} cy={sy(dispP, pLo, pHi, MAIN_H)} r={4.5}
                                    fill={isUp ? C.green : C.red} stroke={C.bg} strokeWidth="2" />
                                {/* Y label */}
                                <Rect x={SW - PAD_R + 2} y={sy(dispP, pLo, pHi, MAIN_H) - 9} width={PAD_R - 4} height={17}
                                    fill={isUp ? C.green : C.red} rx="3" />
                                <SvgText x={SW - PAD_R + 2 + (PAD_R - 4) / 2} y={sy(dispP, pLo, pHi, MAIN_H) + 3.5}
                                    fontSize="8.5" fill={C.bg} textAnchor="middle" fontWeight="bold">
                                    {fmt(dispP)}
                                </SvgText>
                            </>
                        )}
                    </Svg>
                </View>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* VOLUME MINI-BAR                                                */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <View style={{ height: VOL_H, borderTopWidth: 1, borderTopColor: C.border }}>
                    <Svg width={SW} height={VOL_H}>
                        {vis.map((d, i) => {
                            const x = PAD_L + i * step;
                            const bH = Math.max(1, (d.volume / volMax) * (VOL_H - 6));
                            const up = d.close >= d.open;
                            return (
                                <Rect key={i} x={x + 0.5} y={VOL_H - bH - 2} width={Math.max(1, cw)}
                                    height={bH} fill={up ? C.green : C.red}
                                    fillOpacity={crossIdx === i ? 0.9 : 0.4} />
                            );
                        })}
                        {crossX !== null && (
                            <Line x1={crossX} y1={0} x2={crossX} y2={VOL_H}
                                stroke={C.text} strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4" />
                        )}
                        <SvgText x={SW - PAD_R + 4} y={12} fontSize={8} fill={C.textSub}>VOL</SvgText>
                    </Svg>
                </View>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* SUB-INDICATOR PANEL                                            */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <View style={{ height: SUB_H, borderTopWidth: 1, borderTopColor: C.border }}>
                    <Svg width={SW} height={SUB_H}>

                        {/* ── RSI ──────────────────────────────────────────────────── */}
                        {subInd === 'RSI' && (
                            <>
                                {[30, 50, 70].map(lvl => {
                                    const y = sy(lvl, rsiLo, rsiHi, SUB_H);
                                    return (
                                        <G key={lvl}>
                                            <Line x1={PAD_L} y1={y} x2={SW - PAD_R} y2={y}
                                                stroke={lvl === 50 ? C.border : lvl === 70 ? `${C.red}70` : `${C.green}70`}
                                                strokeWidth={lvl === 50 ? 0.8 : 0.6} strokeDasharray="4 4" />
                                            <SvgText x={SW - PAD_R + 4} y={y + 4} fontSize={8} fill={C.textSub}>{lvl}</SvgText>
                                        </G>
                                    );
                                })}
                                {/* Overbought fill */}
                                <Path d={ap(vRSI.map(v => v !== null ? Math.max(70, v) : null), rsiLo, rsiHi, SUB_H)}
                                    fill={`${C.red}18`} />
                                {/* Oversold fill */}
                                <Path d={ap(vRSI.map(v => v !== null ? Math.min(30, v) : null), rsiLo, rsiHi, SUB_H)}
                                    fill={`${C.green}18`} />
                                {/* RSI line */}
                                <Path d={lp(vRSI, rsiLo, rsiHi, SUB_H)} fill="none"
                                    stroke={C.amber} strokeWidth="1.4" strokeLinecap="round" />
                                {/* Crosshair dot */}
                                {crossX !== null && crossRSI !== null && (
                                    <>
                                        <Line x1={crossX} y1={0} x2={crossX} y2={SUB_H}
                                            stroke={C.text} strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4" />
                                        <Circle cx={crossX} cy={sy(crossRSI, rsiLo, rsiHi, SUB_H)}
                                            r={3} fill={C.amber} stroke={C.bg} strokeWidth="1.5" />
                                    </>
                                )}
                                {/* Label */}
                                <SvgText x={PAD_L + 4} y={12} fontSize={9} fill={C.amber} fontWeight="bold">
                                    RSI(14){crossRSI !== null ? `  ${crossRSI.toFixed(1)}` : ''}
                                </SvgText>
                            </>
                        )}

                        {/* ── MACD ─────────────────────────────────────────────────── */}
                        {subInd === 'MACD' && (
                            <>
                                <Line x1={PAD_L} y1={mZ} x2={SW - PAD_R} y2={mZ}
                                    stroke={C.border} strokeWidth="0.8" strokeDasharray="4 4" />
                                {/* Histogram */}
                                {vHist.map((v, i) => {
                                    if (v === null) return null;
                                    const x = PAD_L + i * step;
                                    const y = sy(Math.max(0, v), mLo, mHi, SUB_H);
                                    const h = Math.abs(y - mZ);
                                    return (
                                        <Rect key={i} x={x + 0.5} y={v >= 0 ? y : mZ} width={Math.max(1, cw)}
                                            height={Math.max(0.5, h)} fill={v >= 0 ? `${C.green}65` : `${C.red}65`} />
                                    );
                                })}
                                <Path d={lp(vMACD, mLo, mHi, SUB_H)} fill="none" stroke={C.blue} strokeWidth="1.3" />
                                <Path d={lp(vSig, mLo, mHi, SUB_H)} fill="none" stroke={C.orange} strokeWidth="1.3" />
                                {crossX !== null && (
                                    <Line x1={crossX} y1={0} x2={crossX} y2={SUB_H}
                                        stroke={C.text} strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4" />
                                )}
                                <SvgText x={PAD_L + 4} y={12} fontSize={9} fill={C.blue} fontWeight="bold">
                                    {'MACD(12,26,9)'}
                                    {crossMACD !== null ? `  ${crossMACD.toFixed(3)}` : ''}
                                </SvgText>
                                {crossSig !== null && (
                                    <SvgText x={PAD_L + 4} y={23} fontSize={8} fill={C.orange}>
                                        Sig: {crossSig.toFixed(3)}
                                    </SvgText>
                                )}
                            </>
                        )}

                        {/* ── Volume (large) ───────────────────────────────────────── */}
                        {subInd === 'Volume' && (
                            <>
                                {vis.map((d, i) => {
                                    const x = PAD_L + i * step;
                                    const bH = Math.max(1, (d.volume / volMax) * (SUB_H - 16));
                                    const up = d.close >= d.open;
                                    return (
                                        <Rect key={i} x={x + 0.5} y={SUB_H - bH - 2} width={Math.max(1, cw)}
                                            height={bH} fill={up ? C.green : C.red}
                                            fillOpacity={crossIdx === i ? 0.9 : 0.55} />
                                    );
                                })}
                                {crossX !== null && (
                                    <Line x1={crossX} y1={0} x2={crossX} y2={SUB_H}
                                        stroke={C.text} strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4" />
                                )}
                                <SvgText x={PAD_L + 4} y={12} fontSize={9} fill={C.textSub} fontWeight="bold">Volume</SvgText>
                                <SvgText x={SW - PAD_R + 4} y={12} fontSize={8} fill={C.textSub}>{fmtVol(volMax)}</SvgText>
                            </>
                        )}
                    </Svg>
                </View>

                {/* ── X-Axis Labels ────────────────────────────────────────────── */}
                <View style={{ height: X_AXIS_H }}>
                    <Svg width={SW} height={X_AXIS_H}>
                        {vis
                            .filter((_, i) => i % Math.max(1, Math.floor(vis.length / 6)) === 0)
                            .map((d, _, arr) => {
                                const origI = vis.findIndex(x => x === d);
                                const x = PAD_L + origI * step + step / 2;
                                return d.time ? (
                                    <SvgText key={origI} x={x} y={13} fontSize={8.5} fill={C.textSub} textAnchor="middle">
                                        {d.time}
                                    </SvgText>
                                ) : null;
                            })}
                    </Svg>
                </View>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* CONTROLS PANEL                                                 */}
                {/* ═══════════════════════════════════════════════════════════════ */}

                {/* Period + Zoom Row */}
                <View style={st.controlRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingRight: 8 }}>
                        {(['1D', '1W', '1M', '3M', '1Y'] as Period[]).map(p => (
                            <TouchableOpacity key={p} onPress={() => { setPeriod(p); setOffset(0); }}
                                style={[st.periodBtn, period === p && st.periodActive]}>
                                <Text style={{
                                    fontSize: 12, fontWeight: period === p ? '700' : '500',
                                    color: period === p ? C.blue : C.textSub
                                }}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={{ flexDirection: 'row', gap: 5, marginLeft: 8 }}>
                        <TouchableOpacity onPress={zoomIn} style={st.zoomBtn}><Text style={{ color: C.text, fontSize: 17, lineHeight: 20 }}>+</Text></TouchableOpacity>
                        <TouchableOpacity onPress={zoomOut} style={st.zoomBtn}><Text style={{ color: C.text, fontSize: 17, lineHeight: 20 }}>−</Text></TouchableOpacity>
                    </View>
                </View>

                {/* Chart Type + Sub-indicator Row */}
                <View style={st.rowSection}>
                    {/* Chart Type */}
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        {(['candle', 'line'] as ChartType[]).map(t => (
                            <TouchableOpacity key={t} onPress={() => setChartType(t)}
                                style={[st.chip, chartType === t && { borderColor: C.blue, backgroundColor: `${C.blue}18` }]}>
                                <Text style={{ fontSize: 12, color: chartType === t ? C.blue : C.textSub, fontWeight: chartType === t ? '700' : '500' }}>
                                    {t === 'candle' ? '🕯 Candle' : '📈 Line'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {/* Sub indicator */}
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        {([
                            { k: 'RSI', c: C.amber },
                            { k: 'MACD', c: C.blue },
                            { k: 'Volume', c: C.green },
                        ] as { k: SubInd; c: string }[]).map(({ k, c }) => (
                            <TouchableOpacity key={k} onPress={() => setSubInd(k)}
                                style={[st.chip, subInd === k && { borderColor: c, backgroundColor: `${c}18` }]}>
                                <Text style={{ fontSize: 12, color: subInd === k ? c : C.textSub, fontWeight: subInd === k ? '700' : '500' }}>{k}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Overlays */}
                <View style={st.rowSection}>
                    <Text style={st.sLabel}>Overlays</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                        {([
                            { k: 'MA5', label: 'MA 5', c: C.amber },
                            { k: 'MA10', label: 'MA 10', c: C.orange },
                            { k: 'MA20', label: 'MA 20', c: C.blue },
                            { k: 'EMA20', label: 'EMA 20', c: C.purple },
                            { k: 'BB', label: 'BB(20,2)', c: C.purple },
                            { k: 'VWAP', label: 'VWAP', c: C.cyan },
                        ] as { k: Overlay; label: string; c: string }[]).map(({ k, label, c }) => {
                            const on = overlays.has(k);
                            return (
                                <TouchableOpacity key={k} onPress={() => toggleOverlay(k)}
                                    style={[st.chip, on && { borderColor: c, backgroundColor: `${c}18` }]}>
                                    <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: on ? c : C.textSub, marginRight: 5 }} />
                                    <Text style={{ fontSize: 11, color: on ? c : C.textSub, fontWeight: on ? '700' : '400' }}>{label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Indicator Legend */}
                <View style={[st.rowSection, { paddingTop: 6 }]}>
                    {subInd === 'RSI' && (
                        <View style={st.legend}>
                            <Dot c={C.amber} /><Text style={st.lt}>RSI(14)</Text>
                            <Dot c={`${C.red}80`} ml /><Text style={st.lt}>Overbought &gt;70</Text>
                            <Dot c={`${C.green}80`} ml /><Text style={st.lt}>Oversold &lt;30</Text>
                            {crossRSI !== null && (
                                <Text style={{ fontSize: 11, color: C.amber, marginLeft: 'auto', fontWeight: '700' }}>
                                    {crossRSI.toFixed(1)}
                                </Text>
                            )}
                        </View>
                    )}
                    {subInd === 'MACD' && (
                        <View style={st.legend}>
                            <Dot c={C.blue} /><Text style={st.lt}>MACD</Text>
                            <Dot c={C.orange} ml /><Text style={st.lt}>Signal</Text>
                            <Dot c={`${C.green}80`} ml /><Text style={st.lt}>Histogram</Text>
                        </View>
                    )}
                </View>

                {/* Stats */}
                <View style={st.statsGrid}>
                    {[
                        { label: 'Day High', val: `৳${fmt(stock.high)}`, color: C.green },
                        { label: 'Day Low', val: `৳${fmt(stock.low)}`, color: C.red },
                        { label: 'Prev Close', val: `৳${fmt(stock.ycp)}`, color: C.text },
                        { label: 'Volume', val: fmtVol(stock.vol), color: C.blue },
                        { label: 'Turnover', val: `৳${stock.value.toFixed(2)}Cr`, color: C.text },
                        { label: 'Trades', val: stock.trade.toLocaleString(), color: C.text },
                    ].map(s => (
                        <View key={s.label} style={st.statItem}>
                            <Text style={{ fontSize: 10, color: C.textSub, marginBottom: 3 }}>{s.label}</Text>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: s.color }}>{s.val}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// ── Small helpers ─────────────────────────────────────────────────────────────
const Dot: React.FC<{ c: string; ml?: boolean }> = ({ c, ml }) => (
    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c, marginLeft: ml ? 10 : 0 }} />
);

// ── Styles ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border, gap: 10 },
    backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    settingsBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    symbol: { fontSize: 17, fontWeight: '700', color: C.text },
    price: { fontSize: 19, fontWeight: '700' },
    sectorBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: `${C.blue}20`, borderWidth: 1, borderColor: `${C.blue}40` },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
    ohlcvRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: `${C.card}90`, borderBottomWidth: 1, borderBottomColor: C.border },
    controlRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.border },
    rowSection: { paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.border, gap: 8 },
    periodBtn: { paddingVertical: 6, paddingHorizontal: 13, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
    periodActive: { backgroundColor: `${C.blue}18`, borderColor: C.blue },
    zoomBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
    chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
    sLabel: { fontSize: 10, color: C.textSub, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600' },
    legend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    lt: { fontSize: 10, color: C.textSub, marginLeft: 3 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
    statItem: { width: (SW - 48) / 3 },
});
import React, { useRef, useEffect, useCallback } from 'react';

export interface WheelSegment {
  id: string;
  label: string;
  imageUrl: string;
  color: string;
}

interface SpinWheelProps {
  segments: WheelSegment[];
  targetIndex: number;
  isSpinning: boolean;
  onSpinComplete: () => void;
  size?: number;
}

const IMAGE_CACHE: Map<string, HTMLImageElement> = new Map();

function loadImage(url: string, onLoad?: () => void): HTMLImageElement {
  if (IMAGE_CACHE.has(url)) return IMAGE_CACHE.get(url)!;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  IMAGE_CACHE.set(url, img);
  if (onLoad) img.onload = onLoad;
  return img;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  segments,
  targetIndex,
  isSpinning,
  onSpinComplete,
  size = 380,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  // Stable refs — updated each render, never cause effects to re-run
  const segmentsRef = useRef(segments);
  const onSpinCompleteRef = useRef(onSpinComplete);
  segmentsRef.current = segments;
  onSpinCompleteRef.current = onSpinComplete;

  const segmentCount = segments.length;
  const segAngle = (2 * Math.PI) / segmentCount;

  // ── Stable draw fn (deps: only canvas size & segment count) ──────────
  const draw = useCallback((rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const segs = segmentsRef.current;
    const n = segs.length;
    const ang = (2 * Math.PI) / n;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const R = cx - 14; // main radius

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ── Outer border ring ────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, R + 14, 0, 2 * Math.PI);
    const ringGrad = ctx.createRadialGradient(cx, cy, R, cx, cy, R + 14);
    ringGrad.addColorStop(0, '#1e293b');
    ringGrad.addColorStop(0.6, '#334155');
    ringGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = ringGrad;
    ctx.fill();

    // Small bolt decorations on outer ring
    for (let i = 0; i < n; i++) {
      const boltAngle = rotation + i * ang - Math.PI / 2 + ang / 2;
      const bx = cx + (R + 7) * Math.cos(boltAngle);
      const by = cy + (R + 7) * Math.sin(boltAngle);
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ── Segments ─────────────────────────────────────────────────────
    segs.forEach((seg, i) => {
      const startAngle = rotation + i * ang - Math.PI / 2;
      const endAngle = startAngle + ang;
      const midAngle = startAngle + ang / 2;

      // Wedge gradient
      const grad = ctx.createLinearGradient(
        cx + R * 0.3 * Math.cos(midAngle),
        cy + R * 0.3 * Math.sin(midAngle),
        cx + R * Math.cos(midAngle),
        cy + R * Math.sin(midAngle),
      );
      grad.addColorStop(0, seg.color + 'cc');
      grad.addColorStop(1, seg.color + 'ff');

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Divider line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(startAngle), cy + R * Math.sin(startAngle));
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // ── Image thumbnail in outer half of segment ─────────────────
      const imgInnerR = R * 0.52;
      const imgOuterR = R * 0.88;
      const imgCenterR = (imgInnerR + imgOuterR) / 2;
      const imgCx = cx + imgCenterR * Math.cos(midAngle);
      const imgCy = cy + imgCenterR * Math.sin(midAngle);

      // Size thumb to fit snugly inside segment
      const arcWidth = ang * imgOuterR * 0.8;
      const thumbW = Math.min(arcWidth, R * 0.32);
      const thumbH = thumbW * 1.1;

      const img = IMAGE_CACHE.get(seg.imageUrl);
      if (img?.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.translate(imgCx, imgCy);
        ctx.rotate(midAngle + Math.PI / 2);
        const hw = thumbW / 2;
        const hh = thumbH / 2;
        // Rounded rect clip
        ctx.beginPath();
        const cr = 4;
        ctx.moveTo(-hw + cr, -hh);
        ctx.lineTo(hw - cr, -hh);
        ctx.arcTo(hw, -hh, hw, -hh + cr, cr);
        ctx.lineTo(hw, hh - cr);
        ctx.arcTo(hw, hh, hw - cr, hh, cr);
        ctx.lineTo(-hw + cr, hh);
        ctx.arcTo(-hw, hh, -hw, hh - cr, cr);
        ctx.lineTo(-hw, -hh + cr);
        ctx.arcTo(-hw, -hh, -hw + cr, -hh, cr);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, -hw, -hh, thumbW, thumbH);
        ctx.restore();

        // White border on thumbnail
        ctx.save();
        ctx.translate(imgCx, imgCy);
        ctx.rotate(midAngle + Math.PI / 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const hw2 = thumbW / 2;
        const hh2 = thumbH / 2;
        const cr2 = 4;
        ctx.moveTo(-hw2 + cr2, -hh2);
        ctx.lineTo(hw2 - cr2, -hh2);
        ctx.arcTo(hw2, -hh2, hw2, -hh2 + cr2, cr2);
        ctx.lineTo(hw2, hh2 - cr2);
        ctx.arcTo(hw2, hh2, hw2 - cr2, hh2, cr2);
        ctx.lineTo(-hw2 + cr2, hh2);
        ctx.arcTo(-hw2, hh2, -hw2, hh2 - cr2, cr2);
        ctx.lineTo(-hw2, -hh2 + cr2);
        ctx.arcTo(-hw2, -hh2, -hw2 + cr2, -hh2, cr2);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // ── Label text along the inner portion of the segment (radial) ──
      // Position: at ~30% radius, rotated along the segment direction
      const textR = R * 0.28;
      const textCx = cx + textR * Math.cos(midAngle);
      const textCy = cy + textR * Math.sin(midAngle);

      ctx.save();
      ctx.translate(textCx, textCy);
      // Rotate text so it runs outward from center along midAngle
      ctx.rotate(midAngle + Math.PI / 2);

      const fontSize = Math.max(8, Math.min(11, 300 / n));
      ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Truncate to fit radially
      const maxChars = Math.max(6, Math.floor((ang * R * 0.45) / (fontSize * 0.55)));
      const labelText = seg.label.length > maxChars
        ? seg.label.slice(0, maxChars - 1) + '…'
        : seg.label;

      ctx.strokeText(labelText, 0, 0);
      ctx.fillText(labelText, 0, 0);
      ctx.restore();
    });

    // ── Hub / center cap ──────────────────────────────────────────────
    const hubGrad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, 20);
    hubGrad.addColorStop(0, '#94a3b8');
    hubGrad.addColorStop(0.6, '#475569');
    hubGrad.addColorStop(1, '#1e293b');
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner dot
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
  }, []);  // ← stable: no deps!

  // ── Preload images whenever URLs change ───────────────────────────────
  useEffect(() => {
    segments.forEach((seg) => {
      if (!IMAGE_CACHE.has(seg.imageUrl)) {
        loadImage(seg.imageUrl, () => draw(rotationRef.current));
      }
    });
    draw(rotationRef.current);
  }, [segments, draw]);

  // ── Spin animation — only triggers on isSpinning/targetIndex changes ─
  const isSpinningRef = useRef(isSpinning);
  isSpinningRef.current = isSpinning;
  const targetIndexRef = useRef(targetIndex);
  targetIndexRef.current = targetIndex;

  useEffect(() => {
    if (!isSpinning) return;
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;

    const n = segmentsRef.current.length;
    const ang = (2 * Math.PI) / n;

    // We want the targetIndex segment's midpoint at the top (the indicator)
    // Top = angle -π/2 in our coordinate system (rotation + i*ang - π/2 = -π/2 → we need midAngle = 0 in absolute)
    // midAngle (absolute) = rotation + targetIndex*ang - π/2 + ang/2
    // We want midAngle = -π/2 (pointing up, i.e. 0 in rotated space)
    // ⟹ rotation = -π/2 - (targetIndex*ang + ang/2) + π/2 = -(targetIndex + 0.5)*ang
    // Add extra spins: multiple of 2π
    const baseTarget = -(targetIndexRef.current + 0.5) * ang;
    const extraSpins = (Math.floor(Math.random() * 3) + 6) * 2 * Math.PI;
    // Ensure we always spin forward
    const currentRot = rotationRef.current % (2 * Math.PI);
    let finalRotation = baseTarget + extraSpins;
    // Normalise so we always spin at least one round
    while (finalRotation - currentRot < 2 * Math.PI) finalRotation += 2 * Math.PI;

    const startRot = rotationRef.current;
    const startTime = performance.now();
    const duration = 3800 + Math.random() * 800;

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      rotationRef.current = startRot + easeOut(progress) * (finalRotation - startRot);
      draw(rotationRef.current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = finalRotation % (2 * Math.PI);
        isAnimatingRef.current = false;
        onSpinCompleteRef.current();
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isSpinning, targetIndex, draw]);  // draw is now stable so this is safe

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none transition-all duration-500"
        style={{
          boxShadow: isSpinning
            ? '0 0 50px 15px rgba(99,102,241,0.45), 0 0 100px 30px rgba(168,85,247,0.2)'
            : '0 0 18px 4px rgba(99,102,241,0.12)',
        }}
      />

      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full drop-shadow-2xl"
      />

      {/* Fixed indicator pointer at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 z-20 flex flex-col items-center pointer-events-none">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '22px solid #ef4444',
            filter: 'drop-shadow(0 2px 6px rgba(239,68,68,0.7))',
          }}
        />
      </div>
    </div>
  );
};

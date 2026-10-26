import React, { useEffect, useRef, useCallback } from 'react';
import type { MatrixTerminalMode, TerminalSettings } from '../types/index.ts';

interface MatrixCanvasProps {
  mode: MatrixTerminalMode;
  settings: TerminalSettings;
  interactive?: boolean;
  onRipple?: () => void;
  onSignalTrigger?: (signalId: string) => void;
  className?: string;
  opacity?: number;
}

// Character set combining Latin, hex, katakana-like symbols, and math runes
const CHARACTERS = '0123456789ABCDEF0xλ§░▒▓µπΩψΔ∑Ø¥¢$#%*+=-/<>:;~';

interface Stream {
  x: number;
  y: number;
  speed: number;
  length: number;
  chars: string[];
  fontSize: number;
  layer: number; // 0 = back, 1 = mid, 2 = front (creates depth)
  lastUpdate: number;
  highlightHead: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  decay: number;
}

export const MatrixCanvas: React.FC<MatrixCanvasProps> = ({
  mode,
  settings,
  interactive = true,
  onRipple,
  className = '',
  opacity = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamsRef = useRef<Stream[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  // Get target frame interval in milliseconds based on fpsCap setting
  const getTargetInterval = useCallback(() => {
    switch (settings.fpsCap) {
      case '30':
        return 1000 / 30;
      case '60':
        return 1000 / 60;
      case '120':
        return 1000 / 120;
      case '144':
        return 1000 / 144;
      case 'auto':
      default:
        return 0; // Let rAF run at display natural sync
    }
  }, [settings.fpsCap]);

  // Color mappings based on colorTheme setting
  const getThemeColors = useCallback(() => {
    switch (settings.colorTheme) {
      case 'ghost_cyan':
        return {
          head: '#FFFFFF',
          bright: '#70E8F2',
          mid: '#32B5C4',
          dim: '#155B63',
          faint: '#0B2D31',
          accent: '#A78BFA',
        };
      case 'spectral_violet':
        return {
          head: '#FFFFFF',
          bright: '#C4B5FD',
          mid: '#A78BFA',
          dim: '#6D28D9',
          faint: '#371569',
          accent: '#70E8F2',
        };
      case 'amber_relic':
        return {
          head: '#FFFBEB',
          bright: '#FDE68A',
          mid: '#F0B76D',
          dim: '#B45309',
          faint: '#451A03',
          accent: '#8DFF9B',
        };
      case 'matrix_green':
      default:
        return {
          head: '#F0FFF4',
          bright: '#8DFF9B',
          mid: '#29F06B',
          dim: '#16A34A',
          faint: '#0D4A22',
          accent: '#70E8F2',
        };
    }
  }, [settings.colorTheme]);

  // Initialize or reconfigure streams based on canvas geometry & density
  const initStreams = useCallback((width: number, height: number) => {
    const baseFontSize = 14;
    const densityFactor = settings.density || 1.0;
    // Spacing between columns
    const columnSpacing = Math.max(12, Math.floor(baseFontSize / densityFactor));
    const columnCount = Math.floor(width / columnSpacing);

    const streams: Stream[] = [];

    for (let i = 0; i < columnCount; i++) {
      const x = i * columnSpacing;
      // Stagger initial Y positions above and across screen
      const y = (Math.random() * -height * 1.5) - 20;
      const layer = Math.random() < 0.25 ? 0 : Math.random() < 0.7 ? 1 : 2;
      const speed = (layer === 0 ? 0.7 : layer === 1 ? 1.2 : 1.7) * (settings.speed || 1.0);
      const length = Math.floor(10 + Math.random() * 26 * (layer + 1));
      const fontSize = layer === 0 ? 11 : layer === 1 ? 13 : 15;

      const chars: string[] = [];
      for (let j = 0; j < length; j++) {
        chars.push(CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]);
      }

      streams.push({
        x,
        y,
        speed,
        length,
        chars,
        fontSize,
        layer,
        lastUpdate: 0,
        highlightHead: Math.random() > 0.1,
      });
    }

    streamsRef.current = streams;
  }, [settings.density, settings.speed]);

  // Handle interaction events
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Trigger restrained dispersal ripple
    ripplesRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: 180,
      strength: 35,
      decay: 0.92,
    });

    onRipple?.();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handlePointerLeave = () => {
    mousePosRef.current.active = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // High-DPI handling
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      initStreams(width, height);
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(canvas);

    const targetInterval = getTargetInterval();
    const colors = getThemeColors();
    const brightness = settings.brightness || 1.0;

    // Render loop using requestAnimationFrame and delta time
    const render = (currentTime: number) => {
      if (document.hidden) {
        // Drop frames when backgrounded to conserve CPU
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }

      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = currentTime;
      }

      const elapsed = currentTime - lastFrameTimeRef.current;

      // Frame rate cap limiter
      if (targetInterval > 0 && elapsed < targetInterval) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }

      // Delta time normalized to 60fps (16.67ms = 1.0)
      const delta = Math.min(elapsed / 16.67, 3.0);
      lastFrameTimeRef.current = currentTime;

      // 1. Semi-transparent black clearing for motion trail effect
      ctx.fillStyle = 'rgba(7, 9, 13, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // 2. Process and decay ripples
      const activeRipples = ripplesRef.current;
      for (let r = activeRipples.length - 1; r >= 0; r--) {
        const rip = activeRipples[r];
        rip.radius += 4.5 * delta;
        rip.strength *= Math.pow(rip.decay, delta);
        if (rip.radius > rip.maxRadius || rip.strength < 0.5) {
          activeRipples.splice(r, 1);
        }
      }

      // 3. Render Matrix Streams
      const streams = streamsRef.current;
      const mouse = mousePosRef.current;

      ctx.textAlign = 'center';

      for (let s = 0; s < streams.length; s++) {
        const stream = streams[s];

        // Move stream down
        stream.y += stream.speed * 2.2 * delta;

        // Reset stream if past bottom
        if (stream.y - (stream.length * stream.fontSize) > height) {
          stream.y = Math.random() * -120 - 40;
          stream.speed = (stream.layer === 0 ? 0.7 : stream.layer === 1 ? 1.2 : 1.7) * (settings.speed || 1.0);
        }

        // Randomly mutate characters along the stream for dynamic terminal feel
        if (Math.random() < 0.08 * delta) {
          const randIdx = Math.floor(Math.random() * stream.chars.length);
          stream.chars[randIdx] = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        }

        ctx.font = `${stream.fontSize}px 'JetBrains Mono', monospace`;

        // Render characters of this stream from tail to head
        for (let i = 0; i < stream.chars.length; i++) {
          let charY = stream.y - (i * stream.fontSize);

          // Skip if offscreen
          if (charY < -20 || charY > height + 20) continue;

          let charX = stream.x;

          // Apply ripple displacement physics
          for (let r = 0; r < activeRipples.length; r++) {
            const rip = activeRipples[r];
            const dx = charX - rip.x;
            const dy = charY - rip.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const distDiff = Math.abs(dist - rip.radius);

            if (distDiff < 40) {
              const push = (1 - distDiff / 40) * rip.strength;
              const angle = Math.atan2(dy, dx);
              charX += Math.cos(angle) * push;
              charY += Math.sin(angle) * push;
            }
          }

          // Subtle cursor interaction repulsion
          if (mouse.active) {
            const mdx = charX - mouse.x;
            const mdy = charY - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 70 && mdist > 0) {
              const pushFactor = (1 - mdist / 70) * 12;
              charX += (mdx / mdist) * pushFactor;
            }
          }

          // Coloring hierarchy: head is bright/white, body is mid/dim, tail fades
          const isHead = (i === 0 && stream.highlightHead);
          const isNearHead = i < 3;
          const tailFade = Math.max(0.08, 1 - (i / stream.length));

          if (isHead) {
            ctx.fillStyle = colors.head;
            ctx.shadowColor = colors.bright;
            ctx.shadowBlur = 8 * brightness;
          } else if (isNearHead) {
            ctx.fillStyle = colors.bright;
            ctx.shadowBlur = 4 * brightness;
            ctx.shadowColor = colors.mid;
          } else {
            ctx.shadowBlur = 0;
            // Depth layers modulation
            const baseAlpha = stream.layer === 0 ? 0.35 : stream.layer === 1 ? 0.65 : 0.95;
            ctx.globalAlpha = Math.min(1.0, baseAlpha * tailFade * brightness * opacity);
            ctx.fillStyle = stream.layer === 2 ? colors.mid : stream.layer === 1 ? colors.dim : colors.faint;
          }

          ctx.fillText(stream.chars[i], charX, charY);
          ctx.globalAlpha = 1.0;
          ctx.shadowBlur = 0;
        }
      }

      // 4. Ghost Signal Mode Specific Visuals: Cyan scan-lines and atmospheric pulse
      if (mode === 'ghost_signal') {
        const pulse = (Math.sin(currentTime * 0.003) + 1) * 0.5;
        ctx.fillStyle = `rgba(112, 232, 242, ${0.02 + pulse * 0.03})`;
        ctx.fillRect(0, 0, width, height);

        // Random horizontal interference blips
        if (Math.random() < 0.04) {
          const lineY = Math.random() * height;
          ctx.fillStyle = 'rgba(112, 232, 242, 0.15)';
          ctx.fillRect(0, lineY, width, 1.5);
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      resizeObserver.disconnect();
    };
  }, [
    mode,
    settings.speed,
    settings.density,
    settings.brightness,
    settings.colorTheme,
    settings.fpsCap,
    opacity,
    interactive,
    getTargetInterval,
    getThemeColors,
    initStreams,
  ]);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`w-full h-full block touch-none ${className}`}
      style={{ opacity }}
    />
  );
};

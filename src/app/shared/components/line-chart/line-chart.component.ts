import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  template: `
    @if (values().length < 2) {
      <div class="chart-empty" [style.height.px]="height()">A recolher dados…</div>
    } @else {
      <svg
        class="chart-svg"
        [style.height.px]="height()"
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="12" x2="300" y2="12" class="grid-line" />
        <line x1="0" y1="50" x2="300" y2="50" class="grid-line" />
        <line x1="0" y1="88" x2="300" y2="88" class="grid-line" />
        <path [attr.d]="areaPath()" [attr.fill]="'url(#' + gradientId + ')'" stroke="none" />
        <path [attr.d]="linePath()" fill="none" [attr.stroke]="color()" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" />
        <circle [attr.cx]="lastPoint().x" [attr.cy]="lastPoint().y" r="2.6" [attr.fill]="color()" />
        <defs>
          <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" [attr.stop-color]="color()" stop-opacity="0.22" />
            <stop offset="100%" [attr.stop-color]="color()" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>
    }
  `,
  styles: [`
    :host { display: block; }
    .chart-svg { width: 100%; display: block; }
    .grid-line { stroke: var(--border); stroke-width: 1; stroke-dasharray: 2 3; }
    .chart-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
      font-size: 12.5px;
    }
  `]
})
export class LineChartComponent {
  values = input<number[]>([]);
  color = input('#b9701f');
  height = input(110);

  readonly gradientId = `lc-${Math.random().toString(36).slice(2, 9)}`;

  private readonly points = computed(() => {
    const vs = this.values();
    const n = vs.length;
    if (n < 2) return [] as { x: number; y: number }[];
    const min = Math.min(...vs);
    const max = Math.max(...vs);
    const range = max - min || 1;
    return vs.map((v, i) => ({
      x: (i / (n - 1)) * 300,
      y: 92 - ((v - min) / range) * 80
    }));
  });

  readonly linePath = computed(() => {
    const pts = this.points();
    if (!pts.length) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  });

  readonly areaPath = computed(() => {
    const pts = this.points();
    if (!pts.length) return '';
    const line = this.linePath();
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${line} L${last.x.toFixed(2)},100 L${first.x.toFixed(2)},100 Z`;
  });

  readonly lastPoint = computed(() => {
    const pts = this.points();
    return pts.length ? pts[pts.length - 1] : { x: 0, y: 0 };
  });
}

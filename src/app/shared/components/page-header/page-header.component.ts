import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="page-header">
      <div class="page-header-text">
        <span class="eyebrow">{{ eyebrow() }}</span>
        <h1>{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-header-subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="page-header-actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 24px;
    }
    .page-header-text {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    h1 {
      font-size: 21px;
    }
    .page-header-subtitle {
      color: var(--text-secondary);
      font-size: 13px;
      max-width: 56ch;
    }
    .page-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: none;
    }
  `]
})
export class PageHeaderComponent {
  eyebrow = input('');
  title = input.required<string>();
  subtitle = input<string | undefined>(undefined);
}

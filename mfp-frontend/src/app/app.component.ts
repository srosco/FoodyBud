import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';

const AUTH_ROUTES = ['/login', '/register'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, CommonModule, RouterLink, RouterLinkActive],
  template: `
    <main class="content" [class.no-nav]="!showNav()">
      <router-outlet />
    </main>

    @if (showNav()) {
      <nav class="bottom-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
          <span class="nav-icon"><mat-icon>home</mat-icon></span>
          <span class="nav-label">Journal</span>
        </a>
        <a routerLink="/journal" routerLinkActive="active">
          <span class="nav-icon"><mat-icon>calendar_month</mat-icon></span>
          <span class="nav-label">Calendrier</span>
        </a>
        <a routerLink="/aliments" routerLinkActive="active">
          <span class="nav-icon"><mat-icon>restaurant</mat-icon></span>
          <span class="nav-label">Aliments</span>
        </a>
        <a routerLink="/recettes" routerLinkActive="active">
          <span class="nav-icon"><mat-icon>menu_book</mat-icon></span>
          <span class="nav-label">Recettes</span>
        </a>
        <a routerLink="/objectifs" routerLinkActive="active">
          <span class="nav-icon"><mat-icon>flag</mat-icon></span>
          <span class="nav-label">Objectifs</span>
        </a>
      </nav>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .content {
      flex: 1;
      overflow-y: auto;
      padding-bottom: var(--nav-h, 64px);
    }
    .content.no-nav {
      padding-bottom: 0;
    }
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--nav-h, 64px);
      display: flex;
      justify-content: space-around;
      align-items: stretch;
      background: var(--surface, #fff);
      border-top: 1px solid var(--border, #e2e8e0);
      padding: 0 4px;
      padding-bottom: env(safe-area-inset-bottom, 0);
      z-index: 100;
    }
    .bottom-nav a {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      flex: 1;
      text-decoration: none;
      color: var(--text-3, #9aada5);
      padding: 8px 4px;
      border-radius: 12px;
      margin: 6px 2px;
      transition: color 0.18s, background 0.18s;
      font-family: var(--font, 'DM Sans', sans-serif);
    }
    .bottom-nav a:hover {
      background: var(--primary-light, #dff0e7);
      color: var(--primary, #2b5e45);
    }
    .bottom-nav a.active {
      color: var(--primary, #2b5e45);
      background: var(--primary-light, #dff0e7);
    }
    .bottom-nav a.active .nav-icon {
      transform: translateY(-1px);
    }
    .nav-icon {
      display: flex;
      align-items: center;
      transition: transform 0.18s;
    }
    .nav-icon mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    .nav-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.3px;
      line-height: 1;
    }
  `],
})
export class AppComponent {
  private router = inject(Router);
  showNav = signal(false);

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    ).subscribe((e) => {
      this.showNav.set(!AUTH_ROUTES.some(r => e.urlAfterRedirects.startsWith(r)));
    });

    // Pre-warm Render backend (free tier sleeps after 15min inactivity)
    fetch(`${environment.apiUrl}/health`).catch(() => {});
  }
}

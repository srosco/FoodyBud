import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatIconModule, CommonModule, RouterLink, RouterLinkActive],
  template: `
    <mat-toolbar color="primary">
      <span>MFP</span>
    </mat-toolbar>

    <main class="content">
      <router-outlet />
    </main>

    <nav class="bottom-nav">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
        <mat-icon>home</mat-icon><span>Journal</span>
      </a>
      <a routerLink="/journal" routerLinkActive="active">
        <mat-icon>calendar_month</mat-icon><span>Calendrier</span>
      </a>
      <a routerLink="/aliments" routerLinkActive="active">
        <mat-icon>restaurant</mat-icon><span>Aliments</span>
      </a>
      <a routerLink="/recettes" routerLinkActive="active">
        <mat-icon>menu_book</mat-icon><span>Recettes</span>
      </a>
      <a routerLink="/objectifs" routerLinkActive="active">
        <mat-icon>flag</mat-icon><span>Objectifs</span>
      </a>
    </nav>
  `,
  styles: [`
    .content { padding-bottom: 64px; }
    .bottom-nav { position: fixed; bottom: 0; width: 100%; display: flex; justify-content: space-around; background: white; border-top: 1px solid #e0e0e0; }
    .bottom-nav a { display: flex; flex-direction: column; align-items: center; min-width: 0; flex: 1; text-decoration: none; color: rgba(0,0,0,0.54); padding: 8px 0; font-size: 11px; }
    .bottom-nav a.active { color: #3f51b5; }
  `],
})
export class AppComponent {}

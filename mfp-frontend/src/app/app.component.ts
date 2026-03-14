import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, CommonModule, RouterLink, RouterLinkActive],
  template: `
    <mat-toolbar color="primary">
      <span>MFP</span>
    </mat-toolbar>

    <main class="content">
      <router-outlet />
    </main>

    <nav class="bottom-nav">
      <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
        <mat-icon>home</mat-icon><span>Journal</span>
      </a>
      <a mat-button routerLink="/journal" routerLinkActive="active">
        <mat-icon>calendar_month</mat-icon><span>Calendrier</span>
      </a>
      <a mat-button routerLink="/aliments" routerLinkActive="active">
        <mat-icon>restaurant</mat-icon><span>Aliments</span>
      </a>
      <a mat-button routerLink="/recettes" routerLinkActive="active">
        <mat-icon>menu_book</mat-icon><span>Recettes</span>
      </a>
      <a mat-button routerLink="/objectifs" routerLinkActive="active">
        <mat-icon>flag</mat-icon><span>Objectifs</span>
      </a>
    </nav>
  `,
  styles: [`
    .content { padding-bottom: 64px; }
    .bottom-nav { position: fixed; bottom: 0; width: 100%; display: flex; justify-content: space-around; background: white; border-top: 1px solid #e0e0e0; }
    .bottom-nav a { flex-direction: column; align-items: center; min-width: 0; flex: 1; }
    .bottom-nav .active { color: #3f51b5; }
  `],
})
export class AppComponent {}

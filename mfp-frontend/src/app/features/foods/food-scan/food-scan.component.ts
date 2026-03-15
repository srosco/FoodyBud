import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { FoodsService } from '../../../core/services/foods.service';
import { FoodFormComponent } from '../food-form/food-form.component';
import { Food } from '../../../core/models/food.model';

@Component({
  selector: 'app-food-scan',
  standalone: true,
  imports: [NgIf, FormsModule, MatIconModule, FoodFormComponent],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-header">
        <button class="back-btn" (click)="location.back()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="page-title">Scanner un produit</span>
      </div>

      <!-- Camera view -->
      <div class="camera-section" *ngIf="!manualMode && !scannedData">
        <div class="viewfinder-wrap">
          <video #videoEl autoplay playsinline class="camera-feed"></video>
          <div class="viewfinder">
            <div class="vf-corner tl"></div>
            <div class="vf-corner tr"></div>
            <div class="vf-corner bl"></div>
            <div class="vf-corner br"></div>
          </div>
        </div>
        <p class="camera-hint">Pointez l'appareil vers le code-barres</p>
        <button class="manual-btn" (click)="manualMode = true">
          <mat-icon>keyboard</mat-icon>
          Saisie manuelle
        </button>
      </div>

      <!-- Manual input -->
      <div class="manual-section" *ngIf="manualMode && !scannedData">
        <div class="scan-icon-wrap">
          <mat-icon class="scan-icon">qr_code_scanner</mat-icon>
        </div>
        <p class="manual-hint">Entrez le code-barres manuellement</p>
        <div class="barcode-row">
          <input
            class="barcode-input"
            type="text"
            inputmode="numeric"
            placeholder="Ex : 3017620422003"
            [(ngModel)]="manualBarcode"
            (keyup.enter)="lookupManual()"
          />
          <button class="search-btn" (click)="lookupManual()" [disabled]="!manualBarcode">
            <mat-icon>search</mat-icon>
          </button>
        </div>
        <p class="error-msg" *ngIf="error">
          <mat-icon>info_outline</mat-icon>
          {{ error }}
        </p>
      </div>

      <!-- Found product -->
      <div *ngIf="scannedData">
        <div class="found-banner" *ngIf="!error">
          <mat-icon>check_circle</mat-icon>
          Produit trouvé : <strong>{{ scannedData.name }}</strong>
        </div>
        <div class="found-banner warn" *ngIf="error">
          <mat-icon>info_outline</mat-icon>
          Produit non trouvé — remplis les infos manuellement
        </div>
        <app-food-form [initialData]="scannedData" submitLabel="Enregistrer l'aliment" (submitted)="onSave($event)" />
      </div>

    </div>
  `,
  styles: [`
    .page { min-height: 100%; background: var(--bg); }

    .page-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .back-btn {
      width: 36px; height: 36px;
      border-radius: 10px; border: none;
      background: #EDF2EE;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--primary); flex-shrink: 0;
    }
    .back-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .page-title {
      font-family: var(--font); font-size: 17px; font-weight: 700; color: var(--text);
    }

    /* Camera */
    .camera-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
      gap: 16px;
    }

    .viewfinder-wrap {
      position: relative;
      width: 100%;
      max-width: 340px;
      border-radius: 16px;
      overflow: hidden;
      background: #000;
      aspect-ratio: 1;
    }

    .camera-feed {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .viewfinder {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
    }
    .viewfinder::before {
      content: '';
      position: absolute;
      inset: 25%;
      border: none;
    }

    .vf-corner {
      position: absolute;
      width: 28px; height: 28px;
      border-color: #fff;
      border-style: solid;
      opacity: 0.9;
    }
    .vf-corner.tl { top: 22%; left: 22%; border-width: 3px 0 0 3px; border-radius: 4px 0 0 0; }
    .vf-corner.tr { top: 22%; right: 22%; border-width: 3px 3px 0 0; border-radius: 0 4px 0 0; }
    .vf-corner.bl { bottom: 22%; left: 22%; border-width: 0 0 3px 3px; border-radius: 0 0 0 4px; }
    .vf-corner.br { bottom: 22%; right: 22%; border-width: 0 3px 3px 0; border-radius: 0 0 4px 0; }

    .camera-hint {
      font-family: var(--font); font-size: 13px;
      color: var(--text-3, #9aada5); margin: 0; text-align: center;
    }

    .manual-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 20px; border-radius: 50px;
      border: 1.5px solid var(--border);
      background: var(--surface);
      font-family: var(--font); font-size: 14px; font-weight: 600;
      color: var(--text-2, #5a6e65); cursor: pointer;
    }
    .manual-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* Manual */
    .manual-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 16px 24px;
      gap: 16px;
    }

    .scan-icon-wrap {
      width: 72px; height: 72px;
      border-radius: 20px;
      background: #EDF2EE;
      display: flex; align-items: center; justify-content: center;
    }
    .scan-icon { font-size: 36px; width: 36px; height: 36px; color: var(--primary); }

    .manual-hint {
      font-family: var(--font); font-size: 14px;
      color: var(--text-2, #5a6e65); margin: 0; text-align: center;
    }

    .barcode-row {
      display: flex;
      gap: 8px;
      width: 100%;
      max-width: 340px;
    }

    .barcode-input {
      flex: 1;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 13px 16px;
      font-family: var(--font);
      font-size: 15px;
      font-weight: 500;
      color: var(--text);
      background: var(--surface);
      outline: none;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.5px;
    }
    .barcode-input:focus { border-color: var(--primary); }
    .barcode-input::placeholder { color: var(--text-3, #9aada5); }

    .search-btn {
      width: 50px; height: 50px;
      border-radius: 12px; border: none;
      background: var(--primary); color: #fff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0;
    }
    .search-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .search-btn mat-icon { font-size: 22px; width: 22px; height: 22px; }

    .error-msg {
      display: flex; align-items: center; gap: 6px;
      font-family: var(--font); font-size: 13px;
      color: #E84040; margin: 0;
    }
    .error-msg mat-icon { font-size: 16px; width: 16px; height: 16px; }

    /* Found banner */
    .found-banner {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px;
      background: #EDF2EE;
      font-family: var(--font); font-size: 13px;
      color: var(--primary);
      border-bottom: 1px solid var(--border);
    }
    .found-banner.warn { background: #FFF8E6; color: #CC8800; }
    .found-banner mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
  `],
})
export class FoodScanComponent implements OnInit, OnDestroy {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  location = inject(Location);
  private foodsService = inject(FoodsService);
  private router = inject(Router);

  manualMode = false;
  manualBarcode = '';
  scannedData: Partial<Food> | null = null;
  error = '';
  private reader = new BrowserMultiFormatReader();
  private stream: MediaStream | null = null;

  async ngOnInit() {
    if (!navigator.mediaDevices) { this.manualMode = true; return; }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setTimeout(() => this.startScan(), 200);
    } catch {
      this.manualMode = true;
    }
  }

  private startScan() {
    if (!this.videoEl) return;
    this.reader.decodeFromStream(this.stream!, this.videoEl.nativeElement, (result) => {
      if (result) this.lookup(result.getText());
    });
  }

  lookupManual() { if (this.manualBarcode) this.lookup(this.manualBarcode); }

  private lookup(barcode: string) {
    this.error = '';
    this.foodsService.scan(barcode).subscribe({
      next: (data) => {
        if (!data) {
          this.error = 'Produit non trouvé';
          this.scannedData = { barcode, source: 'CUSTOM' };
        } else {
          this.scannedData = { ...data, source: 'OFF' };
        }
        this.stopStream();
      },
      error: () => {
        this.error = 'Erreur lors de la recherche';
        this.scannedData = { barcode, source: 'CUSTOM' };
        this.stopStream();
      },
    });
  }

  onSave(data: Partial<Food>) {
    this.foodsService.create({ ...data, source: this.scannedData?.source ?? 'CUSTOM' }).subscribe(() => {
      this.router.navigate(['/aliments']);
    });
  }

  ngOnDestroy() { this.stopStream(); }
  private stopStream() { this.stream?.getTracks().forEach((t) => t.stop()); }
}

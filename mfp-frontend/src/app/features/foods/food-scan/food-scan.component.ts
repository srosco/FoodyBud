import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { FoodsService } from '../../../core/services/foods.service';
import { FoodFormComponent } from '../food-form/food-form.component';
import { Food } from '../../../core/models/food.model';

@Component({
  selector: 'app-food-scan',
  standalone: true,
  imports: [NgIf, FormsModule, MatButtonModule, MatInputModule, MatFormFieldModule, FoodFormComponent],
  template: `
    <h1>Scanner un produit</h1>

    <!-- Camera scan (mobile) -->
    <div *ngIf="!manualMode && !scannedData">
      <video #videoEl autoplay style="width: 100%; max-width: 400px;"></video>
      <button mat-stroked-button (click)="manualMode = true">Saisie manuelle</button>
    </div>

    <!-- Manual barcode entry (desktop fallback) -->
    <div *ngIf="manualMode && !scannedData">
      <mat-form-field appearance="outline">
        <mat-label>Code-barres</mat-label>
        <input matInput [(ngModel)]="manualBarcode" />
      </mat-form-field>
      <button mat-raised-button (click)="lookupManual()">Rechercher</button>
    </div>

    <!-- Confirmation form after scan -->
    <div *ngIf="scannedData">
      <p>Produit trouvé : <strong>{{ scannedData.name }}</strong></p>
      <app-food-form [initialData]="scannedData" submitLabel="Enregistrer" (submitted)="onSave($event)" />
    </div>

    <p *ngIf="error" class="error">{{ error }}</p>
  `,
})
export class FoodScanComponent implements OnInit, OnDestroy {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
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

  lookupManual() { this.lookup(this.manualBarcode); }

  private lookup(barcode: string) {
    this.error = '';
    this.foodsService.scan(barcode).subscribe({
      next: (data) => {
        if (!data) {
          this.error = 'Produit non trouvé. Vous pouvez le saisir manuellement.';
          this.scannedData = { barcode, source: 'CUSTOM' };
        } else {
          this.scannedData = { ...data, source: 'OFF' };
        }
        this.stopStream();
      },
      error: () => {
        this.error = 'Erreur lors de la recherche. Saisie manuelle activée.';
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

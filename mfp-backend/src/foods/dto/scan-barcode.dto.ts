import { IsString, IsNotEmpty } from 'class-validator';

export class ScanBarcodeDto {
  @IsString()
  @IsNotEmpty()
  barcode: string;
}

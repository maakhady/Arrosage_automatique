import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTint } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-water-tank',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './water-tank.component.html',
  styleUrls: ['./water-tank.component.css'],
})
export class WaterTankComponent {
  faTint = faTint;
  waterLevel: number = 50; // Niveau d'eau initial (%)
  waterUsed: number = 0; // Eau arrosée en litres
  isWatering: boolean = false;

  startWatering() {
    if (this.waterLevel > 0) {
      this.isWatering = true;
      const interval = setInterval(() => {
        if (this.waterLevel > 0) {
          this.waterLevel -= 5;
          this.waterUsed += 1;
        } else {
          this.isWatering = false;
          clearInterval(interval);
        }
      }, 500);
    }
  }

  stopWatering() {
    this.isWatering = false;
  }
}
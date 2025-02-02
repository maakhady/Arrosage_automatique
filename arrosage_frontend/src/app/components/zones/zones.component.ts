import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h2>Arrosage des Plantes</h2>
        <div class="next-watering">Prochain arrosage : 14h:30</div>
      </div>

      <div class="plant-container">
        <div class="plant" [class.watering]="isWatering">
          <div class="plant-icon">
            <i class="fas fa-seedling"></i>
          </div>
          <div class="plant-status">
            <span>{{ isWatering ? 'Arrosage en cours' : 'Arrosage arrêté' }}</span>
          </div>

          <div class="watering-animation" *ngIf="isWatering">
            <div class="light-pulse"></div>
          </div>
        </div>

        <div class="controls">
          <label class="switch">
            <input type="checkbox" [(ngModel)]="isWatering" (change)="toggleWatering()">
            <span class="slider round"></span>
          </label>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      background-color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin-top: 30px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .next-watering {
      font-size: 16px;
      color: #666;
    }

    .plant-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    .plant {
      position: relative;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 40px;
      background-color: #F9F9F9;
      text-align: center;
      width: 100%;
      max-width: 400px;
      height: 250px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transition: box-shadow 0.3s ease, background-color 0.3s ease;
    }

    .plant.watering {
      border-color: #60A5FA;
      background-color: #EFF6FF;
    }

    .plant-icon {
      font-size: 64px;
      color: #10B981;
      margin-bottom: 16px;
      transition: transform 0.5s ease;
    }

    .plant.watering .plant-icon {
      transform: scale(1.2);
    }

    .plant-status {
      font-size: 18px;
      color: #666;
      font-weight: 500;
    }

    .watering-animation {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
    }

    .light-pulse {
      width: 20px;
      height: 20px;
      background-color: #60A5FA;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(0.8);
        opacity: 0.7;
      }
      50% {
        transform: scale(1.2);
        opacity: 1;
      }
      100% {
        transform: scale(0.8);
        opacity: 0.7;
      }
    }

    .controls {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.4s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #10B981;
    }

    input:checked + .slider:before {
      transform: translateX(26px);
    }
  `]
})
export class ZonesComponent {
  isWatering = false;

  toggleWatering() {
    this.isWatering = !this.isWatering;
    console.log(`Arrosage is now ${this.isWatering ? 'on' : 'off'}`);
  }
}
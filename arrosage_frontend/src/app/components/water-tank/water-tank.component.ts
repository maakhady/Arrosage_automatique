import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTint } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-water-tank',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="bg-white rounded-lg p-6 shadow-lg border border-green-200 max-w-sm mx-auto">
      <h3 class="text-green-700 text-xl font-semibold text-center mb-4">Volume Réservoir</h3>

      <div class="text-gray-600 mt-4 text-center font-medium"><h3>Contrôle Arrosage</h3></div>

      <div class="flex flex-col space-y-3 mt-6">
        <button 
          (click)="startWatering()" 
          class="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-5 rounded-lg shadow-md transition duration-200 transform hover:scale-105 focus:outline-none">
          Arroser
        </button>
        <button 
          (click)="stopWatering()" 
          class="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-5 rounded-lg shadow-md transition duration-200 transform hover:scale-105 focus:outline-none">
          Arrêter
        </button>
      </div>

      <!-- Icône d'arrosage animé -->
      <div class="mt-6 flex justify-center relative">
        <fa-icon *ngIf="isWatering" [icon]="faTint" class="text-blue-400 animate-drop absolute top-[-30px]"></fa-icon>

        <!-- Réservoir d'eau -->
        <div class="w-20 h-28 border-2 border-blue-400 rounded-lg overflow-hidden relative">
          <div class="absolute bottom-0 w-full bg-blue-400 transition-all duration-500" 
               [ngStyle]="{'height': waterLevel + '%'}">
          </div>
        </div>
      </div>

      <!-- Infos niveau d'eau -->
      <div class="mt-4 text-center text-gray-600">
        Niveau d'eau : <span class="font-semibold">{{ waterLevel }}%</span> <br>
        Eau arrosée : <span class="font-semibold">{{ waterUsed }}L</span>
      </div>
    </div>
  `,
  styles: [`
    .animate-drop {
      animation: dropAnimation 1s infinite linear;
    }

    @keyframes dropAnimation {
      0% { transform: translateY(-10px); opacity: 1; }
      100% { transform: translateY(20px); opacity: 0; }
    }

    /* Styles pour le réservoir d'eau */
    .w-20 {
      width: 80px; 
    }

    .h-28 {
      height: 112px;
    }

    /* Styles supplémentaires pour le design */
    .bg-green-600 {
      background-color: #4CAF50;
    }

    .bg-green-700 {
      background-color: #388E3C;
    }

    .bg-red-500 {
      background-color: #F44336;
    }

    .bg-red-600 {
      background-color: #D32F2F;
    }

    .text-green-700 {
      color: #388E3C;
    }

    .text-blue-400 {
      color: #64B5F6;
    }

    .border-green-200 {
      border-color: #C8E6C9;
    }

    .shadow-lg {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .rounded-lg {
      border-radius: 8px;
    }

    .p-6 {
      padding: 24px;
    }

    .mt-4 {
      margin-top: 16px;
    }

    .mt-6 {
      margin-top: 24px;
    }

    .mb-4 {
      margin-bottom: 16px;
    }

    .text-xl {
      font-size: 20px;
    }

    .font-semibold {
      font-weight: 600;
    }

    .text-center {
      text-align: center;
    }

    .flex {
      display: flex;
    }

    .flex-col {
      flex-direction: column;
    }

    .space-y-3 > * + * {
      margin-top: 12px;
    }

    .w-full {
      width: 100%;
    }

    .py-3 {
      padding-top: 12px;
      padding-bottom: 12px;
    }

    .px-5 {
      padding-left: 20px;
      padding-right: 20px;
    }

    .rounded-lg {
      border-radius: 8px;
    }

    .shadow-md {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .transition {
      transition: all 0.2s;
    }

    .duration-200 {
      transition-duration: 0.2s;
    }

    .transform {
      transform: scale(1);
    }

    .hover:scale-105:hover {
      transform: scale(1.05);
    }

    .focus:outline-none:focus {
      outline: none;
    }

    .relative {
      position: relative;
    }

    .absolute {
      position: absolute;
    }

    .top-[-30px] {
      top: -30px;
    }

    .overflow-hidden {
      overflow: hidden;
    }

    .bg-blue-400 {
      background-color: #64B5F6;
    }

    .transition-all {
      transition: all 0.5s;
    }

    .duration-500 {
      transition-duration: 0.5s;
    }

    .text-gray-600 {
      color: #666;
    }

    .font-medium {
      font-weight: 500;
    }
  `]
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
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-card.component.html',
  styleUrls: ['./weather-card.component.css']
})
export class WeatherCardComponent {
  @Input() title!: string;
  @Input() value!: number;
  @Input() unit!: string;
  @Input() valueColor: string = '#10b981';
  @Input() showHumidity: boolean = false;
  @Input() humidityValue?: number;
  @Input() icon!: string;
  @Input() iconColor: string = '#666';
}
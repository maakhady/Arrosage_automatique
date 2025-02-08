// Définition des pins
const int PIN_HUMIDITE = A0;
const int PIN_LUMIERE = A1;
const int PIN_WATER_LEVEL = A2;
const int PIN_BUZZER = 8;

// Seuils d'alerte
const int SEUIL_EAU_BAS = 25;  // Alerte si niveau d'eau < 20%

// Configuration de l'alarme
const int FREQUENCE_ALARME = 2000;  // Fréquence plus aiguë pour l'urgence
const int DUREE_BEEP = 200;         // Beep plus court
const int DUREE_PAUSE = 200;        // Pause plus courte

void setup() {
 Serial.begin(9600);
 pinMode(PIN_BUZZER, OUTPUT);
}

void loop() {
 // Lecture des capteurs
 int humidite = analogRead(PIN_HUMIDITE);
 int lumiere = analogRead(PIN_LUMIERE);
 int niveau_eau = analogRead(PIN_WATER_LEVEL);
 
 // Conversions
 int humidite_pourcent = map(humidite, 0, 1023, 100, 0);
 int niveau_eau_pourcent = map(niveau_eau, 0, 1023, 0, 100);
 
 // Vérification du seuil
 if (niveau_eau_pourcent < SEUIL_EAU_BAS) {
   // Alarme - 3 beeps rapides
   for(int i = 0; i < 3; i++) {
     tone(PIN_BUZZER, FREQUENCE_ALARME);
     delay(DUREE_BEEP);
     noTone(PIN_BUZZER);
     delay(DUREE_PAUSE);
   }
   delay(1000); // Pause plus longue entre les séries de beeps
 } else {
   noTone(PIN_BUZZER);
 }
 
 // Envoi des données
 Serial.print(humidite_pourcent);
 Serial.print(",");
 Serial.print(lumiere);
 Serial.print(",");
 Serial.println(niveau_eau_pourcent);
 
 delay(1000);
}

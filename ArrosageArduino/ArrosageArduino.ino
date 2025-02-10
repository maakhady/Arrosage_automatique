// Définition des pins existants
const int PIN_HUMIDITE = A0;
const int PIN_LUMIERE = A1;
const int PIN_WATER_LEVEL = A2;
const int PIN_BUZZER = 8;
const int PIN_POMPE = 9;  // Pin pour la pompe

// Seuils
const int SEUIL_EAU_BAS = 25;      // Alerte si niveau d'eau < 25%
const int SEUIL_HUMIDITE = 20;     // Active la pompe si humidité < 20%

// Configuration de l'alarme
const int FREQUENCE_ALARME = 2000;
const int DUREE_BEEP = 200;
const int DUREE_PAUSE = 200;

// Variables pour le contrôle
bool modeManuel = false;

void setup() {
  Serial.begin(9600);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_POMPE, OUTPUT);
  digitalWrite(PIN_POMPE, LOW);  // Pompe éteinte au démarrage
}

void loop() {
  // Vérification des commandes série
  if (Serial.available() > 0) {
    String commande = Serial.readStringUntil('\n');
    if (commande == "ON") {
      modeManuel = true;
      digitalWrite(PIN_POMPE, HIGH);
    }
    else if (commande == "OFF") {
      modeManuel = false;  // Retour en mode auto
    }
  }

  // Lecture des capteurs
  int humidite = analogRead(PIN_HUMIDITE);
  int lumiere = analogRead(PIN_LUMIERE);
  int niveau_eau = analogRead(PIN_WATER_LEVEL);
 
  // Conversions
  int humidite_pourcent = map(humidite, 0, 1023, 100, 0);
  int niveau_eau_pourcent = map(niveau_eau, 0, 1023, 0, 100);
 
  // Gestion de la pompe en mode automatique
  if (!modeManuel) {
    if (humidite_pourcent < SEUIL_HUMIDITE && niveau_eau_pourcent > SEUIL_EAU_BAS) {
      digitalWrite(PIN_POMPE, HIGH);
    } else {
      digitalWrite(PIN_POMPE, LOW);
    }
  }

  // Vérification du niveau d'eau bas
  if (niveau_eau_pourcent < SEUIL_EAU_BAS) {
    for(int i = 0; i < 3; i++) {
      tone(PIN_BUZZER, FREQUENCE_ALARME);
      delay(DUREE_BEEP);
      noTone(PIN_BUZZER);
      delay(DUREE_PAUSE);
    }
    delay(1000);
  } else {
    noTone(PIN_BUZZER);
  }
 
  // Envoi des données série
  Serial.print(humidite_pourcent);
  Serial.print(",");
  Serial.print(lumiere);
  Serial.print(",");
  Serial.print(niveau_eau_pourcent);
  Serial.print(",");
  Serial.print(digitalRead(PIN_POMPE));
  Serial.print(",");
  Serial.println(modeManuel ? "MANUEL" : "AUTO");
 
  delay(1000);
}

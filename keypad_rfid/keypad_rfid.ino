#include <SPI.h>
#include <MFRC522.h>
#include <Keypad.h>

#define RST_PIN 9
#define SS_PIN 10

MFRC522 rfid(SS_PIN, RST_PIN);

const byte ROW_NUM = 4;
const byte COL_NUM = 4;

char keys[ROW_NUM][COL_NUM] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};

// Nouvelles broches pour le keypad sans conflit avec RFID
byte pin_rows[ROW_NUM] = {5, 4, 3, 2};    // Lignes modifiées
byte pin_cols[COL_NUM] = {8, 7, 6, A0};   // Colonnes modifiées

Keypad keypad = Keypad(makeKeymap(keys), pin_rows, pin_cols, ROW_NUM, COL_NUM);

void setup() {
  Serial.begin(9600);
  while (!Serial);
  
  SPI.begin();
  rfid.PCD_Init();
  
  Serial.println("Arduino prêt!");
}

void loop() {
  // Lecture RFID
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String uid = "UID:";
    for (byte i = 0; i < rfid.uid.size; i++) {
        uid += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "") + String(rfid.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();
    Serial.println(uid);
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    delay(1000);
  }

  // Lecture du clavier
  char key = keypad.getKey();
  if (key) {
    Serial.println(key);
  }
}

#include <SoftwareSerial.h>

// Sensors
#define PIN_THERMOMETER 1
#define PIN_MOISTURE 0
#define PIN_LDR 1

// Actuators
#define PIN_FAN 5
#define PIN_PUMP 6// TODO: Servo
#define PIN_LAMP 7

// Software serial setup
#define RX 10
#define TX 11
SoftwareSerial mySerial(RX,TX);

#define INTERVAL 1000

void setup(){
    Serial.begin(9600);

    pinMode(PIN_FAN,OUTPUT);
    pinMode(PIN_PUMP,OUTPUT); // TODO: Servo
    pinMode(PIN_LAMP,OUTPUT);

    // Serial to wemos
    mySerial.begin(115200);
}

// Expected format 0 - 7 "b000" - "b111"
// FAN-PUMP-LAMP
void parseAndServiceRequest(String request){
    int r = request.toInt();

    digitalWrite(PIN_FAN ,r & (1<<2));
    digitalWrite(PIN_PUMP,r & (1<<1)); // TODO: Servo
    digitalWrite(PIN_LAMP,r & (1<<0));
} 

// Format /upload?t=32.28&m=1023&l=1023
String stringifyData(){
    String allData = "";
    // TODO: Thermometer
    int t = 0;//analogRead(PIN_THERMOMETER);
    int m = analogRead(PIN_MOISTURE);
    int l = analogRead(PIN_LDR);
    allData = "/upload?t="+String(t)+"&m="+String(m)+"&l="+String(l);
    return allData;
}

void loop(){
    String input = "";

    // Read all incomming data
    while(mySerial.available()){
        input += mySerial.read();
    }

    // Service the request
    if(input.length() > 0){
        Serial.println("Received: "+input);
        parseAndServiceRequest(input);
    }        

    // Gather sensor data and transmit
    String output = stringifyData();
    Serial.println("Transmiting: "+output);
    mySerial.print(output);
    
    delay(INTERVAL);
}

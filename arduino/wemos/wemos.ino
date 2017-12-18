#include <SPI.h>
#include "ESP8266WiFi.h"

#define PORT 8080
#define SERVER String("192.168.43.100")
#define INTERVAL 1000
#define CONNECTION_INTERVAL 5000

char ssid[] = "Redmi"; 
char pass[] = "123123122";    
int keyIndex = 0;    
int lastConnectionTime = 0;

int status = WL_IDLE_STATUS;

WiFiClient client;

void setup() {
  Serial.begin(115200);
  
  while (!Serial);    
  WiFi.begin(ssid, pass);
  delay(5000);
  //Serial.println("Connected to wifi");
  //printWifiStatus(); 
}

void loop() {
  String request = "";

  // Read data from server
  while (client.available()) {
    char c = client.read();
    request = c;
  }
  
  // If server sent request then transmit to uno
  if(request.length() > 0){
    Serial.print(request);    
  }

  // Read all data from uno
  String data = "";
  while(Serial.available()){
    char a = Serial.read();
    data+=a;    
  }  
  // If uno sent data then transmit
  if(data.length() > 0){
    httpRequest(data);
  }

  delay(INTERVAL);
}

void httpRequest(String data) {
  // close any connection before send a new request.
  // This will free the socket on the WiFi shield
  client.stop();

  // if there's a successful connection:
  if (client.connect(SERVER.c_str(), PORT)) {
    //Serial.println("connecting...");
    // send the HTTP PUT request:
    client.println("GET "+data+" HTTP/1.1");
    client.println("Host: "+SERVER);
    client.println("User-Agent: ArduinoWiFi/1.1");
    client.println("Connection: close");
    client.println();

    // note the time that the connection was made:
    lastConnectionTime = millis();
  } else {
    // if you couldn't make a connection:
    //Serial.println("connection failed");
  }
}

void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}

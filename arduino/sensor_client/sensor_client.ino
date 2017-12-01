#include <SPI.h>
#include <WiFi.h>

#define PIN_THERMOMETER 1
#define PIN_MOISTURE 2
#define PIN_LDR 3

#define CALIBRATION_THERMOMETER 1.0f
#define CALIBRATION_MOISTURE 1.0f
#define CALIBRATION_LDR 1.0f

#define PIN_FAN 6
#define PIN_PUMP 7
#define PIN_LAMP 8

#define PORT 8080
#define SERVER String("127.0.0.1")
#define INTERVAL 1000

char ssid[] = "NetworkName"; 
char pass[] = "NetPassword123";    
int keyIndex = 0;    
int lastConnectionTime = 0;

int status = WL_IDLE_STATUS;

WiFiClient client;

void setup() {
  Serial.begin(9600);
  
  while (!Serial);    
 
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue:
    while(true);
  }
 
  // attempt to connect to Wifi network:
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:    
    status = WiFi.begin(ssid, pass);
 
    // wait 5 seconds for connection:
    delay(5000);
  }
  Serial.println("Connected to wifi");
  printWifiStatus(); 
}


void loop() {
  String request = "";
  while (client.available()) {
    char c = client.read();
    request += c;
  }
  if(request.length() > 0){
    Serial.println("Incomming: "+request);
    parseAndServiceRequest(request);
  }  

  if (millis() - lastConnectionTime > INTERVAL) {
    String data = stringifyData();
    Serial.println("Outgoing: "+data);
    httpRequest(data);
  }
  delay(100);
}

void httpRequest(String data) {
  // close any connection before send a new request.
  // This will free the socket on the WiFi shield
  client.stop();

  // if there's a successful connection:
  if (client.connect(SERVER.c_str(), PORT)) {
    Serial.println("connecting...");
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
    Serial.println("connection failed");
  }
}

// Format /upload?t=1023&m=1023&l=1023
String stringifyData(){
  String allData = "";
  int t = analogRead(PIN_THERMOMETER);
  int m = analogRead(PIN_MOISTURE);
  int l = analogRead(PIN_LDR);
  allData = "/upload?t="+String(t)+"&m="+String(m)+"&l="+String(l);
  return allData;
}

// Expected format "101"
void parseAndServiceRequest(String request){
  int r = request.toInt();
  
  digitalWrite(PIN_FAN ,r & (1<<0));
  digitalWrite(PIN_PUMP,r & (1<<1));
  digitalWrite(PIN_LAMP,r & (1<<2));
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

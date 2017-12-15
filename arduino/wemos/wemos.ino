#include <SPI.h>
#include <WiFi.h>

#define PORT 8080
#define SERVER String("127.0.0.1")
#define INTERVAL 1000
#define CONNECTION_INTERVAL 5000

char ssid[] = "NetworkName"; 
char pass[] = "NetPassword123";    
int keyIndex = 0;    
int lastConnectionTime = 0;

int status = WL_IDLE_STATUS;

WiFiClient client;

void setup() {
  Serial.begin(115200);
  
  while (!Serial);    
 
  if (WiFi.status() == WL_NO_SHIELD) {
    //Serial.println("WiFi shield not present");
    // don't continue:
    while(true);
  }
 
  // attempt to connect to Wifi network:
  while (status != WL_CONNECTED) {
    //Serial.print("Attempting to connect to SSID: ");
    //Serial.println(ssid);
    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:    
    status = WiFi.begin(ssid, pass);
 
    // wait 5 seconds for connection:
    delay(CONNECTION_INTERVAL);
  }
  //Serial.println("Connected to wifi");
  //printWifiStatus(); 
}

void loop() {
  String request = "";

  // Read data from server
  while (client.available()) {
    char c = client.read();
    request += c;
  }

  // If server sent request then transmit to uno
  if(request.length() > 0){
    Serial.print(request);    
  }

  // Read all data from uno
  String data = "";
  while(Serial.available()){
    data += Serial.read();    
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
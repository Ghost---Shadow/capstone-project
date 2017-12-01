#define PIN_THERMOMETER 1
#define PIN_MOISTURE 2
#define PIN_LDR 3

#define PIN_FAN 6
#define PIN_PUMP 7
#define PIN_LAMP 8

int val;
String out;

void setup(){
  Serial.begin(9600);
  pinMode(PIN_FAN,OUTPUT);
  pinMode(PIN_PUMP,OUTPUT);
  pinMode(PIN_LAMP,OUTPUT);
  
  pinMode(13, OUTPUT); // debug
}

void toggleWithDelay(int pin,int delayLength){
  digitalWrite(pin, HIGH);       
  delay(delayLength);                  
  digitalWrite(pin, LOW);        
  delay(1000); 
}

void loop(){
  digitalWrite(13, HIGH);
  val = analogRead(PIN_THERMOMETER);
  Serial.println("Temperature: "+String(val));
  
  val = analogRead(PIN_MOISTURE);  
  Serial.println("Moisture: "+String(val));  
  
  val = analogRead(PIN_LDR);  
  Serial.println("Light: "+String(val)); 
  digitalWrite(13, LOW);

  toggleWithDelay(PIN_FAN,3000); 
  toggleWithDelay(PIN_PUMP,3000); 
  toggleWithDelay(PIN_LAMP,1000);  
}


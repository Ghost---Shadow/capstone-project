//Graphs

const server = "http://172.20.10.2:8080"
const status = {
	LED: {
		ON: 0b001,
		OFF: 0b000
	},
	PUMP: {
		ON: 0b010,
		OFF: 0b000
	},
	FAN: {
		ON: 0b100,
		OFF: 0b000
	}
}
current_status = {
	LED: "OFF",
	PUMP: "OFF",
	FAN: "OFF"
}

function createGraphFromData(format, data){
	return graph = {
		animationEnabled: true,
		theme: "light2",
		title:{
			text: format.title
		},
		axisX:{
			vauleFormatString: ""
		},
		axisY:{
			title: format.title,
			suffix: format.suffix,
			minimum: 10
		},
		data: [{
			type: "line",
			name: format.name,
			markerType: "square",
			xValueFormatString: "",
			color: "#F08080",
			yValueFormatString: format.suffix,
			dataPoints: data
		}]
	}
}
tempFormat = {
	title: "Temperature",
	suffix: "C",
	name: "Temperature"
}
moistFormat = {
	title: "Moisture",
	suffix: "",
	name: "Moisture"
}
lightFormat = {
	title: "Light",
	suffix: "",
	name: "Light"
}

sampleDataTemp = [
	{x:1,y:32},
	{x:2,y:36},
	{x:3,y:25}
]

function fetchData(n){
	var req = server + "/getJSON?fetches=" + n;
	console.log(req);
	$.getJSON(req,function(dta){
		temperature = dta.temperature;
		moisture = dta.moisture;
		light = dta.light;
		time = dta.time;
		dataPoints = {
			temperature:[],
			moisture:[],
			light:[]
		}
		for(i = 0; i < time.length; i++){
			dataPoints.temperature.push({x:time[i], y: temperature[i]});
			dataPoints.moisture.push({x:time[i], y: moisture[i]});
			dataPoints.light.push({x:time[i], y: light[i]});
		}
		data = dataPoints;
		graphTemperature = createGraphFromData(tempFormat,data.temperature);
		graphMoisture = createGraphFromData(moistFormat,data.moisture);
		graphLight = createGraphFromData(lightFormat,data.light);
		$("#temperature").CanvasJSChart(graphTemperature);
		$("#moisture").CanvasJSChart(graphMoisture);
		$("#light").CanvasJSChart(graphLight);
	});
}

function forceActuators(led,pump,fan){
	if (typeof(led) == 'undefined') led = "OFF";
	if (typeof(pump) == 'undefined') pump = "OFF";
	if (typeof(fan) == 'undefined') fan = "OFF";
	req = server + "/force"
	data = {
		f: status.LED[led] + status.PUMP[pump] + status.FAN[fan]
	}
	console.log(data);
	$.post(req,data,function(res){
		console.log(res);
	})
}

$(document).ready(function(){
	fetchData(10);
	$("#refresh").click(function(){
		fetchData(10);
	});
	$("#force-led").click(function(){
		if(current_status.LED == "OFF"){
			current_status.LED = "ON";
		}
		else{
			current_status.LED = "OFF";
		}
		forceActuators(current_status.LED,current_status.PUMP,current_status.FAN);
	});
	$("#force-pump").click(function(){
		if(current_status.PUMP == "OFF"){
			current_status.PUMP = "ON";
		}
		else{
			current_status.PUMP = "OFF";
		}
		forceActuators(current_status.LED,current_status.PUMP,current_status.FAN);
	});
	$("#force-fan").click(function(){
		if(current_status.FAN == "OFF"){
			current_status.FAN = "ON";
		}
		else{
			current_status.FAN = "OFF";
		}
		forceActuators(current_status.LED,current_status.PUMP,current_status.FAN);
	});
});

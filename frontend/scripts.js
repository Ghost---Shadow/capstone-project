//Graphs

const server = "localhost"
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
	var data = $.getJSON(req,function(result){
		return result;
	});
	temperature = data.temperature;
	moisture = data.moisture;
	light = data.light;
	time = data.time;
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
	return dataPoints;
}

function forceActuators(led,pump,fan){
	if (typeof(led) == 'undefined') led = "OFF";
	if (typeof(pump) == 'undefined') pump = "OFF";
	if (typeof(fan) == 'undefined') fan = "OFF";
	req = server + "/force"
	data = {
		f: status.LED[led] + status.PUMP[pump] + status.FAN[fan]
	}
	$.post(req,data,function(res){
		console.log(res);
	})
}

$(document).ready(function(){
	data = fetchData(10);
	graphTemperature = createGraphFromData(tempFormat,data.temperature);
	graphMoisture = createGraphFromData(moistFormat,data.moisture);
	graphLight = createGraphFromData(lightFormat,data.light);
	$("#temperature").CanvasJSChart(graphTemperature);
	$("#moisture").CanvasJSChart(graphMoisture);
	$("#light").CanvasJSChart(graphLight);
});

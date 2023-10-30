package main

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"os"
)

// Boiler = (BoilerBase+((Inside-Outside)*BoilerMul) + ((Target-Inside)*OutsideMul))

var BOILER_BASE = 35.0
var BOILER_MUL = 2.0
var OUTSIDE_MUL = 1.5
var SAMPLE_DATA_SIZE = 1000000
var outsideTemps []float64

type HourlyWeatherData struct {
	Time []string  `json:"time"`
	Temp []float64 `json:"temperature_2m"`
}

type WeatherData struct {
	Hourly HourlyWeatherData `json:"hourly"`
}

func main() {
	target := getNewTargetTemp()
	outsideTemps = getOutsideTemps()

	f, err := os.Create("data.csv")
	if err != nil {
		panic(err)
	}

	_, err = f.WriteString("target;inside;outside;boiler\n")
	if err != nil {
		panic(err)
	}

	for i := 0; i < SAMPLE_DATA_SIZE; i++ {
		if i%1000 == 0 { //Reset target every 1000 entries
			target = getNewTargetTemp()
		}

		outside := getRandomOutsideTemp()
		inside := getInsideTemp(target)

		_, err := f.WriteString(fmt.Sprintf("%f;%f;%f;%f\n", target, inside, outside, calcBoilerTemp(target, inside, outside)))
		if err != nil {
			panic(err)
		}
	}

	f.Close()
}

func getNewTargetTemp() float64 {
	return float64((16 + rand.Intn(8)))
}

func calcBoilerTemp(target, inside, outside float64) float64 {
	return (BOILER_BASE + ((inside - outside) * BOILER_MUL) + ((target - inside) * OUTSIDE_MUL))
}

func getInsideTemp(target float64) float64 {
	if rand.Intn(2)%2 == 0 { //Flip a "coin" to decide if it's either plus or minus
		return (target - float64(rand.Intn(5)))
	} else {
		return (target + float64(rand.Intn(5)))
	}
}

func getRandomOutsideTemp() float64 {
	return outsideTemps[rand.Intn(len(outsideTemps))]
}

func getOutsideTemps() []float64 {
	resp, err := http.Get("https://api.open-meteo.com/v1/forecast?latitude=51.435146&longitude=6.762692&hourly=temperature_2m&timezone=Europe%2FBerlin&past_days=92&forecast_days=16")
	if err != nil {
		panic(err)
	}

	bodyBytes, err := io.ReadAll(resp.Body)

	var data WeatherData
	err = json.Unmarshal(bodyBytes, &data)
	if err != nil {
		panic(err)
	}

	return data.Hourly.Temp
}

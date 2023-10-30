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

type HourlyWeatherData struct {
	Time []string  `json:"time"`
	Temp []float64 `json:"temperature_2m"`
}

type WeatherData struct {
	Hourly HourlyWeatherData `json:"hourly"`
}

type CleanWeatherData struct {
	Time string
	Temp float64
}

func main() {
	var target float64
	target = float64((16 + rand.Intn(8)))
	outsideTemps := getOutsideTemps()

	f, err := os.Create("data.csv")
	if err != nil {
		panic(err)
	}

	_, err = f.WriteString("target;inside;outside;boiler\n")
	if err != nil {
		panic(err)
	}

	for i := 0; i < 1000000; i++ {

		if i%1000 == 0 {
			target = float64((16 + rand.Intn(8)))
		}

		outside := outsideTemps[rand.Intn(len(outsideTemps))]
		inside := getInsideTemp(target)

		_, err := f.WriteString(fmt.Sprintf("%f;%f;%f;%f\n", target, inside, outside, calcBoilerTemp(target, inside, outside)))
		if err != nil {
			panic(err)
		}
	}

	f.Close()
}

func calcBoilerTemp(target, inside, outside float64) float64 {
	return (BOILER_BASE + ((inside - outside) * BOILER_MUL) + ((target - inside) * OUTSIDE_MUL))
}

func getInsideTemp(target float64) float64 {
	if rand.Intn(2)%2 == 0 {
		return (target - float64(rand.Intn(5)))
	} else {
		return (target + float64(rand.Intn(5)))
	}
}

func getOutsideTemps() []float64 {
	resp, err := http.Get("https://api.open-meteo.com/v1/forecast?latitude=51.435146&longitude=6.762692&hourly=temperature_2m&timezone=Europe%2FBerlin&past_days=92&forecast_days=16")
	if err != nil {
		panic(err)
	}

	bodyBytes, err := io.ReadAll(resp.Body)

	var dirtyData WeatherData
	err = json.Unmarshal(bodyBytes, &dirtyData)
	if err != nil {
		panic(err)
	}

	return dirtyData.Hourly.Temp
}

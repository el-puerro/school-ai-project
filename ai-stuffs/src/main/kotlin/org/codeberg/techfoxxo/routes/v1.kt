package org.codeberg.techfoxxo.routes

import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.routing.*
import org.codeberg.techfoxxo.routes.v1.GenTrainData
import org.codeberg.techfoxxo.routes.v1.CalcTemp
import org.codeberg.techfoxxo.routes.v1.Train

fun Application.v1(){
    install(ContentNegotiation) {
        json()
    }


    routing {
        route("v1"){
            //v1/gen | arg => usertemp: Wanted user temperature
            GenTrainData()
            //v1/diff | arg => currtemp: Current temperature
            CalcTemp()
            //v1/train
            Train()
        }
    }
}
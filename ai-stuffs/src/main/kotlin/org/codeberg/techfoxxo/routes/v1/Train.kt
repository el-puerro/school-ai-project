package org.codeberg.techfoxxo.routes.v1

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.codeberg.techfoxxo.TrainResponse
import java.io.File

fun Route.Train(){
    post("train"){
        if (!File(System.getProperty("user.dir") + "/knn_heizung/training.csv").exists()){
            call.respond(HttpStatusCode.BadRequest, TrainResponse(1, "Please generate data first."))
            return@post
        }

        val proc = ProcessBuilder("python", "main.py", "train", "training.csv")
            .directory(File(System.getProperty("user.dir") + "/knn_heizung"))
            .redirectOutput(ProcessBuilder.Redirect.PIPE)
            .redirectError(ProcessBuilder.Redirect.PIPE)
            .start()

        call.respond(TrainResponse(0, "Dataset is training, please wait 60 seconds before sending the next request."))
    }
}
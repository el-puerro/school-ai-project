package org.codeberg.techfoxxo.routes.v1

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.codeberg.techfoxxo.TrainResponse
import java.io.File

fun Route.Train(){
    post("train"){
        if (!File(System.getProperty("user.dir") + "/knn_heizung/data.csv").exists()){
            call.respond(HttpStatusCode.BadRequest, TrainResponse(1, "Please generate data first."))
            return@post
        }

        val proc = ProcessBuilder("python", "main.py", "train")
            .directory(File(System.getProperty("user.dir") + "/knn_heizung"))
            .redirectOutput(ProcessBuilder.Redirect.PIPE)
            .redirectError(ProcessBuilder.Redirect.PIPE)
            .start()


        proc.waitFor()
        if (proc.exitValue() != 0){
            call.respond(TrainResponse(proc.exitValue(), proc.errorStream.bufferedReader().readText()))
        } else {
            call.respond(TrainResponse(0, proc.inputStream.bufferedReader().readText()))
        }

    }
}
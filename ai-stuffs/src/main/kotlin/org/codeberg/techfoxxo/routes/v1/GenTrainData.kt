package org.codeberg.techfoxxo.routes.v1

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.codeberg.techfoxxo.TrainResponse
import java.io.File
import java.util.concurrent.TimeUnit


fun Route.GenTrainData(){
    get("gen"){
        
        val proc = ProcessBuilder("python", "main.py", "gen")
            .directory(File(System.getProperty("user.dir") + "/knn_heizung"))
            .redirectOutput(ProcessBuilder.Redirect.PIPE)
            .redirectError(ProcessBuilder.Redirect.PIPE)
            .start()

        proc.waitFor(60, TimeUnit.SECONDS)
        if (proc.exitValue() != 0){
            call.respond(HttpStatusCode.InternalServerError, TrainResponse(1, proc.errorStream.bufferedReader().readText()))
        } else {
            call.respond(TrainResponse(0, proc.inputStream.bufferedReader().readText()))
        }
    }
}
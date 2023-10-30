package org.codeberg.techfoxxo.routes.v1

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.codeberg.techfoxxo.DiffResult
import java.io.File
import java.util.concurrent.TimeUnit

fun Route.GetDiff(){
    get("diff"){
        if (call.request.queryParameters["currtemp"] == null || call.request.queryParameters["currtemp"] == "") {
            call.respond(HttpStatusCode.BadRequest)
            return@get
        }

        val proc = ProcessBuilder("python", "main.py", "run", call.request.queryParameters["currtemp"])
            .directory(File(System.getProperty("user.dir") + "/knn_heizung"))
            .redirectOutput(ProcessBuilder.Redirect.PIPE)
            .redirectError(ProcessBuilder.Redirect.PIPE)
            .start()

        proc.waitFor(60, TimeUnit.SECONDS)

        if (proc.exitValue() != 0){
            call.respond(DiffResult(null, null, proc.errorStream.bufferedReader().readText()))
        } else {
            call.respond(DiffResult(call.request.queryParameters["currtemp"]?.toDoubleOrNull(), proc.inputStream.bufferedReader().readText().toDoubleOrNull(), null))
        }

    }
}
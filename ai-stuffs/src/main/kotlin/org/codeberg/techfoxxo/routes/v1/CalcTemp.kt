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
        if (call.request.queryParameters["target"] == null || call.request.queryParameters["target"] == "") {
            call.respond(HttpStatusCode.BadRequest)
            return@get
        }

        if (call.request.queryParameters["inside"] == null || call.request.queryParameters["inside"] == "") {
            call.respond(HttpStatusCode.BadRequest)
            return@get
        }

        if (call.request.queryParameters["outside"] == null || call.request.queryParameters["outside"] == "") {
            call.respond(HttpStatusCode.BadRequest)
            return@get
        }

        val proc = ProcessBuilder("python", "main.py", "run", call.request.queryParameters["target"], call.request.queryParameters["inside"], call.request.queryParameters["outside"])
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
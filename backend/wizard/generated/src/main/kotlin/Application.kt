package com.algebraquest

import io.ktor.server.application.Application

fun Application.rootModule() {
    configureStatusPages()
    configureHttp()
    configureSerialization()
    configureRouting()
}

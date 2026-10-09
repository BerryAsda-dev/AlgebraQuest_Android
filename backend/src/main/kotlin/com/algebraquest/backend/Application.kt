package com.algebraquest.backend

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

@Serializable data class StoredUser(val username: String, val password: String, val displayName: String, val role: String)
@Serializable data class LoginRequest(val username: String, val password: String)
@Serializable data class UserDto(val username: String, val displayName: String, val role: String)
@Serializable data class LoginResponse(val token: String, val user: UserDto)
@Serializable data class ApiError(val message: String)
private data class Session(val user: UserDto, val expiresAt: Long)

fun main() {
    embeddedServer(Netty, port = System.getenv("PORT")?.toIntOrNull() ?: 8080,
        host = System.getenv("HOST") ?: "127.0.0.1", module = Application::module).start(wait = true)
}

fun Application.module() {
    val usersText = checkNotNull(javaClass.classLoader.getResourceAsStream("users.json")) {
        "No se encontró users.json"
    }.bufferedReader().use { it.readText() }
    val users = Json.decodeFromString<List<StoredUser>>(usersText)
    require(users.map { it.username }.distinct().size == users.size)
    require(users.all { it.role in setOf("ADMINISTRADOR", "SUPERVISOR", "ALUMNO") })
    val sessions = ConcurrentHashMap<String, Session>()
    configureSerialization()
    install(CORS) {
        allowHost("localhost:8081"); allowHost("127.0.0.1:8081")
        allowHeader(HttpHeaders.ContentType); allowHeader(HttpHeaders.Authorization)
        allowMethod(HttpMethod.Post)
    }
    install(StatusPages) {
        exception<io.ktor.server.plugins.BadRequestException> { call, _ ->
            call.respond(HttpStatusCode.BadRequest, ApiError("Solicitud JSON inválida"))
        }
    }
    routing {
        get("/health") { call.respond(mapOf("status" to "ok")) }
        post("/auth/login") {
            val request = call.receive<LoginRequest>()
            val match = users.firstOrNull { it.username == request.username.trim() && it.password == request.password }
            if (match == null) {
                call.respond(HttpStatusCode.Unauthorized, ApiError("Usuario o contraseña incorrectos"))
                return@post
            }
            val now = System.currentTimeMillis()
            sessions.entries.removeIf { it.value.expiresAt <= now }
            val user = UserDto(match.username, match.displayName, match.role)
            val token = UUID.randomUUID().toString()
            sessions[token] = Session(user, now + 8 * 60 * 60 * 1000)
            call.respond(LoginResponse(token, user))
        }
        get("/auth/me") {
            val token = call.request.headers[HttpHeaders.Authorization]?.removePrefix("Bearer ")
            val session = token?.let(sessions::get)?.takeIf { it.expiresAt > System.currentTimeMillis() }
            if (session == null) call.respond(HttpStatusCode.Unauthorized, ApiError("Sesión inválida o expirada"))
            else call.respond(session.user)
        }
        post("/auth/logout") {
            val token = call.request.headers[HttpHeaders.Authorization]?.removePrefix("Bearer ")
            if (token != null) sessions.remove(token)
            call.respond(HttpStatusCode.NoContent)
        }
    }
}
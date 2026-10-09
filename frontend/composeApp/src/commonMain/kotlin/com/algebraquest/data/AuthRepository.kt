package com.algebraquest.data
import com.algebraquest.domain.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

expect fun platformBaseUrl(): String
@Serializable data class LoginRequest(val username: String, val password: String)
@Serializable data class UserDto(val username: String, val displayName: String, val role: String)
@Serializable data class LoginResponse(val token: String, val user: UserDto)
@Serializable data class ApiError(val message: String)

class KtorAuthRepository(private val baseUrl: String = platformBaseUrl()) : AuthRepository {
    private val client = HttpClient {
        install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) }
        install(HttpTimeout) { requestTimeoutMillis = 10_000 }
    }
    override suspend fun login(username: String, password: String): AuthSession {
        val response = client.post("$baseUrl/auth/login") {
            contentType(ContentType.Application.Json); setBody(LoginRequest(username, password))
        }
        if (response.status != HttpStatusCode.OK) {
            val message = runCatching { response.body<ApiError>().message }.getOrDefault("No se pudo iniciar sesión")
            throw AuthException(message)
        }
        val dto = response.body<LoginResponse>()
        val role = Role.entries.firstOrNull { it.name == dto.user.role } ?: throw AuthException("Rol desconocido")
        return AuthSession(dto.token, User(dto.user.username, dto.user.displayName, role))
    }
    override suspend fun logout(token: String) {
        client.post("$baseUrl/auth/logout") { bearerAuth(token) }
    }
    override fun close() = client.close()
}
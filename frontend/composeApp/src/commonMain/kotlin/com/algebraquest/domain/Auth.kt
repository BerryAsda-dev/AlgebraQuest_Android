package com.algebraquest.domain

enum class Role(val title: String, val route: String) {
    ADMINISTRADOR("Administrador", "administrador"),
    SUPERVISOR("Supervisor", "supervisor"),
    ALUMNO("Alumno", "alumno")
}
data class User(val username: String, val displayName: String, val role: Role)
data class AuthSession(val token: String, val user: User)
class AuthException(message: String) : Exception(message)
interface AuthRepository {
    suspend fun login(username: String, password: String): AuthSession
    suspend fun logout(token: String)
    fun close()
}
class LoginUseCase(private val repository: AuthRepository) {
    suspend operator fun invoke(username: String, password: String): AuthSession {
        if (username.isBlank() || password.isBlank()) throw AuthException("Completa el usuario y la contraseña")
        return repository.login(username.trim(), password)
    }
}
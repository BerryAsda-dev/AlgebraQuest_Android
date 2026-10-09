package com.algebraquest.backend
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlinx.serialization.json.*
import kotlin.test.*
class AuthTest {
    @Test fun `JSON credentials return all roles without passwords and logout invalidates token`() = testApplication {
        application { module() }
        val accounts = listOf(Triple("admin", "Admin123!", "ADMINISTRADOR"), Triple("supervisor", "Supervisor123!", "SUPERVISOR"), Triple("alumno", "Alumno123!", "ALUMNO"))
        for ((username, password, role) in accounts) {
            val response = client.post("/auth/login") { contentType(ContentType.Application.Json); setBody("""{"username":"$username","password":"$password"}""") }
            assertEquals(HttpStatusCode.OK, response.status)
            val body = response.bodyAsText()
            assertFalse(body.contains(password))
            val json = Json.parseToJsonElement(body).jsonObject
            assertEquals(role, json["user"]!!.jsonObject["role"]!!.jsonPrimitive.content)
            val token = json["token"]!!.jsonPrimitive.content
            assertEquals(HttpStatusCode.OK, client.get("/auth/me") { bearerAuth(token) }.status)
            assertEquals(HttpStatusCode.NoContent, client.post("/auth/logout") { bearerAuth(token) }.status)
            assertEquals(HttpStatusCode.Unauthorized, client.get("/auth/me") { bearerAuth(token) }.status)
        }
    }
    @Test fun `invalid credentials and missing session are rejected`() = testApplication {
        application { module() }
        assertEquals(HttpStatusCode.Unauthorized, client.post("/auth/login") {
            contentType(ContentType.Application.Json); setBody("""{"username":"admin","password":"incorrecta"}""")
        }.status)
        assertEquals(HttpStatusCode.Unauthorized, client.get("/auth/me").status)
        assertEquals(HttpStatusCode.BadRequest, client.post("/auth/login") {
            contentType(ContentType.Application.Json); setBody("{}")
        }.status)
    }
}
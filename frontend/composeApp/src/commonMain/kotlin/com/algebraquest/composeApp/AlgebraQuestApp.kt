package com.algebraquest.composeApp

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.*
import com.algebraquest.domain.*
import com.algebraquest.ui.AuthViewModel

@Composable fun AlgebraQuestApp() {
    val model = viewModel { AuthViewModel() }
    val state by model.state.collectAsState()
    val nav = rememberNavController()
    LaunchedEffect(state.session?.user?.role) {
        nav.navigate(state.session?.user?.role?.route ?: "login") {
            popUpTo(nav.graph.id) { inclusive = true }; launchSingleTop = true
        }
    }
    MaterialTheme {
        Surface(Modifier.fillMaxSize()) {
            NavHost(navController = nav, startDestination = "login") {
                composable("login") {
                    var username by remember { mutableStateOf("") }
                    var password by remember { mutableStateOf("") }
                    Column(Modifier.padding(24.dp).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        Text("AlgebraQuest", style = MaterialTheme.typography.headlineLarge)
                        Text("Inicia sesión para entrar a tu espacio de aprendizaje")
                        OutlinedTextField(username, { username = it }, label = { Text("Usuario") }, singleLine = true, enabled = !state.loading)
                        OutlinedTextField(password, { password = it }, label = { Text("Contraseña") }, singleLine = true,
                            visualTransformation = PasswordVisualTransformation(), enabled = !state.loading)
                        state.error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
                        Button(onClick = { model.login(username, password); password = "" }, enabled = !state.loading) { Text("Entrar") }
                        if (state.loading) CircularProgressIndicator()
                    }
                }
                Role.entries.forEach { role ->
                    composable(role.route) {
                        val user = state.session?.user
                        if (user != null && user.role == role) {
                            RoleScreen(user, state.loading, model::logout)
                        }
                    }
                }
            }
        }
    }
}

@Composable private fun RoleScreen(user: User, loading: Boolean, logout: () -> Unit) {
    Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Panel de ${user.role.title}", style = MaterialTheme.typography.headlineMedium)
        Text("Bienvenido, ${user.displayName}")
        when (user.role) {
            Role.ADMINISTRADOR -> {
                Text("Administración de AlgebraQuest")
                Text("Gestiona las cuentas y roles de demostración en users.json del servidor local.")
            }
            Role.SUPERVISOR -> {
                Text("Supervisión académica")
                Text("Espacio para seguimiento del aprendizaje y revisión de resultados.")
            }
            Role.ALUMNO -> {
                Text("Mi aprendizaje de álgebra")
                Text("Practica una ecuación: 2x + 3 = 11")
                var answer by remember { mutableStateOf("") }
                var feedback by remember { mutableStateOf("") }
                OutlinedTextField(answer, { answer = it }, label = { Text("Valor de x") }, singleLine = true)
                Button(onClick = { feedback = if (answer.trim().toIntOrNull() == 4) "¡Correcto! x = 4" else "Inténtalo otra vez: resta 3 y divide entre 2." }) { Text("Comprobar") }
                Text(feedback)
            }
        }
        Button(onClick = logout, enabled = !loading) { Text("Cerrar sesión") }
    }
}
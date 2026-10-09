package com.algebraquest.ui
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.algebraquest.data.KtorAuthRepository
import com.algebraquest.domain.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class AuthState(val loading: Boolean = false, val session: AuthSession? = null, val error: String? = null)
class AuthViewModel(private val repository: AuthRepository = KtorAuthRepository()) : ViewModel() {
    private val mutableState = MutableStateFlow(AuthState())
    val state: StateFlow<AuthState> = mutableState.asStateFlow()
    private val loginUseCase = LoginUseCase(repository)
    fun login(username: String, password: String) {
        if (state.value.loading || state.value.session != null) return
        mutableState.value = AuthState(loading = true)
        viewModelScope.launch {
            try { mutableState.value = AuthState(session = loginUseCase(username, password)) }
            catch (e: CancellationException) { throw e }
            catch (e: Exception) {
                mutableState.value = AuthState(error = if (e is AuthException) e.message else "No se pudo conectar con el servidor Ktor local")
            }
        }
    }
    fun logout() {
        val session = state.value.session ?: return
        mutableState.value = AuthState(loading = true, session = session)
        viewModelScope.launch {
            try { repository.logout(session.token) }
            catch (e: CancellationException) { throw e }
            catch (_: Exception) { /* La sesión local se elimina incluso sin red. */ }
            finally { mutableState.value = AuthState() }
        }
    }
    override fun onCleared() { repository.close(); super.onCleared() }
}
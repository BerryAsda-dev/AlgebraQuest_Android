package com.algebraquest
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.window.ComposeViewport
import com.algebraquest.composeApp.AlgebraQuestApp
@OptIn(ExperimentalComposeUiApi::class)
fun main() { ComposeViewport { AlgebraQuestApp() } }
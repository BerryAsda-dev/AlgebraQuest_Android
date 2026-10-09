package com.algebraquest.multiplatform
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.algebraquest.composeApp.AlgebraQuestApp
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { AlgebraQuestApp() }
    }
}
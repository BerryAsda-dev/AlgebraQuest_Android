import org.jetbrains.kotlin.gradle.ExperimentalWasmDsl
plugins {
    kotlin("multiplatform"); kotlin("plugin.serialization")
    id("com.android.library"); id("org.jetbrains.compose"); id("org.jetbrains.kotlin.plugin.compose")
}
kotlin {
    androidTarget()
    iosArm64(); iosSimulatorArm64()
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.framework { baseName = "ComposeApp"; isStatic = true }
    }
    @OptIn(ExperimentalWasmDsl::class)
    wasmJs { browser { commonWebpackConfig { devServer = (devServer ?: org.jetbrains.kotlin.gradle.targets.js.webpack.KotlinWebpackConfig.DevServer()).apply { port = 8081 } } }; binaries.executable() }
    sourceSets {
        commonMain.dependencies {
            implementation(compose.runtime); implementation(compose.foundation)
            implementation(compose.material3); implementation(compose.ui)
            implementation("org.jetbrains.androidx.lifecycle:lifecycle-viewmodel-compose:2.9.4")
            implementation("org.jetbrains.androidx.navigation:navigation-compose:2.9.0")
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2")
            implementation("io.ktor:ktor-client-core:3.3.0")
            implementation("io.ktor:ktor-client-content-negotiation:3.3.0")
            implementation("io.ktor:ktor-serialization-kotlinx-json:3.3.0")
        }
        androidMain.dependencies { implementation("io.ktor:ktor-client-okhttp:3.3.0") }
        iosMain.dependencies { implementation("io.ktor:ktor-client-darwin:3.3.0") }
        wasmJsMain.dependencies { implementation("io.ktor:ktor-client-js:3.3.0") }
        commonTest.dependencies { implementation(kotlin("test")) }
    }
}
android { namespace = "com.algebraquest.shared"; compileSdk = 36; defaultConfig { minSdk = 23 } }
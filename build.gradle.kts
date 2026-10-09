plugins {
    id("com.android.application") version "8.11.1" apply false
    id("com.android.library") version "8.11.1" apply false
    kotlin("multiplatform") version "2.2.20" apply false
    kotlin("android") version "2.2.20" apply false
    kotlin("jvm") version "2.2.20" apply false
    kotlin("plugin.serialization") version "2.2.20" apply false
    id("org.jetbrains.compose") version "1.9.0" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.2.20" apply false
}
// Use the installed Node.js without adding a distribution repository.
plugins.withType<org.jetbrains.kotlin.gradle.targets.wasm.nodejs.WasmNodeJsRootPlugin> {
    extensions.configure<org.jetbrains.kotlin.gradle.targets.wasm.nodejs.WasmNodeJsEnvSpec> {
        download.set(false)
    }
}

// Kotlin 2.2 also uses the JS Node environment when invoking Webpack for Wasm.
plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsRootPlugin> {
    extensions.configure<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec> {
        download.set(false)
    }
}

allprojects {
    plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
        extensions.configure<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec> {
            download.set(false)
        }
    }
    plugins.withType<org.jetbrains.kotlin.gradle.targets.wasm.nodejs.WasmNodeJsPlugin> {
        extensions.configure<org.jetbrains.kotlin.gradle.targets.wasm.nodejs.WasmNodeJsEnvSpec> {
            download.set(false)
        }
    }
}

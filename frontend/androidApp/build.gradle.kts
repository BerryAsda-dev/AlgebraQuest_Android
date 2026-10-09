plugins { id("com.android.application"); kotlin("android"); id("org.jetbrains.kotlin.plugin.compose") }
android {
    namespace = "com.algebraquest.multiplatform"
    compileSdk = 36
    defaultConfig { applicationId = "com.algebraquest.android"; minSdk = 23; targetSdk = 36; versionCode = 2; versionName = "2.0" }
    buildFeatures { compose = true }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
dependencies { implementation(project(":frontend:composeApp")); implementation("androidx.activity:activity-compose:1.10.1") }
kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }

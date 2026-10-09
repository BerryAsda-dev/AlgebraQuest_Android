plugins {
    id("com.android.application")
}

android {
    namespace = "com.algebraquest.android"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.algebraquest.android"
        minSdk = 23
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
}

tasks.register<Copy>("syncAssets") {
    from(rootDir) {
        include("index.html")
        include("css/**")
        include("js/**")
        include("img/**")
    }
    into(layout.projectDirectory.dir("src/main/assets"))
}

tasks.named("preBuild") {
    dependsOn("syncAssets")
}
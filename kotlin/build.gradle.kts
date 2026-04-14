plugins {
    kotlin("jvm") version "2.0.21"
}

group = "frc.engineer"
version = "0.3.0"

repositories {
    mavenCentral()
}

kotlin {
    jvmToolchain(17)
}

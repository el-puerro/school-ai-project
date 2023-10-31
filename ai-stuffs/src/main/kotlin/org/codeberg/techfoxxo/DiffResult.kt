package org.codeberg.techfoxxo

import kotlinx.serialization.Serializable

@Serializable
data class DiffResult(
    val target: Double?,
    val inside: Double?,
    val outside: Double?,
    val boiler: Double?,
    val error: String?
)

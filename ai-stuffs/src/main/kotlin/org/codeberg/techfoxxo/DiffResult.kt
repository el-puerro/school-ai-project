package org.codeberg.techfoxxo

import kotlinx.serialization.Serializable

@Serializable
data class DiffResult(
    val currTemp: Double?,
    val diff: Double?,
    val error: String?
)

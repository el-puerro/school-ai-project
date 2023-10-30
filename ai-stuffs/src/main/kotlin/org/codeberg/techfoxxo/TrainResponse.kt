package org.codeberg.techfoxxo

import kotlinx.serialization.Serializable

@Serializable
data class TrainResponse(
    val code: Int,
    val message: String
)

package com.streamx.iptv.model

data class Channel(
    val id: Long,
    val name: String,
    val groupTitle: String,
    val streamUrl: String,
    val logoUrl: String? = null
)

enum class PlaybackStatus {
    IDLE,
    BUFFERING,
    PLAYING,
    PAUSED,
    ERROR
}

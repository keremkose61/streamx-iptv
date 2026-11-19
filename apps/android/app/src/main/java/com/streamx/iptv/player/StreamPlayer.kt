package com.streamx.iptv.player

import android.content.Context
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.hls.HlsMediaSource
import androidx.media3.datasource.DefaultHttpDataSource
import com.streamx.iptv.model.PlaybackStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

@OptIn(UnstableApi::class)
class StreamPlayer(private val context: Context) {

    val exoPlayer: ExoPlayer by lazy {
        val loadControl = DefaultLoadControl.Builder()
            .setBufferDurationsMs(
                15000, // min buffer 15s
                30000, // max buffer 30s
                2500,  // buffer for playback 2.5s
                5000   // buffer for re-buffer 5s
            )
            .build()

        ExoPlayer.Builder(context)
            .setLoadControl(loadControl)
            .build().apply {
                playWhenReady = true
                addListener(playerListener)
            }
    }

    private val _status = MutableStateFlow(PlaybackStatus.IDLE)
    val status: StateFlow<PlaybackStatus> = _status.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    private val playerListener = object : Player.Listener {
        override fun onPlaybackStateChanged(playbackState: Int) {
            when (playbackState) {
                Player.STATE_BUFFERING -> _status.value = PlaybackStatus.BUFFERING
                Player.STATE_READY -> _status.value = if (exoPlayer.playWhenReady) PlaybackStatus.PLAYING else PlaybackStatus.PAUSED
                Player.STATE_ENDED -> _status.value = PlaybackStatus.IDLE
                Player.STATE_IDLE -> _status.value = PlaybackStatus.IDLE
            }
        }

        override fun onPlayerError(error: PlaybackException) {
            _status.value = PlaybackStatus.ERROR
            _errorMessage.value = "Yayın akışı kesildi: ${error.localizedMessage ?: "Bağlantı hatası"}"
        }
    }

    fun playStream(url: String) {
        _errorMessage.value = null
        _status.value = PlaybackStatus.BUFFERING

        val dataSourceFactory = DefaultHttpDataSource.Factory()
            .setAllowCrossProtocolRedirects(true)
            .setConnectTimeoutMs(15000)
            .setReadTimeoutMs(15000)

        val mediaSource = HlsMediaSource.Factory(dataSourceFactory)
            .createMediaSource(MediaItem.fromUri(url))

        exoPlayer.setMediaSource(mediaSource)
        exoPlayer.prepare()
        exoPlayer.play()
    }

    fun togglePlayPause() {
        if (exoPlayer.isPlaying) {
            exoPlayer.pause()
            _status.value = PlaybackStatus.PAUSED
        } else {
            exoPlayer.play()
            _status.value = PlaybackStatus.PLAYING
        }
    }

    fun release() {
        exoPlayer.removeListener(playerListener)
        exoPlayer.release()
    }
}

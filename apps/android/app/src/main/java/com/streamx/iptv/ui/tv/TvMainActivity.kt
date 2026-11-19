package com.streamx.iptv.ui.tv

import android.os.Bundle
import android.view.KeyEvent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Tv
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.util.UnstableApi
import androidx.media3.ui.PlayerView
import com.streamx.iptv.model.Channel
import com.streamx.iptv.player.StreamPlayer

class TvMainActivity : ComponentActivity() {

    private lateinit var streamPlayer: StreamPlayer

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        streamPlayer = StreamPlayer(this)

        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(modifier = Modifier.fillMaxSize(), color = Color.Black) {
                    TvPlayerScreen(streamPlayer)
                }
            }
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        when (keyCode) {
            KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER -> {
                streamPlayer.togglePlayPause()
                return true
            }
            KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> {
                streamPlayer.togglePlayPause()
                return true
            }
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onDestroy() {
        super.onDestroy()
        streamPlayer.release()
    }
}

@OptIn(UnstableApi::class)
@Composable
fun TvPlayerScreen(streamPlayer: StreamPlayer) {
    val sampleChannels = remember {
        listOf(
            Channel(1, "TRT 1 HD", "Ulusal", "https://example.com/trt1.m3u8"),
            Channel(2, "TRT Spor", "Spor", "https://example.com/trtspor.m3u8"),
            Channel(3, "TRT Belgesel", "Belgesel", "https://example.com/belgesel.m3u8"),
            Channel(4, "TRT Muzik", "Muzik", "https://example.com/muzik.m3u8"),
            Channel(5, "TRT Cocuk", "Cocuk", "https://example.com/cocuk.m3u8")
        )
    }

    var selectedChannel by remember { mutableStateOf(sampleChannels.first()) }

    Box(modifier = Modifier.fillMaxSize()) {
        // Fullscreen ExoPlayer
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    player = streamPlayer.exoPlayer
                    useController = false
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // TV 10-foot Bottom Navigation Bar (D-Pad focused cards)
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Color(0xCC0A0F1D))
                .padding(24.dp)
        ) {
            Text(
                text = "${selectedChannel.name} • ${selectedChannel.groupTitle}",
                style = MaterialTheme.typography.titleLarge,
                color = Color.White,
                modifier = Modifier.padding(bottom = 12.dp)
            )

            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(sampleChannels) { ch ->
                    var isFocused by remember { mutableStateOf(false) }

                    Box(
                        modifier = Modifier
                            .width(160.dp)
                            .height(90.dp)
                            .background(
                                color = if (isFocused) Color(0xFF4338CA) else Color(0xFF1E293B),
                                shape = RoundedCornerShape(12.dp)
                            )
                            .border(
                                width = if (isFocused) 3.dp else 1.dp,
                                color = if (isFocused) Color.White else Color(0xFF334155),
                                shape = RoundedCornerShape(12.dp)
                            )
                            .onFocusChanged { focusState ->
                                isFocused = focusState.isFocused
                                if (focusState.isFocused) {
                                    selectedChannel = ch
                                    streamPlayer.playStream(ch.streamUrl)
                                }
                            }
                            .focusable(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.Tv,
                                contentDescription = null,
                                tint = if (isFocused) Color.White else Color(0xFF818CF8),
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = ch.name,
                                style = MaterialTheme.typography.labelMedium,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}

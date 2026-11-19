package com.streamx.iptv.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.util.UnstableApi
import androidx.media3.ui.PlayerView
import com.streamx.iptv.model.Channel
import com.streamx.iptv.model.PlaybackStatus
import com.streamx.iptv.player.StreamPlayer

class MainActivity : ComponentActivity() {

    private lateinit var streamPlayer: StreamPlayer

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        streamPlayer = StreamPlayer(this)

        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF090D16)
                ) {
                    MobilePlayerScreen(streamPlayer)
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        streamPlayer.release()
    }
}

@OptIn(UnstableApi::class)
@Composable
fun MobilePlayerScreen(streamPlayer: StreamPlayer) {
    val status by streamPlayer.status.collectAsState()
    val errorMessage by streamPlayer.errorMessage.collectAsState()

    var activeChannel by remember {
        mutableStateOf(
            Channel(
                id = 1,
                name = "TRT 1 HD",
                groupTitle = "Ulusal",
                streamUrl = "https://example.com/trt1.m3u8"
            )
        )
    }

    val sampleChannels = remember {
        listOf(
            Channel(1, "TRT 1 HD", "Ulusal", "https://example.com/trt1.m3u8"),
            Channel(2, "TRT Spor", "Spor", "https://example.com/trtspor.m3u8"),
            Channel(3, "TRT Belgesel", "Belgesel", "https://example.com/belgesel.m3u8"),
            Channel(4, "TRT Muzik", "Muzik", "https://example.com/muzik.m3u8")
        )
    }

    Column(modifier = Modifier.fillMaxSize()) {
        // Video Viewport (16:9 on Mobile)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 9f)
                .background(Color.Black),
            contentAlignment = Alignment.Center
        ) {
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        player = streamPlayer.exoPlayer
                        useController = true
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            if (status == PlaybackStatus.BUFFERING) {
                CircularProgressIndicator(color = Color(0xFF6366F1))
            }

            if (errorMessage != null) {
                Text(
                    text = errorMessage ?: "",
                    color = Color.Red,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }

        // Channel Info Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = activeChannel.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = Color.White
                )
                Text(
                    text = activeChannel.groupTitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF818CF8)
                )
            }

            IconButton(onClick = { streamPlayer.togglePlayPause() }) {
                Icon(
                    imageVector = if (status == PlaybackStatus.PLAYING) Icons.Default.Pause else Icons.Default.PlayArrow,
                    contentDescription = "Play/Pause",
                    tint = Color.White
                )
            }
        }

        Divider(color = Color(0xFF1E293B))

        // Channel List
        Text(
            text = "Kanal Listesi",
            style = MaterialTheme.typography.labelLarge,
            color = Color.Gray,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )

        LazyColumn(modifier = Modifier.fillMaxSize()) {
            items(sampleChannels) { ch ->
                val isSelected = ch.id == activeChannel.id
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            activeChannel = ch
                            streamPlayer.playStream(ch.streamUrl)
                        }
                        .background(if (isSelected) Color(0xFF1E1B4B) else Color.Transparent)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Tv,
                        contentDescription = null,
                        tint = if (isSelected) Color(0xFF818CF8) else Color.Gray,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = ch.name,
                            style = MaterialTheme.typography.bodyMedium,
                            color = if (isSelected) Color.White else Color(0xFFCBD5E1)
                        )
                        Text(
                            text = ch.groupTitle,
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF64748B)
                        )
                    }
                }
            }
        }
    }
}

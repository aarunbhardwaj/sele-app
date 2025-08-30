import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, PanGestureHandler, State } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../services/AuthContext';
import { withErrorHandling } from '../../lib/errors';

interface VideoPlayerProps {
  uri: string;
  lessonId?: string;
  courseId?: string;
  onProgressUpdate?: (progress: number) => void;
  onComplete?: () => void;
  autoPlay?: boolean;
  showControls?: boolean;
}

interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  didJustFinish: boolean;
}

export default function VideoPlayer({
  uri,
  lessonId,
  courseId,
  onProgressUpdate,
  onComplete,
  autoPlay = false,
  showControls = true,
}: VideoPlayerProps) {
  const { user } = useAuth();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<PlaybackStatus>({
    isLoaded: false,
    isPlaying: false,
    positionMillis: 0,
    durationMillis: 0,
    didJustFinish: false,
  });
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);

  useEffect(() => {
    let hideControlsTimeout: NodeJS.Timeout;
    
    if (showControlsOverlay && status.isPlaying) {
      hideControlsTimeout = setTimeout(() => {
        setShowControlsOverlay(false);
      }, 3000);
    }

    return () => {
      if (hideControlsTimeout) {
        clearTimeout(hideControlsTimeout);
      }
    };
  }, [showControlsOverlay, status.isPlaying]);

  // Track progress and update learning analytics
  useEffect(() => {
    if (status.isLoaded && status.durationMillis > 0) {
      const progress = (status.positionMillis / status.durationMillis) * 100;
      
      // Update progress every 10% to avoid too many API calls
      if (progress - lastProgressUpdate >= 10) {
        setLastProgressUpdate(progress);
        updateLearningProgress(progress);
        onProgressUpdate?.(progress);
      }

      // Mark as complete when 90% is reached
      if (progress >= 90 && !status.didJustFinish) {
        onComplete?.();
        recordVideoCompletion();
      }
    }
  }, [status.positionMillis, status.durationMillis, lastProgressUpdate]);

  const updateLearningProgress = withErrorHandling(
    async (progress: number) => {
      if (!user || !lessonId) return;

      // This would integrate with your progress tracking service
      console.log('Updating video progress:', {
        userId: user.$id,
        lessonId,
        courseId,
        progress,
        watchTime: status.positionMillis / 1000,
      });
    },
    'VideoPlayer.updateLearningProgress'
  );

  const recordVideoCompletion = withErrorHandling(
    async () => {
      if (!user || !lessonId) return;

      console.log('Recording video completion:', {
        userId: user.$id,
        lessonId,
        courseId,
        totalWatchTime: status.durationMillis / 1000,
      });
    },
    'VideoPlayer.recordVideoCompletion'
  );

  const handlePlaybackStatusUpdate = (newStatus: any) => {
    setStatus(prevStatus => ({
      ...prevStatus,
      isLoaded: newStatus.isLoaded || false,
      isPlaying: newStatus.isPlaying || false,
      positionMillis: newStatus.positionMillis || 0,
      durationMillis: newStatus.durationMillis || 0,
      didJustFinish: newStatus.didJustFinish || false,
    }));

    if (newStatus.didJustFinish) {
      onComplete?.();
      recordVideoCompletion();
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const seekToPosition = async (position: number) => {
    if (!videoRef.current || !status.isLoaded) return;

    try {
      await videoRef.current.setPositionAsync(position * status.durationMillis);
    } catch (error) {
      console.error('Error seeking to position:', error);
    }
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    try {
      if (isFullscreen) {
        await videoRef.current.dismissFullscreenPlayer();
      } else {
        await videoRef.current.presentFullscreenPlayer();
      }
      setIsFullscreen(!isFullscreen);
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const changePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    
    setPlaybackSpeed(newSpeed);
    
    if (videoRef.current) {
      videoRef.current.setRateAsync(newSpeed, true);
    }
  };

  const skip = async (seconds: number) => {
    if (!videoRef.current || !status.isLoaded) return;

    try {
      const newPosition = Math.max(0, Math.min(
        status.positionMillis + (seconds * 1000),
        status.durationMillis
      ));
      await videoRef.current.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error skipping:', error);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoPress = () => {
    if (showControls) {
      setShowControlsOverlay(!showControlsOverlay);
    }
  };

  if (!uri) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="videocam-off" size={48} color="#6c757d" />
        <Text style={styles.errorText}>Video not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleVideoPress}
        style={styles.videoContainer}
      >
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri }}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={autoPlay}
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />

        {showControls && showControlsOverlay && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.controlsOverlay}
          >
            {/* Main controls */}
            <View style={styles.mainControls}>
              <TouchableOpacity
                onPress={() => skip(-10)}
                style={styles.controlButton}
              >
                <Ionicons name="play-back" size={32} color="white" />
                <Text style={styles.skipText}>10</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlayPause}
                style={styles.playButton}
              >
                <Ionicons
                  name={status.isPlaying ? "pause" : "play"}
                  size={48}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => skip(10)}
                style={styles.controlButton}
              >
                <Ionicons name="play-forward" size={32} color="white" />
                <Text style={styles.skipText}>10</Text>
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>
                {formatTime(status.positionMillis)}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${status.durationMillis > 0 
                        ? (status.positionMillis / status.durationMillis) * 100 
                        : 0}%`
                    }
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.progressThumb,
                    {
                      left: `${status.durationMillis > 0 
                        ? (status.positionMillis / status.durationMillis) * 100 
                        : 0}%`
                    }
                  ]}
                  onPress={(event) => {
                    const { locationX } = event.nativeEvent;
                    const trackWidth = 300; // approximate track width
                    const progress = locationX / trackWidth;
                    seekToPosition(progress);
                  }}
                />
              </View>
              <Text style={styles.timeText}>
                {formatTime(status.durationMillis)}
              </Text>
            </View>

            {/* Bottom controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity
                onPress={changePlaybackSpeed}
                style={styles.speedButton}
              >
                <Text style={styles.speedText}>{playbackSpeed}x</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleFullscreen}
                style={styles.controlButton}
              >
                <Ionicons
                  name={isFullscreen ? "contract" : "expand"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

        {!status.isLoaded && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Progress indicator */}
      {status.isLoaded && (
        <View style={styles.progressIndicator}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${status.durationMillis > 0 
                  ? (status.positionMillis / status.durationMillis) * 100 
                  : 0}%`
              }
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 32,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: -2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    top: -6,
    marginLeft: -8,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 45,
    textAlign: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speedButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  speedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressIndicator: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007bff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  errorContainer: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    color: '#6c757d',
    fontSize: 16,
    marginTop: 12,
  },
});
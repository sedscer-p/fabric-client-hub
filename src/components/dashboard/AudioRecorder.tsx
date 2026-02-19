import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, Upload, Loader2 } from 'lucide-react';

interface AudioRecorderProps {
  onTranscriptionComplete: (result: TranscriptionResult) => void;
  onError: (error: string) => void;
}

interface TranscriptionResult {
  transcript: string;
  formatted_transcript: string;
  speakers: SpeakerSegment[];
  duration_seconds: number;
  speaker_count: number;
}

interface SpeakerSegment {
  speaker: number;
  text: string;
  start_time: number;
  end_time: number;
}

export function AudioRecorder({ onTranscriptionComplete, onError }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      onError('Failed to access microphone. Please grant microphone permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Upload and transcribe audio
  const transcribeAudio = async (audioFile: Blob) => {
    setIsTranscribing(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioFile, 'recording.webm');

      // Upload to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/interviews/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Transcription failed');
      }

      const result = await response.json();

      if (result.success && result.data) {
        onTranscriptionComplete(result.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      onError(error.message || 'Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/webm', 'audio/ogg', 'audio/flac'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['mp3', 'm4a', 'wav', 'webm', 'ogg', 'flac'];

    if (!validExtensions.includes(fileExt || '')) {
      onError(`Unsupported file format. Please upload: ${validExtensions.join(', ')}`);
      return;
    }

    // Validate file size (100MB max, but warn about transcription limits)
    const maxSize = 100 * 1024 * 1024;
    const fileSizeMB = file.size / 1024 / 1024;

    if (file.size > maxSize) {
      onError(`File too large (${fileSizeMB.toFixed(2)}MB). Maximum size is 100MB.`);
      return;
    }

    // Warn about large files (Google Speech works best with <10MB / ~1 minute audio)
    if (fileSizeMB > 10) {
      console.warn(`Large file (${fileSizeMB.toFixed(2)}MB). For best results, use audio under 1 minute.`);
    }

    await transcribeAudio(file);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Recording Controls */}
        <div className="flex flex-col items-center space-y-4">
          {!isRecording && !audioBlob && !isTranscribing && (
            <>
              <Button
                size="lg"
                onClick={startRecording}
                className="w-full max-w-xs"
              >
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Button>

              <div className="flex items-center space-x-4">
                <div className="h-px bg-border flex-1" />
                <span className="text-sm text-muted-foreground">or</span>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="w-full max-w-xs">
                <label htmlFor="audio-upload">
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <span>
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Audio File
                    </span>
                  </Button>
                </label>
                <input
                  id="audio-upload"
                  type="file"
                  accept=".mp3,.m4a,.wav,.webm,.ogg,.flac"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Supports: MP3, M4A, WAV, WebM, OGG, FLAC (max 25MB)
                </p>
              </div>
            </>
          )}

          {isRecording && (
            <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-2xl font-mono font-bold">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <Button
                size="lg"
                variant="destructive"
                onClick={stopRecording}
                className="w-full"
              >
                <Square className="mr-2 h-5 w-5" />
                Stop Recording
              </Button>
            </div>
          )}

          {audioBlob && !isTranscribing && (
            <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
              <p className="text-sm text-muted-foreground">
                Recording complete ({formatTime(recordingTime)})
              </p>
              <Button
                size="lg"
                onClick={() => transcribeAudio(audioBlob)}
                className="w-full"
              >
                Transcribe Audio
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAudioBlob(null);
                  setRecordingTime(0);
                }}
              >
                Discard Recording
              </Button>
            </div>
          )}

          {isTranscribing && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Transcribing audio with speaker diarization...
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

"use client";
import { usePathname } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api, sendBeacon, SongType } from "@/lib/utils";

interface AudioContextType {
  // Audio Element / Nodes
  audioRef: React.RefObject<HTMLAudioElement>;
  analyser: AnalyserNode | null;
  gain: GainNode | null;
  source: MediaElementAudioSourceNode | null;
  // Audio State
  playRandom: boolean;
  isPlaying: boolean;
  // Songs
  nextSongs: SongType[];
  currentSong: SongType | undefined;
  songHistory: SongType[];
  // Audio Controls
  togglePlayPause: () => void;
  togglePlayRandom: () => void;
  playNext: () => void;
  playLast: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const stopPlyingOn = [
  "/auth",
  "/auth/login",
  "/auth/sign-up",
  "/auth/verify-email",
  "/link-grabber",
];

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  // Audio Element / Nodes
  const audioRef = useRef<HTMLMediaElement | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [gain, setGain] = useState<GainNode | null>(null);
  const [source, setSource] = useState<MediaElementAudioSourceNode | null>(
    null
  );
  // Audio States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playRandom, setPlayRandom] = useState<boolean>(true);
  // Songs / Session Data
  const [nextSongs, setNextSongs] = useState<SongType[]>([]);
  const [currentSong, setCurrentSong] = useState<SongType>();
  const [songHistory, setSongHistory] = useState<SongType[]>([]);
  const [triedLoadingSessionData, setTriedLoadingSessionData] =
    useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>();

  const audioEnded = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    playNext();
    audio.play();
  }, [playRandom]);

  // Audio
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    audio.crossOrigin = "anonymous";

    // Create audioContext
    const actx = new window.AudioContext();
    // Create source
    const sourceNode = actx.createMediaElementSource(audio);
    // Create gainNode
    const gainNode = actx.createGain();
    // Create analyser
    const analyserNode = new AnalyserNode(actx, { fftSize: 2048 });

    // Connect source -> analyser -> gain -> destination (output)
    sourceNode
      .connect(analyserNode)
      .connect(gainNode)
      .connect(actx.destination);

    setAnalyser(analyserNode);
    setGain(gainNode);
    setSource(sourceNode);

    audio.addEventListener("ended", audioEnded);

    loadSessionData();

    return () => {
      audio.pause();
      audioRef.current = null;
      audio.removeEventListener("ended", audioEnded);
    };
  }, [audioEnded]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (stopPlyingOn.includes(pathname) || !isPlaying) audio.pause();
    else audio.play();
  }, [isPlaying, pathname]);

  // After trying to load session data
  useEffect(() => {
    if (!triedLoadingSessionData) return;
    if (!currentSong || !nextSongs) {
      playNext();
    } else if (audioRef.current && currentTime) {
      audioRef.current.currentTime = currentTime;
    }
  }, [triedLoadingSessionData]);

  // Handle currentSong
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentSong || !audio) return;
    const wasPlaying = !audio.paused;
    audio.pause();
    audio.src = `https://192.168.7.146:8000/api/play?t=${currentSong.track_id}`;
    if (wasPlaying) audio.play();
    api("/set_session_data", "POST", { name: "currentTime", data: 0 });
  }, [currentSong]);

  // API
  const getSongs = async (amount: number) => {
    const data = await api(`/songs?a=${amount}`);
    if (data == false) return [];
    else return data;
  };

  // session data
  useEffect(() => {
    if (!triedLoadingSessionData) return;
    console.log("nextSongs: ", nextSongs);
    console.log("currentSong: ", currentSong);
    console.log("songHistory: ", songHistory);

    updateSessionData();
  }, [songHistory, currentSong, nextSongs]);

  useEffect(() => {
    window.addEventListener("beforeunload", updateCurrentTimeData);

    return () => {
      window.removeEventListener("beforeunload", updateCurrentTimeData);
    };
  }, []);

  const updateCurrentTimeData = () => {
    const audio = audioRef.current;
    if (!audio) return;

    sendBeacon("/set_session_data", {
      name: "currentTime",
      data: audio.currentTime,
    });
  };

  const updateSessionData = async () => {
    await api("/set_session_data", "POST", {
      name: "nextSongs",
      data: nextSongs,
    });
    await api("/set_session_data", "POST", {
      name: "currentSong",
      data: currentSong,
    });
    await api("/set_session_data", "POST", {
      name: "songHistory",
      data: songHistory,
    });
  };

  const loadSessionData = async () => {
    const { currentSong, nextSongs, songHistory, currentTime } = await api(
      "/get_session_data",
      "POST"
    );
    if (nextSongs) setNextSongs(nextSongs);
    if (currentSong) setCurrentSong(currentSong);
    if (songHistory) setSongHistory(songHistory);
    setCurrentTime(Number(currentTime));

    setTriedLoadingSessionData(true);
  };

  // Audio Controls
  const togglePlayRandom = () => setPlayRandom((prev) => !prev);
  const togglePlayPause = () => setIsPlaying((prev) => !prev);

  // Plays the next song from the nextSong list
  const playNext = async () => {
    if ((nextSongs.length == 0 || !currentSong) && !playRandom) return;

    if (currentSong) setSongHistory((prev) => [currentSong, ...prev]);

    const amount = 2 - nextSongs.length;

    if (playRandom && amount > 0) {
      const [next, ...remaining] = [...nextSongs, ...(await getSongs(amount))];
      setCurrentSong(next);
      setNextSongs(remaining);
    } else {
      const [next, ...remaining] = nextSongs;

      setCurrentSong(next);
      setNextSongs(remaining);
    }
  };

  // Plays the last song from the songHistory list
  const playLast = () => {
    if (songHistory.length == 0 || !currentSong) return;
    const [last, ...remaining] = songHistory;

    setNextSongs((prev) => [currentSong, ...prev]);
    setCurrentSong(last);
    setSongHistory(remaining);
  };

  return (
    <AudioContext.Provider
      value={{
        // Audio Element / Nodes
        audioRef,
        analyser,
        gain,
        source,
        // Audio State
        playRandom,
        isPlaying,
        // Songs
        nextSongs,
        currentSong,
        songHistory,
        // Audio Controls
        togglePlayPause,
        togglePlayRandom,
        playNext,
        playLast,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio can only be used within a AudioProvider");
  }
  return context;
};

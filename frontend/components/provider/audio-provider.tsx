/* eslint-disable react-hooks/exhaustive-deps */
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
  currentVolume: number | undefined;
  isPlaying: boolean;
  playInfinity: boolean;
  isShuffled: boolean;
  repeat: boolean;
  currentTime: number;
  songDuration: number;
  // Songs
  nextSongs: SongType[];
  currentSong: SongType | undefined;
  songHistory: SongType[];
  // Audio Statistic
  listenTime: number;
  // Audio Controls
  setCurrentVolume: (volume: number) => void;
  togglePlayInfinity: () => void;
  togglePlayPause: () => void;
  toggleIsShuffled: () => void;
  toggleRepeat: () => void;
  playNext: () => void;
  playLast: () => void;
  playSongInList: (song: SongType) => void;
  addNext: (song: SongType) => void;
  addLast: (song: SongType) => void;
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
  const [currentVolume, setCurrentVolume] = useState<number>();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playInfinity, setPlayInfinity] = useState<boolean>(true);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [songDuration, setSongDuration] = useState<number>(0);
  // Songs
  const [nextSongs, setNextSongs] = useState<SongType[]>([]);
  const [currentSong, setCurrentSong] = useState<SongType>();
  const [songHistory, setSongHistory] = useState<SongType[]>([]);
  // Session Data
  const [triedLoadingSessionData, setTriedLoadingSessionData] =
    useState<boolean>(false);
  const [savedTime, setSavedTime] = useState<number>();
  // Audio Statistic
  const [listenTime, setListenTime] = useState<number>(0);

  // listen time
  const timeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setListenTime(prev => prev + 0.25);
  };

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

    audio.addEventListener("timeupdate", timeUpdate);
    audio.addEventListener("durationchange", () => setSongDuration(audio.duration));

    loadSessionData();

    return () => {
      audio.pause();
      audioRef.current = null;
      audio.removeEventListener("timeupdate", timeUpdate);
      audio.removeEventListener("durationchange", () => setSongDuration(audio.duration));
    };
  }, []);

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
    } else if (audioRef.current && savedTime) {
      audioRef.current.currentTime = savedTime;
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
    api("/set_session_data", "POST", {
      items: [{ name: "currentTime", data: 0 }],
    });
  }, [currentSong]);

  // audio ended Event Listener
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentSong || !audio) return;
    
    audio.addEventListener("ended", audioEnded);

    return () => {
      audio.removeEventListener("ended", audioEnded);
    }
  }, [currentSong, listenTime]);

  const audioEnded = () => playNext(true);

  // API
  const getSongs = async (amount: number) => {
    const data = await api(`/songs?a=${amount}`);
    if (data == false) return [];
    else {
      for (const song of data) {
        const hex = crypto.randomUUID();
        song.uuid = hex;
      }
      return data;
    }
  };

  // session data
  useEffect(() => {
    if (!triedLoadingSessionData) return;

    updateSongData();
  }, [songHistory, currentSong, nextSongs]);

  useEffect(() => {
    if (!triedLoadingSessionData) return;

    updatePlayerSettingsData();
  }, [isShuffled, isPlaying, repeat, playInfinity]);

  useEffect(() => {
    window.addEventListener("beforeunload", updateSomeSessionData);

    return () => {
      window.removeEventListener("beforeunload", updateSomeSessionData);
    };
  }, [listenTime]);

  const updateSomeSessionData = () => {
    const audio = audioRef.current;
    if (!audio) return;

    sendBeacon("/set_session_data", {
      items: [
        {
          name: "currentTime",
          data: audio.currentTime,
        },
        {
          name: "listenTime",
          data: listenTime,
        },
      ],
    });
  };

  const updateSongData = async () => {
    await api("/set_session_data", "POST", {
      items: [
        {
          name: "nextSongs",
          data: nextSongs,
        },
        {
          name: "currentSong",
          data: currentSong,
        },
        {
          name: "songHistory",
          data: songHistory,
        },
      ],
    });
  };

  const updatePlayerSettingsData = async () => {
    await api("/set_session_data", "POST", {
      items: [
        {
          name: "isShuffled",
          data: isShuffled,
        },
        {
          name: "isPlaying",
          data: isPlaying,
        },
        {
          name: "repeat",
          data: repeat,
        },
        {
          name: "playInfinity",
          data: playInfinity,
        },
      ],
    });
  };

  const loadSessionData = async () => {
    const {
      currentSong,
      nextSongs,
      songHistory,
      currentTime,
      isShuffled,
      isPlaying,
      repeat,
      playInfinity,
      currentVolume,
      listenTime,
    } = await api("/get_session_data", "POST");

    if (nextSongs) setNextSongs(nextSongs);
    if (currentSong) setCurrentSong(currentSong);
    if (songHistory) setSongHistory(songHistory);

    if (currentTime) setSavedTime(Number(currentTime));
    if (currentVolume) setCurrentVolume(Number(currentVolume));
    if (listenTime) setListenTime(Number(listenTime));

    if (isShuffled) setIsShuffled(isShuffled);
    if (isPlaying) setIsPlaying(isPlaying);
    if (repeat) setRepeat(repeat);
    if (playInfinity) setPlayInfinity(playInfinity);

    setTriedLoadingSessionData(true);
  };

  // Audio Controls
  const togglePlayPause = () => setIsPlaying((prev) => !prev);
  const togglePlayInfinity = () => handleToggle("playInfinity");
  const toggleIsShuffled = () => handleToggle("isShuffled");
  const toggleRepeat = () => handleToggle("repeat");

  const handleToggle = (set: "repeat" | "isShuffled" | "playInfinity") => {
    if (set == "playInfinity") {
      setPlayInfinity((prev) => !prev);
      setRepeat(false);
    } else if (set == "isShuffled") {
      setIsShuffled((prev) => !prev);
    } else if (set == "repeat") {
      setRepeat((prev) => !prev);
      setPlayInfinity(false);
    }
  };

  // Plays the next song from the nextSong list
  const playNext = useCallback(async (play: boolean = false) => {
    const audio = audioRef.current;
    if ((nextSongs.length == 0 || !currentSong) && !playInfinity && !play || !audio) return;

    await updateListenTime(currentSong);

    if (currentSong) setSongHistory((prev) => [currentSong, ...prev]);

    const amount = 2 - nextSongs.length;

    if (playInfinity && amount > 0) {
      const [next, ...remaining] = [...nextSongs, ...(await getSongs(amount))];
      setCurrentSong(next);
      setNextSongs(remaining);
    } else {
      const [next, ...remaining] = nextSongs;

      setCurrentSong(next);
      setNextSongs(remaining);
    }

    audio.currentTime = 0;
    if (play) audio.play();
  }, [currentSong, listenTime]);

  // Plays the last song from the songHistory list
  const playLast = async () => {
    const audio = audioRef.current;
    if (songHistory.length == 0 || !currentSong || !audio) return;
    if (audio.currentTime > 5) {
      audio.currentTime = 0
      return;
    }
    
    await updateListenTime(currentSong);

    const [last, ...remaining] = songHistory;

    setNextSongs((prev) => [currentSong, ...prev]);
    setCurrentSong(last);
    setSongHistory(remaining);
  };

  // Plays the given song from the nextSongs list
  const playSongInList = (song: SongType) => {
    if (nextSongs.length == 0 || !currentSong) return;
    const index = nextSongs.indexOf(song);
    const [next, ...remaining] = nextSongs.slice(index);

    if (currentSong) setSongHistory(prev => [currentSong, ...prev]);

    setCurrentSong(next);
    setNextSongs(remaining);
  };

  // Appends the song to the start of the nextSongs array
  const addNext = (song: SongType) => {
    const copy = JSON.parse(JSON.stringify(song));
    copy.uuid = crypto.randomUUID();
    setNextSongs((prev) => [copy, ...prev]);
  };

  // Appends the song to the end of the nextSongs array
  const addLast = (song: SongType) => {
    const copy = JSON.parse(JSON.stringify(song));
    copy.uuid = crypto.randomUUID();
    setNextSongs((prev) => [...prev, copy]);
  };

  // volume
  useEffect(() => {
    if (!gain || currentVolume == undefined) return;
    gain.gain.value = parseFloat(String(currentVolume / 100));

    console.log(currentVolume)

    const timeoutId = setTimeout(() => {
      sendBeacon("/set_session_data", {
        items: [
          {
            name: "currentVolume",
            data: currentVolume,
          },
        ],
      });
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    }
  }, [currentVolume, gain]);

  // Listen time
  const updateListenTime = async (song: SongType | undefined) => {
    if (listenTime > 1 && song) {
      await api('/update_listen_time', 'POST', {
        track: song.track_id,
        time: listenTime
      });
      setListenTime(0);
    }
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
        currentVolume,
        isPlaying,
        playInfinity,
        isShuffled,
        repeat,
        currentTime,
        songDuration,
        // Songs
        nextSongs,
        currentSong,
        songHistory,
        // Audio Statistic
        listenTime,
        // Audio Controls
        setCurrentVolume,
        togglePlayInfinity,
        togglePlayPause,
        toggleIsShuffled,
        toggleRepeat,
        playNext,
        playLast,
        playSongInList,
        addNext,
        addLast,
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

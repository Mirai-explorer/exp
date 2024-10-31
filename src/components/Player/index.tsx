"use client"
import React, {useEffect, useRef, useState} from "react";
import {Track, fetchMusicSource, getTime, syncMediaSession, fetchLyric} from "./utils";
import styled from 'styled-components';
import Title from "@/components/Player/Title";
import Cover from "@/components/Player/Cover";
import Lyric from "@/components/Player/Lyric";
import Progress from "@/components/Player/Progress";
import Controller from "@/components/Player/Controller";
import Search from "@/components/Player/Search";
import PlayList from "@/components/Player/PlayList";
import Setting from "@/components/Player/Setting";
import tracks0 from "@/assets/data/tracks";

const Player = () => {
    const MiraiPlayer =
        styled.div.attrs((/* props */) => ({ tabIndex: 0 }))`
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: -apple-system,BlinkMacSystemFont,"SF Pro Text",PingFang SC,Helvetica Neue,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;
      scroll-behavior: smooth;
      /* 非标准属性：提供字体抗锯齿效果 */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      /* 非标准属性：设置点击链接的时候出现的高亮颜色，transparent 为移除 */
      -webkit-tap-highlight-color: transparent;
      /* 非标准属性： */
      -webkit-overflow-scrolling: touch;
      
      *::selection {
        background-color: rgba(218,218,218,.1);
      }
      
      input {
        border-radius: 0;
        font-size: 15px;
        outline: none;
      }
      
      input, button, ul, li {
        -webkit-appearance: none;
      } 
      
      &::after {
          background: linear-gradient( 135deg, #3C8CE7 10%, #00EAFF 100%);
          width: 100%;
          height: 100%;
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: -1;
        }
    `

    const Layout =
        styled.div`
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0 max(32px, 5%);
      color: white;
      -webkit-backdrop-filter: blur(64px) brightness(0.7);
      backdrop-filter: blur(64px) brightness(0.7);
      transition: scale .25s cubic-bezier(.42,.19,.62,1);
      
      &.full {
        scale: 1.0;
      }
      
      &.scale {
        scale: 0.9;
      }
    `

    const Layout1 =
        styled.div`
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      height: 100%;
      padding-top: 2rem;
    `

    const Layout2 =
        styled.div`
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
    `

    const Layout3 =
        styled.div`
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: center;
      align-items: center;
      gap: 2rem;
    `

    const [tracks, setTracks] = useState(tracks0);
    const [trackIndex, setTrackIndex] = useState(0);
    const [trackProgress, setTrackProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [rotate, setRotate] = useState("paused");
    const [size, setSize] = useState("default");
    const [reload, setReload] = useState(false);
    const [updates, setUpdate] = useState(0);
    const [isShowing, setIsShowing] = useState(false);
    const [settingShowing, setSettingShowing] = useState(false);
    const [playListShowing, setPlayListShowing] = useState(false);
    const [loopMode, setLoopMode] = useState(0);
    const [fontSize, setFontSize] = useState(18);
    const [offset, setOffset] = useState(-0.6);
    const [toastMessage, setToastMessage] = useState({
        value: '',
        timestamp: new Date().getTime()
    });
    const [reduce, setReduce] = useState('');
    const [layout, setLayout] = useState(1);
    const [otherLyric, setOtherLyric] = useState([null]);
    const [lyricMode, setLyricMode] = useState(0)

    // Destructure for conciseness
    const {title, subtitle, artist, cover, src, time_length} = tracks[trackIndex];

    // Refs
    const audioRef = useRef<HTMLAudioElement | null>(
        typeof Audio !== "undefined" ? new Audio() : null
    );
    const progress = useRef({
        trackHash: '',
        trackProgress: ''
    })

    const isReady = useRef(false);

    // Destructure for conciseness
    const {duration} = audioRef.current || {duration: 0};

    const currentPercentage = duration
        ? `${(trackProgress / duration) * 100}%`
        : "0%";
    const trackStyling = `
    -webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, wheat), color-stop(${currentPercentage}, rgba(255,255,255,.5)))
  `;

    const onScrub = (value: number) => {
        if (audioRef.current) {
            audioRef.current.ontimeupdate = () => null;
            reduce !== 'reduce' && setReduce('reduce');
            setTrackProgress(value);
        }
    };

    const onScrubEnd = (value: number) => {
        // If not already playing, start
        if (audioRef.current) {
            setReduce('')
            if (value < time_length / 1000) {
                audioRef.current.currentTime = value
            } else {
                setToastMessage({
                    value: '超出试听时长',
                    timestamp: new Date().getTime()
                })
            }
            if (audioRef.current?.paused) {
                toPlay(true);
            }
            audioRef.current.ontimeupdate = () => {
                setTrackProgress(audioRef.current?.currentTime as number);
                progress.current.trackProgress = String(audioRef.current?.currentTime as number | 0);
                if (audioRef.current?.currentTime as number > 0) {
                    localStorage.setItem('trackProgress', String(audioRef.current?.currentTime as number));
                }
            }
        }
    };

    const toPrevTrack = () => {
        let index = trackIndex - 1 < 0 ? tracks.length - 1 : trackIndex - 1;
        setTrackIndex(index);
        setReload(true);
    };

    const toNextTrack = () => {
        let index = trackIndex < tracks.length - 1 ? trackIndex + 1 : 0;
        setTrackIndex(index);
        setReload(true);
    };

    const toRandomTrack = () => {
        let index = Math.round(Math.random() * (tracks.length - 1));
        setTrackIndex(index);
        setReload(true);
    }

    const switchSearch = () => {
        setIsShowing(true);
    }

    const toPlay = (flag: boolean) => {
        if (flag) {
            setIsPlaying(true)
            setIsRotating(true)
            audioRef.current?.play()
                .then()
                .catch(error => {
                    toPlay(false)
                    handlePlayError(error)
                })
        } else {
            setIsPlaying(false)
            setIsRotating(false)
            audioRef.current?.pause()
        }
    }

    const handlePlayError = (e: Error) => {
        let value: string;
        if (e.message.includes('no supported source')) {
            value = '播放源出错';
        } else if (e.message.includes('user didn\'t interact') || e.message.includes('user denied permission')) {
            value = '当前浏览器禁止自动播放，请手动点击播放';
        } else {
            value = '出现不可预知的错误，错误信息：'+e.message;
        }
        setToastMessage({
            value: value,
            timestamp: new Date().getTime()
        });
        /*
        // try to update the track
        let id = tracks[trackIndex].encode_audio_id;
        let name = tracks[trackIndex].title;
        let isExpired = (tracks[trackIndex].timestamp >= new Date().getTime());
        if (isExpired) {
            if (id === '') {
                handleDelete(name+' 为本地导入现已失效，是否从歌单移除？（若为最后一首将初始化数据库）', trackIndex)
                    .then(() => console.log('manually removed.'))
            } else {
                handleUpdate(name+' 源链接已超出有效期，是否要尝试更新？', trackIndex)
                    .then(() => console.log('manually updated.'))
            }
        }
        */
        console.error(e.message)
    }

    const initActionHandler = () => {
        navigator.mediaSession.setActionHandler('play', () => null);
        navigator.mediaSession.setActionHandler('pause', () => null);
        navigator.mediaSession.setActionHandler('previoustrack', () => null);
        navigator.mediaSession.setActionHandler('nexttrack', () => null);
        navigator.mediaSession.setActionHandler('play', () => {
            toPlay(true)
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            toPlay(false);
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            toPrevTrack();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            toNextTrack();
        });
    }

    useEffect(() => {
        if (isRotating) {
            setRotate("running");
        } else {
            setRotate("paused");
        }
    }, [isRotating]);

    useEffect(() => {
        if (audioRef.current && reload) {
            setReload(false);
            toPlay(false);
            audioRef.current.src = src;
            setTrackProgress(0);
            progress.current.trackHash = tracks[trackIndex].code;
            syncMediaSession(tracks[trackIndex]);
            initActionHandler();
            if (isReady.current) {
                toPlay(true);
            } else {
                // Set the isReady ref as true for the next pass
                isReady.current = true;
            }
            localStorage.setItem('trackHash', progress.current.trackHash);
        }
    }, [reload]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.ontimeupdate = () => {
                setTrackProgress(audioRef.current?.currentTime as number);
                progress.current.trackProgress = String(audioRef.current?.currentTime as number);
                if (audioRef.current?.currentTime as number > 0) {
                    localStorage.setItem('trackProgress', String(audioRef.current?.currentTime as number));
                }
            }
        }
    }, [audioRef.current?.readyState]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.loop = loopMode === 1
        }
    }, [loopMode]);

    useEffect(() => {
        if (audioRef.current?.paused && (isPlaying || isRotating)) {
            setIsPlaying(false);
            setIsRotating(false);
        } else if (!audioRef.current?.paused && !(isPlaying || isRotating)) {
            setIsPlaying(true);
            setIsRotating(true);
        }
    }, [audioRef.current?.paused]);

    useEffect(() => {
        if (audioRef.current && audioRef.current.ended) {
            switch (loopMode) {
                case 0:
                    toNextTrack();
                    break;
                case 1:
                    break;
                case 2:
                    toRandomTrack();
                    break;
            }

        }
    }, [audioRef.current?.ended]);

    const past = getTime(trackProgress);
    const _duration = getTime(duration);

    return(
        <MiraiPlayer className={`bg-cover bg-center bg-no-repeat transition-all duration-300 ease-out`} style={{backgroundImage: `url(${tracks[trackIndex].cover})`}}>
            <Layout className={playListShowing ? 'scale' : 'full'}>
                {layout === 1 && (
                    <Layout1>
                        <Cover
                            rotate={rotate}
                            url={cover}
                            data-size={size}
                            desc={title}
                            onDoubleClick={switchSearch}
                        />
                        <Lyric
                            tracks={tracks}
                            trackIndex={trackIndex}
                            trackProgress={trackProgress}
                            reduce={reduce}
                            fontSize={fontSize}
                            offset={offset}
                            layout={layout}
                            otherLyric={otherLyric}
                            lyricMode={lyricMode}
                        />
                        <Title
                            title={title || "音乐感动生活"}
                            subtitle={subtitle || "Mirai 云端播放器"}
                            singer={artist || "未知歌手"}
                            trackIndex={trackIndex}
                        />
                    </Layout1>
                )}
                {layout === 2 && (
                    <Layout1>
                        <Layout2>
                            <Cover
                                rotate={rotate}
                                url={cover}
                                data-size={size}
                                desc={title}
                                onDoubleClick={switchSearch}
                                className={`thick`}
                            />
                            <Title
                                title={title || "音乐感动生活"}
                                subtitle={subtitle || "Mirai 云端播放器"}
                                singer={artist || "未知歌手"}
                                trackIndex={trackIndex}
                                className={`thick`}
                            />
                        </Layout2>
                        <Lyric
                            tracks={tracks}
                            trackIndex={trackIndex}
                            trackProgress={trackProgress}
                            reduce={reduce}
                            fontSize={fontSize}
                            offset={offset}
                            layout={layout}
                            otherLyric={otherLyric}
                            lyricMode={lyricMode}
                        />
                    </Layout1>
                )}
                {layout === 3 && (
                    <Layout3>
                        <Cover
                            rotate={rotate}
                            url={cover}
                            data-size={size}
                            desc={title}
                            onDoubleClick={switchSearch}
                            className={`thin`}
                        />
                        <Title
                            title={title || "音乐感动生活"}
                            subtitle={subtitle || "Mirai 云端播放器"}
                            singer={artist || "未知歌手"}
                            trackIndex={trackIndex}
                            className={`thin`}
                        />
                    </Layout3>
                )}
                <Progress
                    past={past}
                    _duration={_duration}
                    trackProgress={trackProgress}
                    duration={duration}
                    onScrub={onScrub}
                    onScrubEnd={onScrubEnd}
                    trackStyling={trackStyling}
                />
                <Controller
                    isPlaying={isPlaying}
                    onPrevClick={toPrevTrack}
                    onNextClick={toNextTrack}
                    onPlayPauseClick={toPlay}
                    onPlayListClick={setPlayListShowing}
                    setSettingShowing={setSettingShowing}
                    loopMode={loopMode}
                    setLoopMode={setLoopMode}
                />
                <Search
                    isShowing={isShowing}
                    setIsShowing={setIsShowing}
                    tracks={tracks}
                    setTracks={setTracks}
                    updates={updates}
                    setUpdate={setUpdate}
                    setToastMessage={setToastMessage}
                />
                <Setting
                    isShowing={settingShowing}
                    setIsShowing={setSettingShowing}
                    tracks={tracks}
                    setTracks={setTracks}
                    trackIndex={trackIndex}
                    setTrackIndex={setTrackIndex}
                    setToastMessage={setToastMessage}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    offset={offset}
                    setOffset={setOffset}
                    size={size}
                    setSize={setSize}
                    layout={layout}
                    setLayout={setLayout}
                    otherLyric={otherLyric}
                    lyricMode={lyricMode}
                    setLyricMode={setLyricMode}
                    updates={updates}
                    setUpdate={setUpdate}
                />
            </Layout>
            <PlayList
                tracks={tracks}
                setTracks={setTracks}
                trackIndex={trackIndex}
                setTrackIndex={setTrackIndex}
                isShowing={playListShowing}
                setIsShowing={setPlayListShowing}
                updates={updates}
                setUpdate={setUpdate}
                setReload={setReload}
                toPlay={toPlay}
                playState={isPlaying}
                otherLyric={otherLyric}
            />
        </MiraiPlayer>
    )
}

export default Player;
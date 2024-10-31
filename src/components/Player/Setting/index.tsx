import {styled} from "styled-components";
import React, {SetStateAction, useRef, useState} from "react";
import {
    fetchMusicSource,
    syncMediaSession,
    Track,
    itemType,
    fetchLyric,
    fetchKugouLyric
} from "@/components/Player/utils";
import Icon from "@/components/Icons/player_icon";

const SettingWrap =
    styled.div`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      -webkit-backdrop-filter: blur(8px) contrast(0.5);
      backdrop-filter: blur(8px) contrast(0.5);
      background: rgba(255,255,255,.3);
      z-index: 999;
      content-visibility: auto;

      &.show {
        display: block;
      }
    `

const SettingStack =
    styled.div`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    `

const SettingCard =
    styled.div`
      width: 90vw;
      background: #ffffff;
      height: 90vh;
      border-radius: 0.5rem;
      box-shadow: 1px 2px 4px rgba(0,0,0,.1);
      color: black;
      display: flex;
      flex-direction: column;
      padding: 24px;
      font-size: 16px;
      gap: 16px;
    `

const SettingCardTitle =
    styled.div`
      display: flex;
      align-items: center;
      width: 100%;
      height: 40px;
      gap: 16px;
    `

const SettingCardContent =
    styled.div`
      display: flex;
      flex-direction: column;
      gap: 2rem;
      overflow: auto;
      flex: 1;
      
      :checked + label {
        color: #00b0ff;
      }
    `
const Setting = ({isShowing, setIsShowing, tracks, setTracks, trackIndex, setTrackIndex, setToastMessage, offset, setOffset, fontSize, setFontSize, size, setSize, layout, setLayout, otherLyric, lyricMode, setLyricMode, updates, setUpdate} : {
    isShowing: boolean,
    setIsShowing: React.Dispatch<SetStateAction<boolean>>,
    tracks: Track[],
    setTracks: React.Dispatch<SetStateAction<Track[]>>,
    trackIndex: number,
    setTrackIndex: React.Dispatch<SetStateAction<number>>,
    setToastMessage: React.Dispatch<SetStateAction<{
        value: string,
        timestamp: number
    }>>,
    offset: number,
    setOffset: React.Dispatch<SetStateAction<number>>,
    fontSize: number,
    setFontSize: React.Dispatch<SetStateAction<number>>,
    size: string,
    setSize: React.Dispatch<SetStateAction<string>>,
    layout: number,
    setLayout: React.Dispatch<SetStateAction<number>>,
    otherLyric: ({
        translation: string[],
        romaji: string[]
    } | null)[],
    lyricMode: number,
    setLyricMode: React.Dispatch<SetStateAction<number>>,
    updates: number,
    setUpdate: React.Dispatch<SetStateAction<number>>
}) => {
    const [text, setText] = useState('')
    const textRef = useRef<HTMLInputElement>(null)
    const [disable, setDisable] = useState(false)
    const [info, setInfo] = useState('')
    const [info2, setInfo2] = useState('')
    const [string, setString] = useState('')
    const [inputs, setInputs] = useState('0')
    const [inputs2, setInputs2] = useState('1')
    const [inputs3, setInputs3] = useState('18')
    const inputRef = useRef<HTMLInputElement>(null)
    const audioReader = (ref: React.ChangeEvent<HTMLInputElement>) => {
        /*
        const fs = new FileReader()
        ref.target.files && fs.readAsArrayBuffer(ref.target.files[0])
        fs.onload = () => {
            const arrBuffer = fs.result
            const audioCtx = new AudioContext()
            audioCtx.decodeAudioData(arrBuffer as ArrayBuffer, (audioBuffer) => {
                const source = audioCtx.createBufferSource()
                source.buffer = audioBuffer
                source.connect(audioCtx.destination)
                source.start()
            })
        }
        */
        if (ref.target.files) {
            const src = URL.createObjectURL(ref.target.files[0])
            let duration = 0
            let media: HTMLAudioElement | null = new Audio(src)
            media.onloadedmetadata = () => {
                if (media && media.duration !== Infinity) {
                    duration = media.duration * 1000
                    media = null
                    tracks[tracks.length] = {
                        title: ref.target.files![0].name,
                        subtitle: '未知专辑',
                        artist: '未知歌手',
                        src: src,
                        cover: 'https://imge.kugou.com/commendpic/20160923/20160923162707215688.png',
                        lyric: '',
                        album_id: '',
                        encode_audio_id: '',
                        code: '',
                        timestamp: new Date().getTime() + 3600000,
                        unique_index: -1,
                        time_length: duration
                    }
                    setIsShowing(false)
                    setToastMessage({
                        value: `${ref.target.files![0].name} 已临时添加至歌单，当前页面重载前有效`,
                        timestamp: new Date().getTime()
                    })
                }
            }
        }
    }

    const inputOnChange = (value: string) => {
        setText(value)
        info && setInfo('')
    }

    const readClipboard = () => {
        if (!('clipboard' in navigator)) {
            setToastMessage({
                value: `粘贴失败\n[info]您当前的访问环境不支持自动粘贴，请手动将 ID 粘贴到文本框内`,
                timestamp: new Date().getTime()
            })
            return 0
        }
        navigator.clipboard
            .readText()
            .then(text => {
                textRef.current!.value = text
                setText(text)
            })
            .catch((error) => {
                setToastMessage({
                    value: `粘贴失败\n[info]请手动将 ID 粘贴到文本框内\n[error]${error}`,
                    timestamp: new Date().getTime()
                })
            });
    }

    const syncInfo = () => {
        setDisable(true)
        let track = {
            code: '',
            album_id: '',
            encode_audio_id: text
        }
        fetchMusicSource(0, track).then(res => {
            // a jsonp mode
            console.log(res)
            setDisable(false)
            if (res.err_code === 0) {
                let item = res.data;
                let track_new: Track = {
                    title: item.song_name,
                    subtitle: item.album_name,
                    artist: item.author_name,
                    src: item.play_url,
                    cover: item.img,
                    lyric: item.lyrics,
                    album_id: item.album_id,
                    encode_audio_id: item.encode_album_audio_id,
                    code: item.hash,
                    timestamp: new Date().getTime() + 86400000,
                    unique_index: tracks.length + 1,
                    time_length: !item.is_free_part ? item.timelength : item.trans_param.hash_offset.end_ms
                };
                tracks[trackIndex] = {
                    title: track_new.title,
                    subtitle: track_new.subtitle,
                    artist: track_new.artist,
                    src: tracks[trackIndex].src,
                    cover: track_new.cover,
                    lyric: track_new.lyric,
                    album_id: track_new.album_id,
                    encode_audio_id: track_new.encode_audio_id,
                    code: '',
                    timestamp: tracks[trackIndex].timestamp,
                    unique_index: tracks[trackIndex].unique_index,
                    time_length: tracks[trackIndex].time_length
                };
                syncMediaSession(tracks[trackIndex])
                setInfo(item.song_name+' 更新成功')
            } else if (res.err_code === 20010) {
                setInfo('更新失败，请检查输入 code 是否正确')
                throw new Error(`empty data returned, perhaps due to empty or incorrect code being inputted.`)
            } else {
                setInfo('更新失败，出现未知异常')
                throw new Error(`an unknown [error:${res.err_code}] occurred.`)
            }
            /*
            // a proxy mode
            console.log(res)
            if (!res.data.err_code) {
                let item = res.data.data;
                let track_new: Track = {
                    title: item.song_name,
                    subtitle: item.album_name,
                    artist: item.author_name,
                    src: item.play_url,
                    cover: item.img,
                    lyric: item.lyrics,
                    album_id: item.album_id,
                    encode_audio_id: item.encode_album_audio_id,
                    code: item.hash,
                    timestamp: new Date().getTime() + 86400000,
                    unique_index: tracks.length + 1,
                    time_length: !item.is_free_part ? item.timelength : item.trans_param.hash_offset.end_ms
                };
                console.log([...tracks, track_new])
                setIsShowing(false)
                setTracks([...tracks, track_new])
                setUpdate(updates > 0 ? ++updates : 1)
                setToastMessage({
                    value: item.song_name+' 已加入歌单，可在歌单选取播放',
                    timestamp: new Date().getTime()
                })
            } else {
                // Exception Handles
            }
            */
        }).catch(error => {
            setToastMessage({
                value: `服务请求异常，若多次出现请提 issue`,
                timestamp: new Date().getTime()
            })
            console.error(`Service Request Exception\n${error}`)
        })
    }

    const watchInput = (value: string) => {
        setInputs(value)
    }

    const watchInput2 = (value: string) => {
        setInputs2(value)
    }

    const watchInput3 = (value: string) => {
        setInputs3(value)
    }

    const changeTrack = async () => {
        let target = tracks[Number(inputs2) - 1]

    }

    const handleInput = (value: string) => {
        const pattern = /^-?[0-4](\.+\d)?/;
        let matches = pattern.exec(value) && Number(pattern.exec(value)![0])
        if (matches === null || matches === 0) {
            if (Number(value) < -5) {
                matches = -5
            } else if (Number(value) > 5) {
                matches = 5
            } else {
                matches = Number(value)
            }
        }
        setInputs(String(matches))
        setOffset((-matches * 10 - 6) / 10)
    }

    const handleFontSize = (value: string) => {
        const pattern = /1 [6-9] | 2 [0-9] | 30/;;
        let matches = pattern.exec(value) && Number(pattern.exec(value)![0])
        if (matches === null || matches === 0) {
            if (Number(value) < 16) {
                matches = 16
            } else if (Number(value) > 30) {
                matches = 30
            } else {
                matches = Number(value)
            }
        }
        setInputs3(String(matches))
        setFontSize(matches)
    }

    const getFullLyric = (() => {
        function fetch() {
            setInfo2('正在获取...')
            if (isNaN(Number(tracks[trackIndex].encode_audio_id))) {
                fetchKugouLyric(tracks[trackIndex]).then(data => {
                    setInfo2('歌词获取成功')
                    tracks[trackIndex].lyric = data.lrc
                    otherLyric[trackIndex] = {
                        translation: data.landata.length > 1 ? data.landata[1].content.replaceAll('[','').replaceAll(' ]]','').split(' ],') : data.landata[0].content.replaceAll('[','').replaceAll(' ]]','').split(' ],'),
                        romaji: data.landata.length > 1 ? data.landata[0].content.replace(/\s+/g, " ").replaceAll('[','').replaceAll(' ]]','').split(' ],') : ['']
                    }
                }).catch(err => {
                    setInfo2('歌词获取失败')
                    console.error(err.message)
                })
            } else {
                setInfo2('即将支持网易云音乐...')
                /*
                fetchLyric(Number(tracks[trackIndex].encode_audio_id)).then(data => {
                    setInfo2('歌词获取成功')
                    setLyric({
                        translation: data.tlyric.lyric,
                        romaji: ['']
                    })
                }).catch(err => {
                    setInfo2('歌词获取失败')
                    console.error(err.message)
                })
                */
            }
        }
        function close() {
            setLyricMode(0)
            setInfo2('多语言歌词已关闭')
        }
        function useTranslation() {
            setLyricMode(1)
            setInfo2('显示翻译/粤拼')
        }
        function useRomaji() {
            setLyricMode(2)
            setInfo2('显示罗马音')
        }
        return {
            fetch, close, useTranslation, useRomaji
        }
    })()

    const pip = (() => {
        const target = `<div>1</div>`
        function enable() {

        }
        function disable() {

        }
        return {
            enable, disable
        }
    })()

    const manualUpdate = (item: any) => {
        let track_new: Track = {
            title: item.song_name,
            subtitle: item.album_name,
            artist: item.author_name,
            src: item.play_url,
            cover: item.img.replaceAll('http:','https:'),
            lyric: item.lyrics,
            album_id: item.album_id,
            encode_audio_id: item.encode_album_audio_id,
            code: item.hash,
            timestamp: new Date().getTime() + 86400000,
            unique_index: tracks.filter((item) => item.unique_index > 0).length + 1,
            time_length: !item.is_free_part ? item.timelength : item.trans_param.hash_offset.end_ms
        };
        console.log([...tracks, track_new])
        setTracks([...tracks, track_new])
        setUpdate(updates > 0 ? ++updates : 1)
        setToastMessage({
            value: item.song_name+' 已加入歌单，可在歌单选取播放',
            timestamp: new Date().getTime()
        })
    }

    return(
        <SettingWrap className={`${isShowing?'show':'hidden'}`}>
            <SettingStack>
                <SettingCard>
                    <SettingCardTitle>
                        <button onClick={() => {setIsShowing(false)}}>
                            <Icon className={`icon-back`} name="Back" width={16} height={16} fill="#000000" />
                        </button>
                        <div>实验性选项</div>
                    </SettingCardTitle>
                    <SettingCardContent>
                        <div className="flex flex-col gap-4">
                            <label htmlFor="file" className="text-sky-400">添加本地音频文件</label>
                            <input type="file" name="file" id="file" accept="audio/*"
                                   onChange={ref => audioReader(ref)}/>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label htmlFor="text" className="text-sky-400">同步信息</label>
                            <div className="flex gap-4">
                                <input type="text" name="audio" className="text-[14px] placeholder:text-[14px]"
                                       minLength={6} maxLength={10} placeholder="请输入audio_id"
                                       onChange={e => inputOnChange(e.target.value)} ref={textRef}/>
                                <button title="paste" onClick={() => readClipboard()}>粘贴</button>
                                <button title="sync" onClick={() => syncInfo()} disabled={disable}>同步</button>
                            </div>
                            <div>{info}</div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label htmlFor="text" className="text-sky-400">歌词同步</label>
                            <div className="flex gap-2">
                                <button title="decrease"
                                        onClick={() => handleInput(String((Number(inputs) * 10 - 1) / 10))}>-
                                </button>
                                <span>
                                    <input type="number" className="w-12 text-center" step={0.1} min={-5} max={5}
                                           value={inputs} onChange={e => watchInput(e.target.value)}
                                           onBlur={e => handleInput(e.target.value)} ref={inputRef}/>
                                    s
                                </span>
                                <button title="increase"
                                        onClick={() => handleInput(String((Number(inputs) * 10 + 1) / 10))}>+
                                </button>
                                <button title="reset" onClick={() => {
                                    setOffset(-0.6);
                                    setInputs("0")
                                }}>复原
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label htmlFor="text" className="text-sky-400">歌词字号</label>
                            <div className="flex gap-2">
                                <button title="decrease"
                                        onClick={() => handleFontSize(String((Number(inputs3) * 10 - 10) / 10))}>-
                                </button>
                                <span>
                                    <input type="number" className="w-12 text-center" step={1} min={16} max={30}
                                           value={inputs3} onChange={e => watchInput3(e.target.value)}
                                           onBlur={e => handleFontSize(e.target.value)} ref={inputRef}/>
                                    pt
                                </span>
                                <button title="increase"
                                        onClick={() => handleFontSize(String((Number(inputs3) * 10 + 10) / 10))}>+
                                </button>
                                <button title="reset" onClick={() => {
                                    setFontSize(18);
                                    setInputs3("18")
                                }}>复原
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label htmlFor="text" className="text-sky-400">强制更新</label>
                            <div className="flex gap-2">
                                <span>
                                    <input type="number" className="w-12 text-center" step={1} min={1} value={inputs2}
                                           onChange={e => watchInput2(e.target.value)}/>
                                </span>
                                <button title="chenge_track" onClick={() => changeTrack()}>更改</button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label htmlFor="text" className="text-sky-400">布局切换</label>
                            <div className="flex gap-2">
                                <input
                                    type="radio"
                                    id="layoutChoice1"
                                    name="layout"
                                    value="1"
                                    onChange={() => {
                                        setSize('default')
                                        setLayout(1)
                                    }}
                                    defaultChecked={layout === 1 && true}/>
                                <label htmlFor="layoutChoice1">样式1</label>
                                <input
                                    type="radio"
                                    id="layoutChoice2"
                                    name="layout"
                                    value="2"
                                    onChange={() => {
                                        setSize('mini')
                                        setLayout(2)
                                    }}
                                    defaultChecked={layout === 2 && true}
                                />
                                <label htmlFor="layoutChoice2">样式2</label>
                                <input type="radio" id="layoutChoice3" name="layout" value="3"
                                       onChange={() => {
                                           setSize('large')
                                           setLayout(3)
                                       }}
                                       defaultChecked={layout === 3 && true}/>
                                <label htmlFor="layoutChoice3">样式3</label>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label htmlFor="text" className="text-sky-400">多语言歌词（目前酷狗限定）</label>
                            <div className="flex gap-2">
                                <button title="reset" onClick={() => getFullLyric.fetch()}>获取</button>
                                <input
                                    type="radio"
                                    id="lyricChoice1"
                                    name="lyric"
                                    value="0"
                                    onChange={() => getFullLyric.close()}
                                    defaultChecked={lyricMode === 0 && true}/>
                                <label htmlFor="lyricChoice1">关闭</label>
                                <input
                                    type="radio"
                                    id="lyricChoice2"
                                    name="lyric"
                                    value="1"
                                    onChange={() => getFullLyric.useTranslation()}
                                    defaultChecked={lyricMode === 1 && true}
                                />
                                <label htmlFor="lyricChoice2">翻译/粤拼</label>
                                <input
                                    type="radio"
                                    id="lyricChoice3"
                                    name="lyric"
                                    value="2"
                                    onChange={() => getFullLyric.useRomaji()}
                                    defaultChecked={lyricMode === 2 && true}
                                />
                                <label htmlFor="lyricChoice3">罗马字（韩日）</label>
                            </div>
                            <div>{info2}</div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label htmlFor="text" className="text-sky-400">画中画模式</label>
                            <div className="flex gap-2">
                                <button title="reset" onClick={() => pip.enable()}>进入</button>
                                <button title="reset" onClick={() => pip.disable()}>退出</button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label htmlFor="text" className="text-sky-400">手动维护</label>
                            <textarea placeholder="请输入标准JSON字符串" onBlur={(e) => setString(e.target.value)}></textarea>
                            <div className="flex gap-2">
                                <button title="submit" onClick={() => manualUpdate(JSON.parse(string)?.data)}>提交</button>
                            </div>
                        </div>
                    </SettingCardContent>
                </SettingCard>
            </SettingStack>
        </SettingWrap>
    )
}

export default Setting;
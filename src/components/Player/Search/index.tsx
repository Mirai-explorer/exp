import { styled } from "styled-components";
import React, {SetStateAction, useRef} from "react";
import {Track, fetchMusicSource, sign, fetchLyric} from "@/components/Player/utils"
import Icon from "../../Icons/player_icon";
import JSONP from "fetch-jsonp";
import axios from "axios";
import crypto from "crypto-es";

type resultType = {
    FileName: string,
    FileHash: string,
    AlbumID: string,
    AlbumName: string,
    EMixSongID: string,
    Duration: number
    OriSongName: string,
    Auxiliary: string,
    Image: string,
    SingerName: string
}

type resultType2 = {
    al: {
        id: number,
        name: string,
        picUrl: string
    },
    alia: string[],
    ar: {
        id: number,
        name: string
    }[],
    dt: number,
    name: string,
    privilege: {
        id: number
    }
}

const SearchWrap =
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

const SearchStack =
    styled.div`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    `

const SearchCard =
    styled.div`
      width: 90vw;
      background: #ffffff;
      height: 90vh;
      border-radius: 0.5rem;
      box-shadow: 1px 2px 4px rgba(0,0,0,.1);
      color: black;
      display: flex;
      flex-direction: column;
      padding: 2rem 1rem;
      font-size: 16px;
      gap: 16px;
    `

const SearchCardTitle =
    styled.div`
      display: flex;
      align-items: center;
      width: 100%;
      height: 40px;
      gap: 16px;
    `

const SearchGroup =
    styled.div`
      display: flex;
      width: 100%;
      position: relative;
    `

const SearchCardSwitch =
    styled.div`
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 40px;
      border-radius: 24px 0 0 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    `

const SearchCardInput =
    styled.input`
      border-radius: 999px !important;
      font-size: 16px !important;
      padding: 4px 32px 4px 40px;
      width: 100%;
      transition: all .1s ease-in;
      background: rgba(196, 196, 196, 0.15);
    `

const SearchCardButton =
    styled.button`
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 32px;
    `

const SearchCardContent =
    styled.div`
      display: block;
      overflow: auto;
      flex: 1;

      &::-webkit-scrollbar {
        display: none;
      }
    `

const SearchItem =
    styled.div`
      display: inline-flex;
      align-items: center;
      width: 100%;
      min-height: 48px;
      padding: 12px 0;
    `

const SearchItemLabel =
    styled.label`
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      line-height: 24px;
      gap: 8px;
      transition: background-color .3s ease-out;
      
      &:active {
        background-color: #f0f0f0;
      }
    `

const Search = ({isShowing, setIsShowing, setTracks, tracks, updates, setUpdate, setToastMessage} : {
    isShowing: boolean,
    setIsShowing: React.Dispatch<SetStateAction<boolean>>,
    setTracks: React.Dispatch<SetStateAction<Track[]>>,
    tracks: Track[],
    updates: number,
    setUpdate: React.Dispatch<SetStateAction<number>>,
    setToastMessage: React.Dispatch<SetStateAction<{
        value: string,
        timestamp: number
    }>>
}) => {
    const [value, setValue] = React.useState('')
    const [result, setResult] = React.useState([{
        FileName: 'null',
        FileHash: 'null',
        AlbumID: 'null',
        AlbumName: 'null',
        EMixSongID: 'null',
        Duration: 0,
        OriSongName: 'null',
        Auxiliary: 'null',
        Image: 'null',
        SingerName: 'null'
    }])
    const [sourceType, setSourceType] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const dropMenu = () => {
        setSourceType(sourceType + 1 > 1 ? 0 : sourceType + 1)
        setResult([{
            FileName: 'null',
            FileHash: 'null',
            AlbumID: 'null',
            AlbumName: 'null',
            EMixSongID: 'null',
            Duration: 0,
            OriSongName: 'null',
            Auxiliary: 'null',
            Image: 'null',
            SingerName: 'null'
        }])
    }

    const watchInputValue = (value:string) => {
        setValue(value)
    }

    const doSearch = (type: number, keyword: string) => {
        setLoading(true);
        switch (type) {
            case 0:
                const params = {
                    appid: 1014,
                    bitrate: 0,
                    callback: 'callback123',
                    clienttime: new Date().getTime(),
                    clientver: 1000,
                    dfid: '4FHbnb44LtSM2JrXpX3riltQ',
                    filter: 10,
                    inputtype: 0,
                    iscorrection: 1,
                    isfuzzy: 0,
                    keyword: keyword,
                    mid: '50e0be703d34ee6401eedf772101571b',
                    page: 1,
                    pagesize: 30,
                    platform: 'WebFilter',
                    privilege_filter: 0,
                    srcappid: 2919,
                    token: '',
                    userid: 0,
                    uuid: '50e0be703d34ee6401eedf772101571b'
                }
                // a jsonp mode
                JSONP(`https://complexsearch.kugou.com/v2/search/song?appid=1014&bitrate=0&clienttime=${params.clienttime}&clientver=1000&dfid=${'4FHbnb44LtSM2JrXpX3riltQ'}&filter=10&inputtype=0&iscorrection=1&isfuzzy=0&keyword=${keyword}&mid=${'50e0be703d34ee6401eedf772101571b'}&page=1&pagesize=30&platform=WebFilter&privilege_filter=0&srcappid=2919&token=&userid=0&uuid=${'50e0be703d34ee6401eedf772101571b'}&signature=${sign(Object.entries(params))}`, {jsonpCallbackFunction: 'callback123'})
                    .then(res => res.json())
                    .then(data => {
                        setLoading(false)
                        if (data.error_code === 0) {
                            let list: resultType[] = [];
                            data.data.lists.length > 0 && data.data.lists.map((item: resultType)=>{
                                list.push({
                                    FileName: item.FileName,
                                    FileHash: item.FileHash,
                                    AlbumID: item.AlbumID,
                                    AlbumName: item.AlbumName,
                                    EMixSongID: item.EMixSongID,
                                    Duration: item.Duration,
                                    OriSongName: item.OriSongName,
                                    Auxiliary: item.Auxiliary,
                                    Image: item.Image.replaceAll('http:','https:'),
                                    SingerName: item.SingerName
                                })
                            })
                            list.length !== 0 ? setResult(list) : setResult([])
                        } else {
                            throw new Error('an unexpected behavior occurred.')
                        }
                    })
                    .catch(err => {
                        setLoading(false)
                        setToastMessage({
                            value: '发生不可预知的行为，错误信息：'+err.message,
                            timestamp: new Date().getTime()
                        })
                        console.error('Please try again later:',err.message)
                    })
                break;
            case 1:
                // a jsonp mode
                let data = [
                    `{"s":"${value}","limit":30,"offset":0,"type":1,"strategy":5,"queryCorrect":true}`,
                    ''
                ]
                const key = [crypto.enc.Utf8.parse('0CoJUm6Qyw8W8jud'), crypto.enc.Utf8.parse('m2d5ZcyUhxNUWqu4')]
                const iv = crypto.enc.Utf8.parse('0102030405060708')
                const encrypted = crypto.AES.encrypt(data[0], key[0], { iv: iv, mode: crypto.mode.CBC })
                data[1] = encrypted.toString()
                const encrypted2 = crypto.AES.encrypt(data[1], key[1], { iv: iv, mode: crypto.mode.CBC })
                const encSecKey = "57177e98cbfae5064f3d1df01ba0c8d2c557608cb89d12a3b7cbfe04b9f784cbc0135a2b30e729b068905f3d8bcae62c7cac2836b19686d7ecfd1b58be569ceb286c9b60550df48c55df0d720b6d57edafec1bf9a07be8967d09a9273d4604da2f3ab15f0eec67de27c06513f74028796fb077676219030feb9d9f0b741765fe"
                axios.post(`https://corsproxy.io/?${encodeURIComponent(`https://interface.music.163.com/weapi/search/get`)}`, {
                    params: encrypted2,
                    encSecKey: encSecKey
                }, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).then(res => {
                    setLoading(false)
                    if (res.data.code === 200) {
                        let list: resultType[] = [];
                        let tempar: string[] = [];
                        res.data.result.songs.length > 0 && res.data.result.songs.map((item: resultType2)=>{
                            item.ar.map(item => tempar.push(item.name))
                            list.push({
                                FileName: item.name,
                                FileHash: String(item.privilege.id),
                                AlbumID: String(item.al.id),
                                AlbumName: item.al.name,
                                EMixSongID: String(item.privilege.id),
                                Duration: item.dt,
                                OriSongName: item.name,
                                Auxiliary: item.alia[0] || '',
                                Image: item.al.picUrl.replaceAll('http:','https:'),
                                SingerName: tempar.join('、')
                            })
                            tempar = []
                        })
                        list.length !== 0 ? setResult(list) : setResult([])
                    } else {
                        throw new Error('an unexpected behavior occurred.')
                    }
                }).catch(err => {
                    setLoading(false)
                    setToastMessage({
                        value: '发生不可预知的行为，错误信息：'+err.message,
                        timestamp: new Date().getTime()
                    })
                    console.error('Please try again later:',err.message)
                })
                break;
        }
        /*
        // a proxy mode
        axios.get('/query',{
            params: {
                ...params,
                signature: sign(Object.entries(params))
            }})
            .then(res => {
                setLoading(false)
                if (!res.data.err_code) {
                    let list: kugouResultType[] = [];
                    res.data.data.lists.length > 0 && res.data.data.lists.map((item: kugouResultType)=>{
                        list.push({
                            FileName: item.FileName,
                            FileHash: item.FileHash,
                            AlbumID: item.AlbumID,
                            AlbumName: item.AlbumName,
                            EMixSongID: item.EMixSongID,
                            Duration: item.Duration,
                            OriSongName: item.OriSongName,
                            Auxiliary: item.Auxiliary,
                            Image: item.Image,
                            SingerName: item.SingerName
                        })
                    })
                    list.length !== 0 ? setResult(list) : setResult([])
                } else {
                    throw new Error('an unexpected behavior occurred.')
                }
            })
            .catch(err => {
                setLoading(false)
                setToastMessage({
                    value: '发生不可预知的行为，错误信息：'+err.message,
                    timestamp: new Date().getTime()
                })
                console.error('Please try again later:',err.message)
            })
            */
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            searchInputRef.current?.blur()
            doSearch(sourceType, value)
        }
    }

    const addToTracks = (dataset: DOMStringMap) => {
        let track = {
            code: dataset.hash,
            album_id: dataset.album_id,
            encode_audio_id: dataset.audio_id
        }
        let flag = false
        tracks.map(item => {
            if (track.code === item.code || track.code === item.encode_audio_id) {
                flag = true
                setToastMessage({
                    value: '不可重复添加',
                    timestamp: new Date().getTime()
                })
            }
        })
        if (isNaN(Number(track.encode_audio_id))) {
            !flag && fetchMusicSource(0, track).then(data => {
                // a jsonp mode
                console.log(data)
                if (!data.err_code) {
                    let item = data.data;
                    let regex = /^(http|https):\/\/[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\/\S*)?$/;
                    if (typeof item.play_url === 'string' && regex.test(item.play_url)) {
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
                        setIsShowing(false)
                        setTracks([...tracks, track_new])
                        setUpdate(updates > 0 ? ++updates : 1)
                        setToastMessage({
                            value: item.song_name+' 已加入歌单，可在歌单选取播放',
                            timestamp: new Date().getTime()
                        })
                    } else {
                        throw new Error('无法获取到有效源')
                    }
                } else {
                    throw new Error('an unexpected behavior occurred.')
                }
            }).catch(err => {
                setToastMessage({
                    value: '发生不可预知的行为，错误信息：'+err.message,
                    timestamp: new Date().getTime()
                })
                if (!navigator.clipboard) {
                    setToastMessage({
                        value: `复制失败，您当前的访问环境不支持自动复制，请记录URL【${err.config.url}】`,
                        timestamp: new Date().getTime()
                    })
                    return 0
                }
                navigator.clipboard
                    .writeText(err.config.url)
                    .then(
                        (res) => {
                            setToastMessage({
                                value: '请求资源的URL已同步到剪贴板',
                                timestamp: new Date().getTime()
                            })
                        },
                    )
                    .catch((error) => {
                        setToastMessage({
                            value: `复制失败，请记录URL【${err.config.url}】，错误信息：${error}`,
                            timestamp: new Date().getTime()
                        })
                    });
                console.error('Error info:',err)
            })
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
                throw new Error('an unexpected behavior occurred.')
            }
            */
        } else {
            !flag && fetchMusicSource(1, track).then(async res => {
                console.log(res.data)
                if (res.data.status.code === 200) {
                    let item = res.data.data;
                    if (typeof item.mp3.url === 'string' && item.mp3.url.length > 0) {
                        let tempar: string[] = [];
                        item.ar.map((item: any) => tempar.push(item.name));
                        let track_new: Track = {
                            title: item.name,
                            subtitle: item.al.name,
                            artist: tempar.join('、'),
                            src: `https://music.163.com/song/media/outer/url?id=${item.mp3.id}.mp3`,
                            cover: item.al.picUrl.replaceAll('http:','https:'),
                            lyric: await fetchLyric(item.mp3.id).then(data => data.lyric),
                            album_id: String(item.al.id),
                            encode_audio_id: String(item.mp3.id),
                            code: item.mp3.md5,
                            timestamp: new Date().getTime() + 86400000,
                            unique_index: tracks.filter((item) => item.unique_index > 0).length + 1,
                            time_length: item.mp3.time
                        };
                        console.log([...tracks, track_new])
                        setIsShowing(false)
                        setTracks([...tracks, track_new])
                        setUpdate(updates > 0 ? ++updates : 1)
                        setToastMessage({
                            value: item.name + ' 已加入歌单，可在歌单选取播放',
                            timestamp: new Date().getTime()
                        })
                    } else {
                        throw new Error('无法获取到有效源')
                    }
                } else {
                    throw new Error('an unexpected behavior occurred.')
                }
            }).catch(err => {
                setToastMessage({
                    value: '发生不可预知的行为，错误信息：'+err.message,
                    timestamp: new Date().getTime()
                })
                console.error('Error info:',err)
            })
        }
    }

    const menuEvent = (id: string) => {
        if (!navigator.clipboard) {
            setToastMessage({
                value: `复制失败，您当前的访问环境不支持自动复制，请记录ID【${id}】`,
                timestamp: new Date().getTime()
            })
            return 0
        }
        navigator.clipboard
            .writeText(id)
            .then(
                (res) => {
                    setToastMessage({
                        value: 'audio_id已同步到剪贴板',
                        timestamp: new Date().getTime()
                    })
                },
            )
            .catch((error) => {
                setToastMessage({
                    value: `复制失败，请记录ID【${id}】，错误信息：${error}`,
                    timestamp: new Date().getTime()
                })
            });
    }

    return(
        <SearchWrap className={`${isShowing?'show':'hidden'}`}>
            <SearchStack>
                <SearchCard>
                    <SearchCardTitle>
                        <button name="button-back" onClick={() => setIsShowing(false)} aria-label="返回按钮">
                            <Icon className={`icon-back`} name="Back" width={18} height={18} fill="#BFBFBF" />
                        </button>
                        <SearchGroup>
                            <SearchCardSwitch onClick={dropMenu}>
                                {
                                    sourceType === 0 && (
                                        <Icon className={`icon-kugou`} name="Kugou" width={18} height={18} fill="#1296DB" />
                                    )
                                }
                                {
                                    sourceType === 1 && (
                                        <Icon className={`icon-netease`} name="NeteaseMusic" width={18} height={18} fill="#E82202" />
                                    )
                                }
                            </SearchCardSwitch>
                            <SearchCardInput
                                type="search"
                                autoFocus
                                onChange={e => watchInputValue(e.target.value)}
                                onKeyDown={e => handleKeyDown(e)}
                                ref={searchInputRef}
                            />
                            <SearchCardButton name="button-search" onClick={() => doSearch(sourceType, value)}>
                                <Icon className={`icon-search`} name="Search" width={18} height={18} fill="#BFBFBF" />
                            </SearchCardButton>
                        </SearchGroup>
                    </SearchCardTitle>
                    <SearchCardContent>
                        {!loading && result.length > 0 && result[0].AlbumID !== 'null' && (
                            result.map((item: resultType, index) => {
                                return(
                                    <SearchItem key={index}>
                                        <SearchItemLabel>
                                            <div className="inline-flex items-center gap-2 overflow-hidden overflow-ellipsis whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className=""
                                                    data-hash={item.FileHash}
                                                    data-album_id={item.AlbumID}
                                                    data-audio_id={item.EMixSongID}
                                                    onClick={ (e) => {
                                                        addToTracks((e.target as HTMLElement).dataset)
                                                    }}
                                                />
                                                <img src={(item.Image).replace('{size}','120')} className="w-12 h-12 rounded-xl" alt={item.OriSongName} loading="lazy" />
                                                <div className="flex flex-col gap-0.5" >
                                                    <span className="text-sky-500">{item.OriSongName}</span>
                                                    <span className="text-sm text-gray-500">{item.SingerName}</span>
                                                </div>
                                            </div>
                                            <button onClick={e => menuEvent(item.EMixSongID)}>
                                                <Icon className={`icon-more`} name="More" width={18} height={18} fill="#CCCCCC" />
                                            </button>
                                        </SearchItemLabel>
                                    </SearchItem>
                                )
                            })
                        )}
                        {!loading && result.length > 0 && result[0].AlbumID === 'null' && (
                            <div className="flex justify-center">
                                输入歌曲或歌手名开始搜索吧
                            </div>
                        )}
                        {!loading && result.length === 0 && (
                            <div className="flex justify-center">
                                没有查询到相关结果
                            </div>
                        )}
                        {loading && (
                            <div className="flex justify-center">
                                搜索中，请等待...
                            </div>
                        )}
                    </SearchCardContent>
                </SearchCard>
            </SearchStack>
        </SearchWrap>
    )
}

export default Search;
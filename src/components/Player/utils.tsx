import axios from "axios";
import { MD5 } from "crypto-es/lib/md5";

type Track = {
    title: string,
    subtitle: string,
    artist: string,
    src: string,
    cover: string,
    lyric: string,
    album_id: string,
    encode_audio_id: string,
    code: string,
    timestamp: number,
    unique_index: number,
    time_length: number
}

type sTrack = {
    code: string | undefined,
    album_id: string | undefined,
    encode_audio_id: string | undefined
}

type lTrack = {
    code: string,
    title: string,
    artist: string,
    time_length: number
}

type itemType = {
    play_url: string,
    song_name: string,
    album_name: string,
    author_name: string,
    img: string,
    lyrics: string,
    album_id: string,
    encode_album_audio_id: string,
    hash: string,
    is_free_part: boolean,
    timelength: number,
    trans_param: {
        hash_offset: {
            end_ms: number
        }
    }
}

type itemType2 = {
    al: {
        id: number,
        name: string,
        picUrl: number
    },
    alia: string[],
    ar: {
        id: number,
        name: string,
    }[],
    dt: number,
    mp3: {
        id: number,
        md5: string,
        time: number,
        url: string
    },
    name: string
}

const sign = (params: [string, number | string][]) => {
    let source: string[] = [];
    params.forEach((v,i)=>{source[i]=v.join('=')});
    console.log('NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt'+source.join('')+'NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt')
    return MD5('NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt'+source.join('')+'NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt').toString()
}

const fetchMusicSource = async(type: number, data: Track | sTrack) => {
    // a jsonp mode
    if (type === 0) {
        const time = new Date().getTime()
        const params = {
            appid: 1014,
            clienttime: time,
            clientver: 20000,
            dfid: '2UHESU2QNUu24TpfQl3Qnedv',
            encode_album_audio_id: data.encode_audio_id as string,
            mid: '53c3138021cb02ea435a33c586fd4fbb',
            platid: 4,
            srcappid: 2919,
            token: '',
            userid: 0,
            uuid: '53c3138021cb02ea435a33c586fd4fbb'
        }
        return axios.get(`https://thingproxy.freeboard.io/fetch/https://wwwapi.kugou.com/play/songinfo?srcappid=2919&clientver=20000&clienttime=${time}&mid=${'53c3138021cb02ea435a33c586fd4fbb'}&uuid=${'53c3138021cb02ea435a33c586fd4fbb'}&dfid=${'2UHESU2QNUu24TpfQl3Qnedv'}&appid=1014&platid=4&encode_album_audio_id=${data.encode_audio_id}&token=&userid=0&signature=${sign(Object.entries(params))}`).then(res => res.status && res.data)
    } else {
        return axios.get(`https://bird.ioliu.cn/netease/song`, {
            params: {
                id: data.encode_audio_id
            }
        })
    }
    /*
    // a proxy mode
    return axios.get('/get_song', {
        params: {
            r: 'play/getdata',
            dfid: cookie.load('kg_dfid') || '4FHbnb44LtSM2JrXpX3riltQ',
            mid: cookie.load('kg_mid') || '50e0be703d34ee6401eedf772101571b',
            appid: 1014,
            encode_album_audio_id: data.encode_audio_id,
            platid: 4,
            _: new Date().getTime()
        }
    })
    */
} //[INVOLVE]获取歌曲源

const fetchLyric = async(id: number) => {
    return axios.get(`https://thingproxy.freeboard.io/fetch/https://music.163.com/api/song/lyric?os=pc&id=${id}&lv=-1&kv=-1&tv=-1`).then(res => res.data.code && { lyric: res.data.lrc.lyric, tlyric: res.data.tlyric?.lyric || [''] })
}

const fetchKugouLyric = async(data: Track | lTrack) => {
    const time = new Date().getTime()
    const params = {
        clienttime: time,
        clientver: 20000,
        dfid: '-',
        hash: data.code,
        keyword: `${data.artist} - ${data.title}`,
        mid: time,
        srcappid: 2919,
        timelength: data.time_length,
        uuid: time
    }
    return axios.get(`https://thingproxy.freeboard.io/fetch/https://m3ws.kugou.com/api/v1/krc/get_lyrics?keyword=${data.artist}%20-%20${data.title}&hash=${data.code}&timelength=${data.time_length}&srcappid=2919&clientver=20000&clienttime=${time}&mid=${time}&uuid=${time}&dfid=-&signature=${sign(Object.entries(params))}`).then(res => res.data.data)
}

const getTime = (type: number) => {
    let timeDisplay = Math.floor(type);
    let min = !Number.isNaN(timeDisplay) ? timeDisplay / 60 : -1;
    let mins: number | string = min | 0;
    if (mins >= 0 && mins < 10) {
        mins = "0" + mins;
    } else if (mins === -1) {
        mins = "--";
    }
    let sec = !Number.isNaN(timeDisplay) ? timeDisplay % 60 : -1;
    let secs: number | string = sec | 0;
    if (secs >= 0 && secs < 10) {
        secs = "0" + secs;
    } else if (secs === -1) {
        secs = "--";
    }
    return mins + ":" + secs;
};

const syncMediaSession = (track: Track | null) => {
    if (track) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.artist,
            album: track.subtitle,
            artwork: [{ src: track.cover, type: "image/jpeg", sizes: "480x480" }]
        })
    } else {
        navigator.mediaSession.metadata = null
    }
}

export { fetchMusicSource, fetchLyric, fetchKugouLyric, syncMediaSession, getTime, sign };
export type { Track, itemType, itemType2 };
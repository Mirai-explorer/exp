import {styled} from "styled-components";
import React, {SetStateAction, useEffect, useRef, useState} from "react";
import {Track, getTime} from "@/components/Player/utils";
import Icon from "@/components/Icons/player_icon";

const PlayListWrap =
    styled.div`
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      display: block;
      transition: background-color .1s ease-out, visibility .1s ease;
      content-visibility: auto;

      &.show {
        visibility: visible;
        background-color: rgba(0, 0, 0, .3);
      }

      &.hidden {
        visibility: hidden;
        background-color: transparent;
      }
    `
const PlayListStack =
    styled.div`
      display: flex;
      width: 100%;
      height: 100%;
      align-items: flex-end;
      justify-content: center;
    `

const PlayListCard =
    styled.div`
      position: fixed;
      display: flex;
      flex-direction: column;
      font-size: 16px;
      border-radius: 1rem 1rem 0 0;
      background: #FFFFFF;
      color: #000000;
      height: 70vh;
      max-height: 600px;
      width: 100%;
      padding: 1rem;
      transition: bottom .3s ease;
      
      .show & {
        bottom: 0;
      }
      
      .hidden & {
        bottom: -70vh;
      }
    `
const PlayListCardTitle =
    styled.div`
      display: flex;
      align-items: center;
      width: 100%;
      padding: 1rem;
      gap: 1rem;
    `

const Control =
    styled.button`
        
    `

const PlayListGroup =
    styled.div`
      display: flex;
      width: 100%;
      position: relative;
      justify-content: center;
    `

const PlayListCardContent =
    styled.div`
      display: flex;
      flex-direction: column;
      overflow: auto;
      flex: 1;
      gap: .25rem;

      &::-webkit-scrollbar {
        display: none;
      }
    `

const PlayItem =
    styled.div`
      display: inline-flex;
      align-items: center;
      width: 100%;
      min-height: 48px;
      padding: .5rem 1rem;
      flex-shrink: 0;
      transition: transform 200ms ease-out, background-color 200ms ease-out;

      &:active {
        background-color: #eceff1;
      }
      
      &.highlight span.play-item_title {
        color: #9b1442;
      }
      
      &.invalid img {
        filter: grayscale(100)!important;
      }
      
      &.invalid div, &.invalid span {
        color: #cccccc!important;
      }
    `

const PlayItemLabel =
    styled.div`
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      line-height: 24px;
      gap: 8px;
    `

const PlayList = ({tracks, setTracks, trackIndex, setTrackIndex, isShowing, setIsShowing, updates, setUpdate, setReload, toPlay, playState, otherLyric} : {
    tracks: Track[],
    setTracks: React.Dispatch<SetStateAction<Track[]>>,
    trackIndex: number,
    setTrackIndex: React.Dispatch<SetStateAction<number>>,
    isShowing: boolean,
    setIsShowing: React.Dispatch<SetStateAction<boolean>>,
    updates: number,
    setUpdate: React.Dispatch<SetStateAction<number>>,
    setReload: React.Dispatch<SetStateAction<boolean>>,
    toPlay: Function,
    playState: boolean,
    otherLyric: ({
        translation: string[],
        romaji: string[]
    } | null)[]
}) => {
    const [X, setX] = useState(0)
    const target = useRef<Array<HTMLDivElement | null >>([])
    const delConfirm = async (text: string, index: number) => {

        if (true) {
            if (tracks.length > 1) {
                console.log(index+' deleted')
                const _tracks = tracks.filter((item, id) => id !== index)
                _tracks.forEach((item, num) => {
                    if (item.unique_index > 0) {
                        item.unique_index = num + 1
                    }
                })
                otherLyric?.splice(index, 1)
                console.log(_tracks)
                setTracks(_tracks)
                if (trackIndex === index) {
                    setTrackIndex(trackIndex < _tracks.length ? trackIndex : 0)
                    setReload(true)
                } else {
                    setTrackIndex(trackIndex < index ? trackIndex : --trackIndex)
                }
                setUpdate(updates < 0 ? updates - 1 : -1)
            } else {
                console.log('禁止删除')
            }
        } else {
            console.log('nothing to do')
        }
    }
    const resetConfirm = async () => {

        if (true) {
            window.indexedDB.deleteDatabase("MiraiDB").onsuccess = () => {
                window.location.reload()
            }
        } else {
            console.log('nothing to do')
        }
    }

    useEffect(() => {
        target.current = target.current.slice(0, tracks.length)
    }, [tracks]);

    const handleClick = (i: number) => {
        setTrackIndex(i)
        trackIndex !== i ? setReload(true) : toPlay(!playState)
        setIsShowing(false)
    }

    const dragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setX(e.clientX)
        console.log(index)
    }

    const touchStart = (e: React.TouchEvent<HTMLDivElement>, index: number) => {
        setX(e.touches[0].clientX)
        console.log(index)
    }

    const onDrag = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        if (e.clientX - X > -240) {
            target.current[index]!.style.transform = `translateX(-60px)`;
        } else {
            target.current[index]!.style.transform = `translateX(-240px)`;
        }
    }

    const onTouch = (e: React.TouchEvent<HTMLDivElement>, index: number) => {
        if (e.touches[0].clientX - X > -120) {
            target.current[index]!.style.transform = `translateX(-30px)`;
        } else {
            target.current[index]!.style.transform = `translateX(-120px)`;
        }
    }
    const dragEnd = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        target.current[index]!.style.transform = `translateX(0px)`;
        (e.clientX - X < -150) && delConfirm(`确认要删除 ${tracks[index].title} 吗？`, index)
    }

    const touchEnd = (e: React.TouchEvent<HTMLDivElement>, index: number) => {
        target.current[index]!.style.transform = `translateX(0px)`;
        (e.changedTouches[0].clientX - X < -150) && delConfirm(`确认要删除 ${tracks[index].title} 吗？`, index)
    }

    return (
        <PlayListWrap className={`${isShowing?'show':'hidden'}`}>
            <PlayListStack>
                <PlayListCard>
                    <PlayListCardTitle>
                        <Control name="button-back" onClick={() => setIsShowing(false)} aria-label="关闭按钮">
                            <Icon className={`icon-close`} name="Close" width={12} height={12} fill="#000000" />
                        </Control>
                        <PlayListGroup>
                            <div className="text-[20px]" onClick={() => target.current[trackIndex]?.scrollIntoView({ behavior: "smooth", block: "center" })}>播放列表</div>
                        </PlayListGroup>
                        <Control name="button-database" onClick={() => resetConfirm()} aria-label="数据库初始化按钮">
                            <Icon className={`icon-database`} name="Database" width={18} height={18} fill="#000000" />
                        </Control>
                    </PlayListCardTitle>
                    <PlayListCardContent>
                        {tracks && (
                            tracks.map((item: Track, index: number) => {
                                return(
                                    <PlayItem
                                        key={index}
                                        className={`${index === trackIndex ? 'highlight' : 'normal'} ${item.timestamp < new Date().getTime() && 'invalid'}`}
                                        onClick={() => handleClick(index)}
                                        onDragStart={e => dragStart(e, index)}
                                        onDragOver={e => onDrag(e, index)}
                                        onDragEnd={e => dragEnd(e, index)}
                                        onTouchStart={e => touchStart(e, index)}
                                        onTouchMove={e => onTouch(e, index)}
                                        onTouchEnd={e => touchEnd(e, index)}
                                        ref={(ref => target.current[index] = ref) as React.LegacyRef<any>}
                                        draggable
                                    >
                                        <PlayItemLabel>
                                            <img src={item.cover} className={`w-12 h-12 rounded-xl`} alt={item.title} loading="lazy" />
                                            <div className="flex flex-col flex-grow overflow-hidden gap-0.25">
                                                <span className="play-item_title text-ellipsis whitespace-nowrap overflow-hidden text-[16px]">{item.title}</span>
                                                <span className="play-item_subtitle text-ellipsis whitespace-nowrap overflow-hidden text-[#888888] text-[14px]">{item.artist}</span>
                                            </div>
                                            <span>{getTime(item.time_length/1000)}</span>
                                        </PlayItemLabel>
                                    </PlayItem>
                                )
                            })
                        )}
                        {!tracks && (
                            <div className="flex justify-center">
                                歌单空空的，先去找找吧~
                            </div>
                        )}
                    </PlayListCardContent>
                </PlayListCard>
            </PlayListStack>
        </PlayListWrap>
    )
}

export default PlayList;
import React from "react";
import { styled } from "styled-components";
import Icon from "../../Icons/player_icon"

const ControllerWrap =
    styled.div`
      display: flex;
      align-self: flex-end;
      width: 100%;
      height: 100px;
    `

const ControllerInner =
    styled.div`
      display: flex;
      justify-content: center;
      width: 100%;
      height: 100%;
      
      button {
        padding: 0;
        border-style: none;
        outline: none;
        background-color: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `
const Left =
    styled.div`
      display: flex;
      width: 48px;
      height: 100%;
      align-items: center;
      gap: .3rem;
      
      > button {
        width: 24px;
        height: 24px;
      }
    `
const Center =
    styled.div`
      display: flex;
      flex: 1;
      justify-content: center;
      align-items: center;
      margin: auto 0;
      height: 60px;
      
      button {
        margin: .6rem;
      }
    `

const Right =
    styled(Left)`
    `

const Button =
    styled.button`
      -webkit-appearance: none;
      background: none;
      border: none;
      cursor: pointer;
    `

const setFullscreen = () => {
    document.fullscreenElement !== null ? document.exitFullscreen() : document.documentElement.requestFullscreen()
}

const Controller = ({ isPlaying, onPlayPauseClick, onPrevClick, onNextClick, onPlayListClick, setSettingShowing, loopMode, setLoopMode} : {
    isPlaying : boolean,
    onPlayPauseClick: Function,
    onPrevClick: React.MouseEventHandler<HTMLButtonElement>,
    onNextClick: React.MouseEventHandler<HTMLButtonElement>,
    onPlayListClick: React.Dispatch<React.SetStateAction<boolean>>,
    setSettingShowing: React.Dispatch<React.SetStateAction<boolean>>,
    loopMode: number,
    setLoopMode: React.Dispatch<React.SetStateAction<number>>
}) => {
    const openPlaylist = () => {
        onPlayListClick(true)

    }
    return(
        <ControllerWrap>
            <ControllerInner>
                <Left>
                    {loopMode === 0 && (
                        <Button
                            type="button"
                            className="loop"
                            onClick={() => setLoopMode(1)}
                            aria-label="Loop"
                        >
                            <Icon className={`icon-loop`} name="Loop" width={24} height={24} />
                        </Button>
                    )}
                    {loopMode === 1 && (
                        <Button
                            type="button"
                            className="single_cycle"
                            onClick={() => setLoopMode(2)}
                            aria-label="SingleCycle"
                        >
                            <Icon className={`icon-single_cycle`} name="SingleCycle" width={24} height={24} />
                        </Button>
                    )}
                    {loopMode === 2 && (
                        <Button
                            type="button"
                            className="random"
                            onClick={() => setLoopMode(0)}
                            aria-label="Random"
                        >
                            <Icon className={`icon-random`} name="Random" width={24} height={24} />
                        </Button>
                    )}
                    <Button
                        type="button"
                        className="setting"
                        onClick={() => setSettingShowing(true)}
                        aria-label="Setting"
                    >
                        <Icon className={`icon-setting`} name="Setting" width={24} height={24} />
                    </Button>
                </Left>
                <Center>
                    <Button
                        type="button"
                        className="prev"
                        aria-label="Previous"
                        onClick={onPrevClick}
                    >
                        <Icon className={`icon-prev`} name="Prev" width={24} height={24} />
                    </Button>
                    {isPlaying ? (
                        <Button
                            type="button"
                            className="pause"
                            onClick={() => onPlayPauseClick(false)}
                            aria-label="Pause"
                        >
                            <Icon className={`icon-pause`} name="Pause" width={60} height={60} />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            className="play"
                            onClick={() => onPlayPauseClick(true)}
                            aria-label="Play"
                        >
                            <Icon className={`icon-play`} name="Play" width={60} height={60} />
                        </Button>
                    )}
                    <Button
                        type="button"
                        className="next"
                        aria-label="Next"
                        onClick={onNextClick}
                    >
                        <Icon className={`icon-next`} name="Next" width={24} height={24} />
                    </Button>
                </Center>
                <Right>
                    <Button
                        type="button"
                        className="fullscreen"
                        aria-label="Fullscreen"
                        onClick={() => setFullscreen()}
                    >
                        <Icon className={`icon-fullscreen`} name="Fullscreen" width={20} height={20} />
                    </Button>
                    <Button
                        type="button"
                        className="playlist"
                        aria-label="Playlist"
                        onClick={() => openPlaylist()}
                    >
                        <Icon className={`icon-playlist`} name="Playlist" width={24} height={24} />
                    </Button>
                </Right>
            </ControllerInner>
        </ControllerWrap>
    )
}

export default Controller;
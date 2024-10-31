import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {Track} from "@/components/Player/utils";

type lyricType = {
    offset: number,
    text: string
}

const LyricWrap =
    styled.div`
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      flex: 1;
      padding: 1rem 0;

      ::-webkit-scrollbar {
        width: 8px;
        height: 100%;
        opacity: 0;
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb {
        width: 10px;
        height: 30px;
        background-color: rgba(255,255,255,.3);
        border-radius: 4px;
        cursor: pointer;
      }
    `

const Scroll =
    styled.div`
      width: 100%;
      height: 96px;
      overflow-y: hidden;
      overflow-x: hidden;
    `

const FullScroll =
    styled.div`
      width: 100%;
      height: 55vh;
      overflow-y: hidden;
      overflow-x: hidden;
    `

const Waterfall =
    styled.div`
      width: 100%;
      height: auto;
      letter-spacing: 0.1em;
      overflow: hidden;
      position: relative;
      display: grid;
      grid-auto-rows: max-content;
      transition: transform 200ms linear;
      transform: translateY(32px);
      will-change: transform;
      
      &.reduce {
        transition: transform 100ms linear;
      }
    `

const FullWaterfall =
    styled.div`
      width: 100%;
      height: inherit;
      padding: 50% 0;
      letter-spacing: 0.1em;
      overflow: auto;
      position: relative;
      display: grid;
      grid-auto-rows: minmax(max-content,auto);
      transition: all 200ms linear;
      scrollbar-width: none;
      gap: 1rem;

      &::-webkit-scrollbar {
        width: 0;
      }
    `

const Line =
    styled.div`
      display: inline-grid;
      text-align: center;
      align-items: center;
      opacity: .1;
      font-size: 16px;
      font-weight: 500;
      line-height: 1;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      letter-spacing: 2px;
      min-height: 32px;
      will-change: opacity, font-size, font-weight, line-height;
      transition: all 200ms ease-out;
      
      &.bubble {
        font-weight: 700;
        opacity: 1;
        font-size: 20px;
        line-height: 1.5;
        white-space: pre-wrap;
      }
      
      &.await {
        opacity: .5;
      }

      &.bubble, &.await {
        transition: all 300ms ease-out;
      }

      .reduce {
        &.bubble, &.await {
          transition: all 100ms linear;
        }
      }
    `

const FullLine =
    styled.div<{$size: number}>`
      display: inline-grid;
      align-items: center;
      opacity: .3;
      color: snow;
      font-size:  ${props => props.$size | 18}px;
      font-weight: 500;
      line-height: 1.5;
      width: 100%;
      white-space: pre-wrap;
      overflow: hidden;
      letter-spacing: 2px;
      will-change: opacity, font-weight;
      transition: opacity 500ms cubic-bezier(0.19, 1, 0.22, 1);
      scroll-snap-align: center;
      
      &.bubble {
        font-weight: 700;
        opacity: 1;
        font-size:  ${(props) => props.$size | 18}px;
      }

      &.bubble, &.await {
        transition: all 500ms cubic-bezier(0.215, 0.61, 0.355, 1);
      }

      .reduce {
        &.bubble, &.await {
          transition: all 100ms linear;
        }
      }

      span.other_lyric {
        font-size: 16px;
      }
    `

const Lyric = ({ tracks, trackIndex, trackProgress, reduce, fontSize, offset, layout, otherLyric, lyricMode } : {
    tracks: Track[],
    trackIndex: number,
    trackProgress: number,
    reduce: string,
    fontSize: number,
    offset: number,
    layout: number,
    otherLyric: ({
        translation: string[],
        romaji: string[]
    } | null)[],
    lyricMode?: number
}) => {
    const [number, setNumber] = useState(0);
    const target: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
    const eleRef = useRef<Array<HTMLDivElement | null >>([]);
    const parseLrc = (str: string) => {
        const regex: RegExp = /^\[(?<time>\d{2}:\d{2}(.\d{2,})?)\](?<text>.*)/;
        const lines: string[] | null = str.split("\n");
        const output: lyricType[] = [];
        const parseTime = (time: string) => {
            const minsec = time.split(":");
            const min = parseInt(minsec[0]) * 60;
            const sec = parseFloat(minsec[1]);
            return min + sec;
        };
        lines.forEach((line) => {
            const match: RegExpMatchArray | null = line.match(regex);
            if (match && match.groups) {
                const { time, text } = match.groups;
                output.push({
                    offset: Number(parseTime(time).toFixed(2)),
                    text: text.trim()
                });
            }
        });
        return output;
    };

    const lyric = parseLrc(tracks[trackIndex].lyric);

    const syncLyric = (lyrics: lyricType[], time: number) => {
        const scores : number[] = [];
        lyrics.map((lyric : lyricType) => {
            const score = time - lyric.offset;
            if (score >= offset) {
                scores.push(score);
            }
        });
        if (scores.length === 0) return null;
        const closest : number = Math.min(...scores);
        return scores.indexOf(closest);
    };

    useEffect(() => {
        setNumber(syncLyric(lyric, trackProgress) as number);
    }, [trackProgress]);

    useEffect(() => {
        target.current !== null ? target.current.style.transform = `translateY(32px)` : null;
        eleRef.current[0]?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, [trackIndex]);

    useEffect(() => {
        target.current !== null ? target.current.style.transform = `translateY(${-(32 * number)+32}px)` : null;
        eleRef.current[number]?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, [number]);

    return (
        <LyricWrap>
            {layout === 1 && (
                <Scroll>
                    <Waterfall ref={target} className={reduce}>
                        {lyric.length ? (
                            lyric.map((item: lyricType, index : number) => {
                                return (
                                    <Line
                                        key={index}
                                        className={
                                            number === index
                                                ? "bubble"
                                                : number === index - 1
                                                    ? "await"
                                                    : ""
                                        }
                                        data-time={item.offset}
                                    >
                                        {item.text}
                                    </Line>
                                );
                            })
                        ) : (
                            <Line className="bubble">暂无歌词</Line>
                        )}
                    </Waterfall>
                </Scroll>
            )}
            {layout === 2 && (
                <FullScroll>
                    <FullWaterfall className={reduce}>
                        {lyric.length ? (
                            lyric.map((item: lyricType, index : number) => {
                                return (
                                    <FullLine
                                        key={index}
                                        className={
                                            number === index
                                                ? "bubble"
                                                : number === index - 1
                                                    ? "await"
                                                    : ""
                                        }
                                        data-time={item.offset}
                                        $size={fontSize}
                                        ref={(target => eleRef.current[index] = target) as React.LegacyRef<any>}
                                    >
                                        <span>{item.text}</span>
                                        <span className="other_lyric">
                                            {lyricMode === 0 && ''}
                                            {lyricMode === 1 && otherLyric[trackIndex]?.translation[index]}
                                            {lyricMode === 2 && otherLyric[trackIndex]?.romaji[index]}
                                        </span>
                                    </FullLine>
                                );
                            })
                        ) : (
                            <Line className="bubble">暂无歌词</Line>
                        )}
                    </FullWaterfall>
                </FullScroll>
            )}
        </LyricWrap>
    );
}

export default Lyric;
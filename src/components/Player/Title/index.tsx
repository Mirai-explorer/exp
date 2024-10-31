import {keyframes, styled} from "styled-components";
import React, {useEffect} from "react";
import {className} from "postcss-selector-parser";

type propsType = {
    title: string;
    subtitle: string;
    singer: string;
    trackIndex: number;
    className?: string
}

interface customCSSProperties extends React.CSSProperties {
    '--width': string,
    '--duration': string
}

const TitleWrap =
    styled.div`
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      width: 100%;
      height: 100%;
      max-height: 72px;
      color: white;
      overflow: hidden;
      
      &.thick {
        justify-content: center;
        gap: 0.25rem;
      }
      
      &.thin {
        justify-content: center;
        gap: 0.25rem;
        text-align: center;
        max-width: 320px;
      }
    `

const marquee_anime =
    keyframes`
      0% {
        transform: translateX(0%);
        opacity: 0;
      }

      5% {
        transform: translateX(0%);
        opacity: 1;
      }

      10% {
        transform: translateX(0%);
        opacity: 1;
      }

      90% {
        opacity: 1;
      }

      100% {
        transform: translateX(var(--width));
        opacity: 0;
      }
    `

const Line =
    styled.div`
      display: inline-block;
      line-height: 1.5rem;
      overflow: hidden;
      white-space: nowrap;
      
      &.primary {
        font-size: 20px;
        font-weight: 700;
        text-shadow: 0 3px 6px rgba(0,0,0,.16);
        letter-spacing: 0.06em;
      }
      
      .thick &.primary {
        font-size: 16px;
      }
      
      .marquee {
        animation-name: ${marquee_anime};
        animation-duration: var(--duration);
        animation-iteration-count: infinite;
        animation-delay: 0s;
        animation-timing-function: linear;
      }
      
      .secondary {
        font-size: 16px;
        text-shadow: 0 3px 6px rgba(0,0,0,.16);
        letter-spacing: 0.06em;
        color: rgba(255, 255, 255, .9);
      }
      
      .blank_fill {
        display: inline-flex;
        width: 50px;
      }
      
      &.tertiary {
        font-size: 16px;
        letter-spacing: 0.04em;
        color: rgba(255, 255, 255, .8);
      }

      .thick &.tertiary {
        font-size: 14px;
      }
    `

const Title = (props: propsType) => {
    const ref1 = React.createRef<HTMLDivElement>()
    const ref2 = React.createRef<HTMLDivElement>()
    const [width1, setWidth1] = React.useState(0)
    const [width2, setWidth2] = React.useState(0)

    useEffect(() => {
        ref1.current!.style.animation = 'none'
        ref2.current!.style.animation = 'none'
        if (ref1.current!.clientWidth < ref1.current!.scrollWidth) {
            setWidth1(ref1.current!.scrollWidth)
            ref1.current!.style.animation = ''
        }
        if (ref2.current!.clientWidth < ref2.current!.scrollWidth) {
            setWidth2(ref2.current!.scrollWidth)
            ref2.current!.style.animation = ''
        }
    }, [props.trackIndex]);

    const style1: customCSSProperties = {
        '--width': -width1+'px',
        '--duration': (width1/30).toFixed(2)+'s'
    }

    const style2: customCSSProperties = {
        '--width': -width2+'px',
        '--duration': (width2/30).toFixed(2)+'s'
    }

    return (
        <TitleWrap className={props.className || 'normal'}>
            <Line className="primary">
                <div className="marquee" id="m1" ref={ref1} style={style1}>
                    <span>{props.title}</span>
                    <span className="secondary">（{props.subtitle}）</span>
                </div>
            </Line>
            <Line className="tertiary">
                <div className="marquee" id="m2" ref={ref2} style={style2}>
                    <span>{props.singer}</span>
                </div>
            </Line>
        </TitleWrap>
    )
}

export default Title;
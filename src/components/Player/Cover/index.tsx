import { styled, keyframes } from "styled-components";
import React from "react";

interface propsType extends React.InputHTMLAttributes<HTMLInputElement> {
    rotate: string,
    url: string,
    ['data-size']: string,
    desc: string,
    className?: string
}

const rotate = keyframes`
      from { transform: rotate(0deg) }
      to { transform: rotate(360deg) }
    `

const CoverWrap =
    styled.div`
        flex-shrink: 0;
    `

const CoverShell =
    styled.div`
      border-radius: 50%;
      box-shadow: 0 3px 6px rgba(0,0,0,.16);
      animation: ${rotate} 15s linear infinite;
      animation-play-state: paused;
      
      &.thick, &.thin {
        animation: none;
      }

      &.thick {
        border-radius: 20%;
      }

      &.thin {
        border-radius: 10%;
      }
      
      .source {
        border-radius: inherit;
        transition: all 0.5s ease-out;
      }
      
      .source[data-size="large"] {
        width: 50vw;
        height: 50vw;
        min-width: 320px;
        min-height: 320px;
        max-width: 600px;
        max-height: 600px;
      }
      
      .source[data-size="default"] {
        width: 30vw;
        height: 30vw;
        min-width: 160px;
        min-height: 160px;
        max-width: 320px;
        max-height: 320px;
      }
      
      .source[data-size="mini"] {
        width: 15vw;
        height: 15vw;
        min-width: 64px;
        min-height: 64px;
        max-width: 80px;
        max-height: 80px;
      }
    `

const Cover = (props: propsType) => {
    return (
        <CoverWrap>
            <CoverShell className={props.className || 'normal'} style={{ animationPlayState: `${props.rotate}`}} onDoubleClick={props.onDoubleClick}>
                <img
                    className="source"
                    src={props.url}
                    data-size={props["data-size"]}
                    alt={props.desc}
                    width="320px"
                    height="320px"
                />
            </CoverShell>
        </CoverWrap>
    )
};

export default Cover;

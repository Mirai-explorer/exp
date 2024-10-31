import { styled } from "styled-components";

type propsType = {
    past: string;
    _duration: string;
    trackProgress: number;
    duration: number;
    onScrub: Function;
    onScrubEnd: Function;
    trackStyling: string;
}

const ProgressWrap =
    styled.div`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 48px;
      width: 100%;
    `

const Digits =
    styled.div`
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 24px;
    `

const Time =
    styled.div`
      letter-spacing: 0.05em;

      &.current, &.duration  {
        font-size: 14px;
        display: inline-flex;
        color: rgba(255, 255, 255, .8);
      }
    `

const ProgressBar =
    styled.div`
      width: 100%;
      height: 16px;
    `

const ProgressBarObject =
    styled.input`
      border-radius: 0;
      font-size: 16px;
      outline: none;

      &[type="range"] {
        height: 4px;
        -webkit-appearance: none;
        width: 100%;
        border-radius: 2px;
        background: #3b7677;
        transition: background 0.1s linear;
        cursor: pointer;
      }

      &[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 0.75rem;
        width: 0.75rem;
        background: #ffffff;
        border-radius: 50%; /*外观设置为圆形*/
        border: solid 0.125em rgba(205, 224, 230, 0.5); /*设置边框*/
        /*box-shadow: 0 0.125em 0.125em #181c1d; /*添加底部阴影*/
        transition: all 0.1s linear;
      }
    `

const Progress = (props: propsType) => {
    return (
        <ProgressWrap>
            <ProgressBar>
                <ProgressBarObject
                    type="range"
                    name="progress-bar"
                    value={props.trackProgress}
                    step="0.1"
                    min="0"
                    max={props.duration ? props.duration : `100`}
                    onChange={(e) => props.onScrub(e.target.value)}
                    onMouseUp={(e) => props.onScrubEnd((e.target as HTMLInputElement).value)}
                    onKeyUp={(e) => props.onScrubEnd((e.target as HTMLInputElement).value)}
                    onTouchEnd={(e) => props.onScrubEnd((e.target as HTMLInputElement).value)}
                    style={{ background: props.trackStyling }}
                />
            </ProgressBar>
            <Digits>
                <Time className="current">{props.past}</Time>
                <Time className="duration">{props._duration}</Time>
            </Digits>
        </ProgressWrap>
    )
}

export default Progress;
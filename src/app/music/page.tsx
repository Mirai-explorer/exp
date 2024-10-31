"use client"
import dynamic from "next/dynamic";
const Player = dynamic(() => import('@/components/Player'), { ssr: false })

const Music = () => {
    return (
        <Player />
    )
}

export default Music;

import React from "react";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: '云端音乐播放器'
}

export default function MusicLayout({children,}: {
    children: React.ReactNode
}) {
    return (
        <>{children}</>
    )
}
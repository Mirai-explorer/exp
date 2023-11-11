import React from "react";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: '条形码识别'
}

export default function OldLayout({children,}: {
    children: React.ReactNode
}) {
    return (
        <>{children}</>
    )
}
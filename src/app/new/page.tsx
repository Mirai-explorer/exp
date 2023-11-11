import dynamic from "next/dynamic";

const New = dynamic(() => import('@/components/New'), {
    ssr: false
});

const Page = () => {
    return(
        <New></New>
    )
}

export default Page;
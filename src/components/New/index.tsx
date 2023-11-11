import React from 'react';
import crypto from "crypto-js";

const Barcode = () => {
    const str = '1234637'
    const strMd5 = crypto.MD5(str).toString().toLowerCase()
    console.log(strMd5)
    return(
        <div>

        </div>
    )
}

export default Barcode;
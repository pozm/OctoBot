const {fetch: origFetch} = window;
window.fetch = (url,opts) => {
    const fpPromise = import('https://openfpcdn.io/fingerprintjs/v3')
    .then(FingerprintJS => FingerprintJS.load())
    return new Promise(async (ok,rej)=>{
        let body = opts.body;
        let b = atob(body.slice(2,-2));
        let fp = await fpPromise.then(fp => fp.get())
        let data = await origFetch(url,{...opts,method:"post",body:b+"."+fp.visitorId});
        if (data.ok) {
            window.location.replace(await data.text())
        } 
        return rej(null);
    })
} 
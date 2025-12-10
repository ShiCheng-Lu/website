

async function request() {
    // const fetch()
    const url = "https://";
    const response = await fetch(url, {
        method: '',
        headers: {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "github:\\"
        }
    })

}
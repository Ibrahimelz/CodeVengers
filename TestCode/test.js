// const apiURL = "http://localhost:8000/category/challenge-name";
// const apiURL = "https://api25.vanierhacks.net";
const apiURL = "https://ctf25.vanierhacks.net";

async function main() {
    const data = await fetch(apiURL);
    console.log(await data.json())    
    const potentialData = await fetch(apiURL, {
        headers: {// must be like this for the website to accept it like json
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            verificationCode: (await data.json()).verificationCode
        })
    })
    console.log(potentialData.text()) //text, not json
}

main();

// content-type tells if theres text or json
// submit verification code back to the server - long string - and its gonna respond with the flag
// find: verification code
// if theres an error make sure its reproducible
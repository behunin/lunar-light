const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("Access-Control-Allow-Origin", "*");

onmessage = (ev) => {
  switch (ev.data.cmd) {
    case "game":
      const title = ev.data.title;
      fetch(
        `https://staging.yuzu-emu.org/gaaaraph?queryId=gamesByTitle&variables={"title":"${title}","limit":${ev.data.limit},"offset":${ev.data.offset}}`,
        { headers: myHeaders, method: "GET", mode: "cors" },
      )
        .then(async (res) => {
          if (!res.ok) {
            throw res;
          }
          const json = await res.json();
          self.postMessage({ res: json });
        })
        .catch((e) => {
          console.error(e);
        });
      break;
    case "article":
      fetch(
        `https://staging.yuzu-emu.org/gaaaraph?queryId=articleList&variables={"limit":${ev.data.limit},"offset":${ev.data.offset}}`,
        { headers: myHeaders, method: "GET", mode: "cors" },
      )
        .then(async (res) => {
          if (!res.ok) {
            throw res;
          }
          const json = await res.json();
          self.postMessage({ res: json });
        })
        .catch((e) => {
          console.error(e);
        });
      break;
  }
};

import { createInfiniteScroll } from "@solid-primitives/pagination";
import { createSignal, For, Show } from "solid-js";
import { Link } from "./Link";

type Res = {
  id: number;
  title: string;
};

export default function InfiniteArticleScroll() {
  const [response, setRes] = createSignal([]);
  const [limit, setLimit] = createSignal(20);
  const [offset, setOffset] = createSignal(0);
  let w: Worker;
  if (window.Worker) {
    w = new Worker(new URL("../services/cms/cms-worker.ts", import.meta.url));
    w.onmessage = function (ev) {
      const { res } = ev.data;
      if (res.errors) {
        console.error(...res.errors);
        return;
      }
      setRes(res.data.articleList);
    };
  }

  const fetcher = (page: number) => {
    return new Promise<Res[]>((resolve, reject) => {
      if (page === 0) {
        setOffset(0);
      } else {
        setOffset((prev) => prev + limit());
      }
      w.postMessage({ cmd: "article", limit: limit(), offset: offset() });
      let count = 0;
      (function loop() {
        if (++count > 3) {
          reject("Failed after 3 attempts");
          return;
        }
        setTimeout(() => {
          const res = response();
          if (res.length === 0) {
            loop();
          }
          if (res.length === limit()) {
            setEnd(false);
          } else {
            setEnd(true);
          }
          resolve(res);
        }, 500);
      })();
    });
  };
  const [pages, infiniteScrollLoader, { end, setEnd }] =
    createInfiniteScroll(fetcher);

  return (
    <div class="my-4 grid grid-flow-row items-center justify-center gap-2">
      <div class="w-full lg:w-9/12">
        <label for="limt-select">Articles per page: </label>
        <select
          name="limits"
          id="limit-select"
          onChange={(ev) => {
            setLimit(parseInt(ev.currentTarget.value));
          }}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="40" selected>
            40
          </option>
          <option value="80">80</option>
          <option value="160">160</option>
        </select>
      </div>
      <div class="grid w-[80vw] grid-flow-row items-center justify-center gap-2 overflow-visible">
        <For each={pages()} fallback={<p class="text-center">No Results</p>}>
          {(item) => (
            <div class="rounded-md bg-slate-300 dark:bg-slate-600">
              <Link href={"/post/" + item.id} title={item.title} />
            </div>
          )}
        </For>
        <Show when={!end()}>
          <h4 class="text-center" use:infiniteScrollLoader>
            Loading...
          </h4>
        </Show>
      </div>
    </div>
  );
}

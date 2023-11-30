import { createInfiniteScroll } from "@solid-primitives/pagination";
import { createSignal, For, Show } from "solid-js";
import { Link } from "./Link";

type Res = {
  id: number
  title: string
};

export default function InfiniteArticleScroll() {
  const [response, setRes] = createSignal([]);
  const [limit, setLimit] = createSignal(20);
  const [offset, setOffset] = createSignal(0);
  let w: Worker;
  if (window.Worker) {
    w = new Worker(new URL('../services/cms/cms-worker.ts', import.meta.url));
    w.onmessage = function (ev) {
      const { id, res } = ev.data;
      if (res.errors) {
        console.error(...res.errors);
        return;
      }
      setRes(res.data.articleList);
    };
  }

  const fetcher = (page: number) => {
    return new Promise<Res[]>((resolve) => {
      if (page === 0) {
        setOffset(0);
      } else {
        setOffset((prev) => prev + limit());
      }
      w.postMessage({ cmd: 'article', limit: limit(), offset: offset() });
      setTimeout(() => {
        const tmp = response();
        if (tmp.length === limit()) {
          setEnd(false);
        } else {
          setEnd(true);
        }
        resolve(tmp);
      }, 500);
    });
  };
  const [pages, infiniteScrollLoader, { end, setEnd }] = createInfiniteScroll(fetcher);

  return (
    <div class="grid grid-flow-row gap-2 justify-center items-center my-4">
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
          <option value="40" selected>40</option>
          <option value="80">80</option>
          <option value="160">160</option>
        </select>
      </div>
      <div class="grid grid-flow-row gap-2 justify-center items-center w-[80vw] overflow-visible">
        <For each={pages()} fallback={<p class="text-center">No Results</p>}>
          {
            item =>
              <div class="bg-slate-300 dark:bg-slate-600 rounded-md">
                <Link href={"/post/" + item.id} title={item.title} />
              </div>
          }
        </For>
        <Show when={!end()}>
          <h4 class="text-center" use: infiniteScrollLoader>Loading...</h4>
        </Show>
      </div>
    </div >
  );
}

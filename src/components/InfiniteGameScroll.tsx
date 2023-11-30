import { createInfiniteScroll } from "@solid-primitives/pagination";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
  untrack,
} from "solid-js";
import { Link } from "./Link";

type Res = {
  id: number;
  title: string;
};

export default function InfiniteGameScroll() {
  const [userTerm, setUserTerm] = createSignal("");
  const [response, setRes] = createSignal([]);
  const [limit, setLimit] = createSignal(20);
  const [offset, setOffset] = createSignal(0);
  let w: Worker;
  if (window.Worker) {
    w = new Worker(new URL("../services/cms/cms-worker.ts", import.meta.url));
    w.onmessage = function (ev) {
      const { id, res } = ev.data;
      if (res.errors) {
        console.error(...res.errors);
        return;
      }
      setRes(res.data.gamesByTitle);
    };
  }

  const fetcher = (page: number) => {
    return new Promise<Res[]>((resolve) => {
      if (page === 0) {
        resolve([]);
        return;
      }
      const tmp = userTerm();
      if (tmp.length < 2) return;
      setOffset((prev) => prev + limit());
      w.postMessage({
        cmd: "game",
        title: tmp,
        limit: limit(),
        offset: offset(),
      });
      setTimeout(() => {
        resolve(response());
      }, 500);
    });
  };
  const [
    pages,
    infiniteScrollLoader,
    { end, setEnd, page, setPage, setPages },
  ] = createInfiniteScroll(fetcher);

  createMemo(() => {
    const tmp = userTerm();
    if (tmp.length < 2) {
      setPages([]);
      setEnd(true);
      setPage(0);
      return;
    }
    setPage(0);
    w.postMessage({
      cmd: "game",
      title: tmp,
      limit: untrack(() => limit()),
      offset: untrack(() => offset()),
    });
  });

  createEffect(() => {
    if (page() !== 0) return;
    const tmp = response();
    if (!tmp) {
      setPages([]);
      setEnd(true);
      setPage(0);
      return;
    } else {
      setPages(tmp);
    }
    if (tmp.length === 0) {
      setEnd(true);
      setPage(0);
    } else {
      if (tmp.length === untrack(() => limit())) {
        setEnd(false);
      } else {
        setEnd(true);
      }
      setPage(0);
    }
  });

  const validate = (s: string) =>
    /^[^\~\`\!\@\#\$\%\^\&\*\(\)\<\>\/\?\:\;\'\"\*\+\=]+$/.test(s);

  return (
    <div class="grid grid-flow-row gap-2 justify-center items-center my-4">
      <div class="w-full lg:w-9/12">
        <label for="limt-select">Games per page: </label>
        <select
          name="limits"
          id="limit-select"
          onChange={(ev) => {
            setLimit(parseInt(ev.currentTarget.value));
          }}
        >
          <option value="10">10</option>
          <option value="20" selected>
            20
          </option>
          <option value="40">40</option>
          <option value="80">80</option>
          <option value="160">160</option>
        </select>
        <input
          id="search-input"
          class="bg-white dark:bg-gray-300 float-right w-[80vw] lg:w-[20vw] h-[5vh] rounded-full placeholder:pl-1 pl-4"
          type="text"
          minLength="2"
          maxLength="12"
          placeholder="Search..."
          onChange={(ev) => {
            if (!validate(ev.currentTarget.value)) {
              ev.currentTarget.reportValidity();
              return;
            }
            setOffset(0);
            setUserTerm(ev.currentTarget.value);
          }}
          onInput={(ev) => {
            if (!validate(ev.currentTarget.value)) {
              ev.currentTarget.setCustomValidity(
                "Please only use Alphanumeric characters",
              );
              ev.currentTarget.reportValidity();
              return;
            }
            ev.currentTarget.setCustomValidity("");
          }}
        />
      </div>
      <div class="grid grid-flow-row gap-2 justify-center items-center w-[80vw] overflow-visible">
        <For each={pages()} fallback={<p class="text-center">No Results</p>}>
          {(item) => (
            <div class="bg-slate-300 dark:bg-slate-600 rounded-md">
              <Link href={"/game/" + item.id} title={item.title} />
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

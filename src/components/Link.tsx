import type { Component, JSX } from "solid-js";
export const Link: Component<JSX.LinkHTMLAttributes<HTMLLinkElement>> = (
  props,
) => (
  <>
    <a href={props.href}>
      <h4 class="text-grey px-1 text-2xl font-bold dark:text-white">
        {props.title}
      </h4>
    </a>
  </>
);

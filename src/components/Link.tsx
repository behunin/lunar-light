import type { Component, JSX } from "solid-js";
export const Link: Component<JSX.LinkHTMLAttributes<HTMLLinkElement>> = (
  props,
) => (
  <>
    <a href={props.href}>
      <h4 class="text-2xl text-grey dark:text-white font-bold px-1">
        {props.title}
      </h4>
    </a>
  </>
);

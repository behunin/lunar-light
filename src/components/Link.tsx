import type { Component, JSX } from "solid-js";
export const Link: Component<JSX.LinkHTMLAttributes<HTMLLinkElement>> = (
  props,
) => (
  <>
    <a href={props.href}>
      <h4 class="px-1 text-2xl font-bold">{props.title}</h4>
    </a>
  </>
);

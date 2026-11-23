import type { ParentProps } from "solid-js";
import { HydrationScript } from "@solidjs/web";
import { basePath } from "./utils/base";

// Two design proposals share one DOM. Runs before first paint: `?v=a|b` picks
// one and remembers it; without JS the server default (A) stays.
const designInit = `(function(){try{var q=new URLSearchParams(location.search).get("v");if(q==="a"||q==="b")localStorage.setItem("simax_design",q);var d=q||localStorage.getItem("simax_design");if(d==="b")document.documentElement.setAttribute("data-design","b")}catch(e){}})()`;

export default function Document(props: ParentProps) {
  return (
    <html lang="pl-PL" data-design="a">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#16181d" />
        <base href={`${basePath}/`} />
        <link rel="icon" href="favicon.svg" type="image/svg+xml" />
        <script innerHTML={designInit} />
        <HydrationScript />
      </head>
      <body>
        <div id="app">{props.children}</div>
      </body>
    </html>
  );
}

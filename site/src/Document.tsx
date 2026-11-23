import type { ParentProps } from "solid-js";
import { HydrationScript } from "@solidjs/web";
import { basePath } from "./utils/base";

// Two design proposals share one DOM. Runs before first paint: `?v=a|b` picks
// one and remembers it; without JS the server default (A) stays.
const designInit = `(function(){try{var q=new URLSearchParams(location.search).get("v");if(q==="a"||q==="b"||q==="c"||q==="d")localStorage.setItem("simax_design",q);var d=q||localStorage.getItem("simax_design");if(d==="b"||d==="c"||d==="d")document.documentElement.setAttribute("data-design",d)}catch(e){}})()`;

// Cross-document view transitions: only the card that leads to (or came from) a
// product page gets a name, so just that photo morphs into the product gallery
// (or back on history navigation). Everything else crossfades.
const cardMorph = `(function(){function slug(u){var m=u&&new URL(u).pathname.match(/\\/produkty\\/([^/]+)\\/?$/);return m&&m[1]}function tag(s){if(!s)return;var c=document.querySelectorAll('[data-vt="'+s+'"]');for(var i=0;i<c.length;i++)if(c[i].getClientRects().length){c[i].style.viewTransitionName="p-"+s;return}}addEventListener("pageswap",function(e){if(e.viewTransition&&e.activation)tag(slug(e.activation.entry.url))});addEventListener("pagereveal",function(e){if(e.viewTransition&&navigation.activation&&navigation.activation.from)tag(slug(navigation.activation.from.url))})})()`;

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
        <script innerHTML={cardMorph} />
        <HydrationScript />
      </head>
      <body>
        <div id="app">{props.children}</div>
      </body>
    </html>
  );
}
